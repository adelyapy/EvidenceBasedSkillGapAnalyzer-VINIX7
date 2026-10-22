import "server-only";
import type { IngestionInput, NormalizedProject } from "@/types/ingestion";
import { readGithubRepository, type GithubReaderOptions } from "./github-reader";
import { readZipProject, type ZipReaderOptions } from "./zip-reader";
import { IngestionError } from "./errors";

export async function ingestGithubRepository(url: string, options?: GithubReaderOptions): Promise<NormalizedProject> {
  return readGithubRepository(url, options);
}

export async function ingestZipProject(buffer: Buffer, filename: string, options?: ZipReaderOptions): Promise<NormalizedProject> {
  return readZipProject(buffer, filename, options);
}

/** Future adapters must preserve explicit unsupported-source behavior until implemented. */
export async function ingestProject(input: IngestionInput, options?: GithubReaderOptions): Promise<NormalizedProject> {
  if (!input || typeof input !== "object") throw new IngestionError("INVALID_INPUT");
  switch (input.sourceType) {
    case "github": return ingestGithubRepository(input.url, options);
    case "zip": return ingestZipProject(input.buffer, input.filename, options);
    default: throw new IngestionError("UNSUPPORTED_SOURCE");
  }
}
