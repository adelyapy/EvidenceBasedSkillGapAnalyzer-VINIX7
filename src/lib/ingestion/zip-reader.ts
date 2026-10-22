import "server-only";
import { crc32 } from "node:zlib";
import { fromBufferPromise, type Entry, type ZipFile } from "yauzl";
import type { NormalizedProject } from "@/types/ingestion";
import { IngestionError } from "./errors";
import { comparePaths, decodeSafeText, hasArchiveMagic, isArchivePath, isRelevantPath, normalizeProjectPath } from "./file-filter";
import { resolveLimits, type LimitOverrides } from "./limits";
import { normalizeProject } from "./project-normalizer";

export type ZipReaderOptions = { limits?: LimitOverrides };

/** No extraction to disk. Caller must bound upload/storage reads before creating a Buffer. */
export async function readZipProject(buffer: Buffer, filename: string, options: ZipReaderOptions = {}): Promise<NormalizedProject> {
  const limits = resolveLimits(options.limits);
  if (!Buffer.isBuffer(buffer) || typeof filename !== "string" || !/^[^/\\:]+\.zip$/i.test(filename) || filename.length > 128) {
    throw new IngestionError("INVALID_INPUT");
  }
  normalizeProjectPath(filename);
  if (buffer.length > limits.maxZipBytes) throw new IngestionError("LIMIT_EXCEEDED");
  if (buffer.length < 4 || buffer[0] !== 0x50 || buffer[1] !== 0x4b ||
      !((buffer[2] === 3 && buffer[3] === 4) || (buffer[2] === 5 && buffer[3] === 6))) {
    throw new IngestionError("INVALID_ZIP");
  }

  let zip: ZipFile | undefined;
  try {
    zip = await fromBufferPromise(buffer, { lazyEntries: true, autoClose: false, validateEntrySizes: true, strictFileNames: false });
    if (zip.entryCount > limits.maxZipEntries) throw new IngestionError("LIMIT_EXCEEDED");
    const entries: { entry: Entry; path: string }[] = [];
    let count = 0;
    let declaredTotal = 0;
    let discoveredFiles = 0;
    for await (const entry of zip.eachEntry()) {
      if (++count > limits.maxZipEntries) throw new IngestionError("LIMIT_EXCEEDED");
      const path = normalizeProjectPath(entry.fileName);
      const mode = (entry.externalFileAttributes >>> 16) & 0xf000;
      if ((mode !== 0 && mode !== 0x8000 && mode !== 0x4000) || entry.isEncrypted() || ![0, 8].includes(entry.compressionMethod)) {
        throw new IngestionError("UNSUPPORTED_ENTRY");
      }
      if (isArchivePath(path)) throw new IngestionError("NESTED_ARCHIVE");
      if (entry.uncompressedSize > limits.maxEntryBytes || !Number.isSafeInteger(entry.uncompressedSize)) {
        throw new IngestionError("LIMIT_EXCEEDED");
      }
      declaredTotal += entry.uncompressedSize;
      if (declaredTotal > limits.maxUncompressedBytes) throw new IngestionError("LIMIT_EXCEEDED");
      if (entry.fileName.endsWith("/") || mode === 0x4000) {
        if (entry.uncompressedSize !== 0) throw new IngestionError("INVALID_ZIP");
        continue;
      }
      discoveredFiles++;
      if (entry.uncompressedSize <= limits.maxFileBytes && isRelevantPath(path)) entries.push({ entry, path });
    }
    if (count !== zip.entryCount) throw new IngestionError("INVALID_ZIP");
    entries.sort((a, b) => comparePaths(a.path, b.path) || a.entry.relativeOffsetOfLocalHeader - b.entry.relativeOffsetOfLocalHeader);
    const files: { path: string; content: string }[] = [];
    const warnings = new Set<string>();
    const seen = new Set<string>();
    let actualTotal = 0;
    let outputBytes = 0;
    for (const { entry, path } of entries) {
      if (seen.has(path)) { warnings.add("DUPLICATE_PATH_SKIPPED"); continue; }
      seen.add(path);
      if (files.length >= limits.maxIncludedFiles) { warnings.add("OUTPUT_LIMIT_REACHED"); break; }
      if (outputBytes + entry.uncompressedSize > limits.maxContentBytes) { warnings.add("OUTPUT_LIMIT_REACHED"); continue; }
      const stream = await zip.openReadStreamPromise(entry);
      const chunks: Buffer[] = [];
      let bytes = 0;
      let checksum = 0;
      try {
        for await (const value of stream) {
          const chunk: Buffer = Buffer.isBuffer(value) ? value : Buffer.from(value);
          bytes += chunk.length;
          actualTotal += chunk.length;
          if (bytes > limits.maxFileBytes || bytes > limits.maxEntryBytes || actualTotal > limits.maxUncompressedBytes) {
            throw new IngestionError("LIMIT_EXCEEDED");
          }
          checksum = crc32(chunk, checksum);
          chunks.push(chunk);
        }
      } finally { stream.destroy(); }
      if (bytes !== entry.uncompressedSize || checksum !== entry.crc32) throw new IngestionError("INVALID_ZIP");
      const contentBytes = Buffer.concat(chunks, bytes);
      if (hasArchiveMagic(contentBytes)) throw new IngestionError("NESTED_ARCHIVE");
      const content = decodeSafeText(contentBytes);
      if (content === undefined) { warnings.add("UNSAFE_OR_IRRELEVANT_FILE_SKIPPED"); continue; }
      files.push({ path, content });
      outputBytes += Buffer.byteLength(content);
    }
    return normalizeProject({
      sourceType: "zip", projectName: filename.replace(/\.zip$/i, ""), sourceReference: filename,
      discoveredFiles, files, warnings: [...warnings],
    }, options.limits);
  } catch (error) {
    if (error instanceof IngestionError) throw error;
    // Never forward library errors: they may include attacker-controlled paths.
    throw new IngestionError("INVALID_ZIP");
  } finally { zip?.close(); }
}
