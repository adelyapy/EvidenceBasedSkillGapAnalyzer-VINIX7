import "server-only";
import { z } from "zod";
import type { NormalizedProject } from "@/types/ingestion";
import { IngestionError } from "./errors";
import { comparePaths, decodeSafeText, isRelevantPath, normalizeProjectPath } from "./file-filter";
import { resolveLimits, type LimitOverrides } from "./limits";
import { normalizeProject } from "./project-normalizer";

const shaSchema = z.string().regex(/^[a-f0-9]{40}$/);
const metadataSchema = z.object({ private: z.boolean(), default_branch: z.string().min(1).max(255) });
const commitSchema = z.object({ sha: shaSchema, commit: z.object({ tree: z.object({ sha: shaSchema }) }) });
const treeEntrySchema = z.object({
  path: z.string().max(512), type: z.enum(["blob", "tree", "commit"]),
  mode: z.string(), sha: shaSchema, size: z.number().int().nonnegative().optional(),
});
const treeSchema = z.object({ truncated: z.boolean(), tree: z.array(treeEntrySchema) });

export type GithubReaderOptions = { limits?: LimitOverrides; fetch?: typeof globalThis.fetch };

export function parseGithubRepositoryUrl(url: string): { owner: string; repo: string; reference: string } {
  if (typeof url !== "string" || url.length > 512) throw new IngestionError("INVALID_GITHUB_URL");
  // Validate the original spelling too: URL parsers can erase dot segments,
  // default ports, whitespace and other ambiguous input before validation.
  const match = /^https:\/\/github\.com\/([a-z0-9](?:[a-z0-9-]{0,37}[a-z0-9])?)\/([a-z0-9._-]{1,100})\/?$/i.exec(url);
  if (!match || match[1].includes("--")) throw new IngestionError("INVALID_GITHUB_URL");
  const repo = match[2].replace(/\.git$/i, "");
  if (!repo || [".", ".."].includes(repo)) throw new IngestionError("INVALID_GITHUB_URL");
  const parsed = new URL(url);
  if (parsed.hostname !== "github.com" || parsed.protocol !== "https:" || parsed.username || parsed.password || parsed.port) {
    throw new IngestionError("INVALID_GITHUB_URL");
  }
  return { owner: match[1], repo, reference: `https://github.com/${match[1]}/${repo}` };
}

/** Snapshot reader: never fetches a URL supplied in a GitHub response. */
export async function readGithubRepository(url: string, options: GithubReaderOptions = {}): Promise<NormalizedProject> {
  const { owner, repo, reference } = parseGithubRepositoryUrl(url);
  const limits = resolveLimits(options.limits);
  const fetcher = options.fetch ?? globalThis.fetch;
  const base = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`;
  let requests = 0;

  async function request(path: string, maxBytes: number, raw = false): Promise<Buffer> {
    if (++requests > limits.maxGithubRequests) throw new IngestionError("LIMIT_EXCEEDED");
    const controller = new AbortController();
    let reader: ReadableStreamDefaultReader<Uint8Array> | undefined;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const timeout = new Promise<never>((_, reject) => {
      timer = setTimeout(() => {
        controller.abort();
        void reader?.cancel().catch(() => {});
        reject(new IngestionError("TIMEOUT"));
      }, limits.networkTimeoutMs);
    });
    const operation = async () => {
      const response = await fetcher(`${base}${path}`, {
        method: "GET", redirect: "manual", signal: controller.signal,
        headers: {
          Accept: raw ? "application/vnd.github.raw+json" : "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28", "User-Agent": "BUKTIVA-Ingestion/2",
        },
      });
      if (controller.signal.aborted) { void response.body?.cancel().catch(() => {}); throw new IngestionError("TIMEOUT"); }
      if (response.status !== 200 || response.redirected) {
        void response.body?.cancel().catch(() => {});
        if (response.status === 404) throw new IngestionError("NOT_FOUND");
        if (response.status === 429 || (response.status === 403 &&
            (response.headers.get("x-ratelimit-remaining") === "0" || response.headers.has("retry-after")))) {
          throw new IngestionError("RATE_LIMITED");
        }
        if (response.status === 403) throw new IngestionError("GITHUB_FORBIDDEN");
        throw new IngestionError("UPSTREAM_ERROR");
      }
      const cap = Math.min(maxBytes, limits.maxResponseBytes);
      const declared = response.headers.get("content-length");
      if (declared && (!/^\d+$/.test(declared) || Number(declared) > cap)) {
        void response.body?.cancel().catch(() => {});
        throw new IngestionError("LIMIT_EXCEEDED");
      }
      if (!response.body) throw new IngestionError("INVALID_RESPONSE");
      reader = response.body.getReader();
      const chunks: Uint8Array[] = [];
      let size = 0;
      while (true) {
        const chunk = await reader.read();
        if (chunk.done) break;
        size += chunk.value.byteLength;
        if (size > cap) throw new IngestionError("LIMIT_EXCEEDED");
        chunks.push(chunk.value);
      }
      return Buffer.concat(chunks, size);
    };
    try {
      return await Promise.race([operation(), timeout]);
    } catch (error) {
      if (error instanceof IngestionError) throw error;
      throw new IngestionError(controller.signal.aborted ? "TIMEOUT" : "NETWORK_ERROR");
    } finally {
      clearTimeout(timer);
      controller.abort();
      void reader?.cancel().catch(() => {});
    }
  }

  async function json<T>(path: string, schema: z.ZodType<T>, maxBytes: number): Promise<T> {
    const bytes = await request(path, maxBytes);
    try {
      const result = schema.safeParse(JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes)));
      if (result.success) return result.data;
    } catch { /* Do not expose JSON parser details or response content. */ }
    throw new IngestionError("INVALID_RESPONSE");
  }

  const metadata = await json("", metadataSchema, 64 * 1024);
  if (metadata.private) throw new IngestionError("PRIVATE_REPOSITORY");
  const commit = await json(`/commits/${encodeURIComponent(metadata.default_branch)}`, commitSchema, 128 * 1024);
  const tree = await json(`/git/trees/${commit.commit.tree.sha}?recursive=1`, treeSchema, limits.maxResponseBytes);
  if (tree.truncated) throw new IngestionError("TRUNCATED_TREE");
  if (tree.tree.length > limits.maxTreeEntries) throw new IngestionError("LIMIT_EXCEEDED");

  const entries = tree.tree.filter((entry) => entry.type !== "tree");
  // Check every returned path before selecting files, including excluded paths.
  const candidates = entries.map((entry) => ({ ...entry, path: normalizeProjectPath(entry.path) }))
    .filter((entry) => entry.type === "blob" && ["100644", "100755"].includes(entry.mode) &&
      entry.size !== undefined && entry.size <= limits.maxFileBytes && isRelevantPath(entry.path))
    .sort((a, b) => comparePaths(a.path, b.path));
  const files: { path: string; content: string }[] = [];
  const warnings = new Set<string>();
  let contentBytes = 0;
  let blobRequests = 0;
  const seen = new Set<string>();
  for (const entry of candidates) {
    if (seen.has(entry.path)) { warnings.add("DUPLICATE_PATH_SKIPPED"); continue; }
    seen.add(entry.path);
    if (files.length >= limits.maxIncludedFiles || blobRequests >= limits.maxGithubRequests - 3) {
      warnings.add("OUTPUT_LIMIT_REACHED"); break;
    }
    if (contentBytes + entry.size! > limits.maxContentBytes) { warnings.add("OUTPUT_LIMIT_REACHED"); continue; }
    blobRequests++;
    const bytes = await request(`/git/blobs/${entry.sha}`, limits.maxFileBytes, true);
    if (bytes.length !== entry.size) throw new IngestionError("INVALID_RESPONSE");
    const content = decodeSafeText(bytes);
    if (content === undefined) { warnings.add("UNSAFE_OR_IRRELEVANT_FILE_SKIPPED"); continue; }
    files.push({ path: entry.path, content });
    contentBytes += Buffer.byteLength(content);
  }
  return normalizeProject({
    sourceType: "github", projectName: repo, sourceReference: reference, revision: commit.sha,
    discoveredFiles: entries.length, files, warnings: [...warnings],
  }, options.limits);
}
