import { IngestionError } from "./errors";

/** Shared pure policy: schema and readers must agree; no schema dependency here. */
export function normalizeProjectPath(input: string): string {
  if (typeof input !== "string" || input.length === 0 || input.length > 512 ||
      /[\x00-\x1f\x7f\u202a-\u202e\u2066-\u2069:%<>"|?*]/u.test(input)) {
    throw new IngestionError("UNSAFE_PATH");
  }
  const value = input.replace(/\\/g, "/").normalize("NFC");
  if (value.startsWith("/") || value.split("/").includes("..")) throw new IngestionError("UNSAFE_PATH");
  const parts = value.split("/").filter((part) => part && part !== ".");
  if (!parts.length || parts.some((part) => /[. ]$/.test(part) || /^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(part))) {
    throw new IngestionError("UNSAFE_PATH");
  }
  return parts.join("/");
}

export function isCanonicalProjectPath(input: string): boolean {
  try { return normalizeProjectPath(input) === input; } catch { return false; }
}
