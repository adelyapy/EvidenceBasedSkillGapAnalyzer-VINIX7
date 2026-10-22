import { IngestionError } from "./errors";

export const DEFAULT_INGESTION_LIMITS = Object.freeze({
  maxZipBytes: 10 * 1024 * 1024,
  maxUncompressedBytes: 25 * 1024 * 1024,
  maxZipEntries: 200,
  maxEntryBytes: 1024 * 1024,
  maxIncludedFiles: 40,
  maxFileBytes: 64 * 1024,
  maxContentBytes: 1024 * 1024,
  maxGithubRequests: 43,
  maxTreeEntries: 5000,
  maxResponseBytes: 2 * 1024 * 1024,
  networkTimeoutMs: 10_000,
});

export type IngestionLimits = { -readonly [K in keyof typeof DEFAULT_INGESTION_LIMITS]: number };
export type LimitOverrides = Partial<IngestionLimits>;

/** Callers may tighten limits; raising hard ceilings requires code/schema review. */
export function resolveLimits(overrides: LimitOverrides = {}): IngestionLimits {
  const limits: IngestionLimits = { ...DEFAULT_INGESTION_LIMITS };
  for (const key of Object.keys(overrides)) {
    if (!Object.hasOwn(limits, key)) throw new IngestionError("INVALID_INPUT");
    const name = key as keyof IngestionLimits;
    const value = overrides[name];
    if (typeof value !== "number" || !Number.isSafeInteger(value) || value <= 0 || value > limits[name]) {
      throw new IngestionError("INVALID_INPUT");
    }
    limits[name] = value;
  }
  return limits;
}
