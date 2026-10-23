import "server-only";
import { normalizedProjectSchema, type NormalizedProject, type ProjectFile } from "@/types/ingestion";
import { comparePaths, decodeSafeText, detectLanguage, isRelevantPath, normalizeProjectPath, containsPossibleSecret } from "./file-filter";
import { resolveLimits, type LimitOverrides } from "./limits";
import { IngestionError } from "./errors";

export type NormalizationInput = {
  sourceType: "github" | "zip";
  projectName: string;
  sourceReference: string;
  revision?: string;
  discoveredFiles: number;
  files: { path: string; content: string }[];
  warnings?: string[];
};

export function normalizeProject(input: NormalizationInput, overrides?: LimitOverrides): NormalizedProject {
  const limits = resolveLimits(overrides);
  if (!Number.isSafeInteger(input.discoveredFiles) || input.discoveredFiles < input.files.length ||
      input.files.length > limits.maxTreeEntries || input.sourceReference.length > 512 ||
      containsPossibleSecret(input.sourceReference)) throw new IngestionError("INVALID_INPUT");

  const files: ProjectFile[] = [];
  const seen = new Set<string>();
  const warnings = new Set(input.warnings ?? []);
  const candidates = input.files.map((file) => ({ ...file, path: normalizeProjectPath(file.path) }))
    .sort((a, b) => comparePaths(a.path, b.path) || (a.content < b.content ? -1 : a.content > b.content ? 1 : 0));
  let totalContentBytes = 0;
  for (const file of candidates) {
    if (seen.has(file.path)) { warnings.add("DUPLICATE_PATH_SKIPPED"); continue; }
    seen.add(file.path);
    const sizeBytes = Buffer.byteLength(file.content, "utf8");
    if (!isRelevantPath(file.path) || sizeBytes > limits.maxFileBytes ||
        decodeSafeText(Buffer.from(file.content)) === undefined) {
      warnings.add("UNSAFE_OR_IRRELEVANT_FILE_SKIPPED"); continue;
    }
    if (files.length >= limits.maxIncludedFiles || totalContentBytes + sizeBytes > limits.maxContentBytes) {
      warnings.add("OUTPUT_LIMIT_REACHED"); continue;
    }
    files.push({ path: file.path, content: file.content, sizeBytes, language: detectLanguage(file.path) });
    totalContentBytes += sizeBytes;
  }
  const skippedFiles = input.discoveredFiles - files.length;
  if (skippedFiles) warnings.add("PARTIAL_PROJECT_FILES_SKIPPED");
  if (!files.length) warnings.add("NO_RELEVANT_FILES");
  const projectName = input.projectName.normalize("NFC").replace(/[^\p{L}\p{N}._ -]/gu, "-").trim().slice(0, 100) || "project";
  if (containsPossibleSecret(projectName)) throw new IngestionError("INVALID_INPUT");
  const result = normalizedProjectSchema.safeParse({
    sourceType: input.sourceType, projectName, sourceReference: input.sourceReference,
    ...(input.revision ? { revision: input.revision } : {}), files,
    stats: { discoveredFiles: input.discoveredFiles, includedFiles: files.length, skippedFiles, totalContentBytes },
    warnings: [...warnings].sort(), status: skippedFiles || !files.length ? "partial" : "complete",
  });
  if (!result.success) throw new IngestionError("INVALID_INPUT");
  return result.data;
}
