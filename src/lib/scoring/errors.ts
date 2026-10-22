import "server-only";
export class ScoringError extends Error {
  constructor(public readonly code: "INVALID_POLICY" | "UNTRUSTED_POLICY" | "INVALID_INPUT" | "ANALYSIS_MISMATCH" | "ROLE_MISMATCH" | "VERSION_MISMATCH" | "INVALID_SNAPSHOT" | "INVALID_OUTPUT" | "INVALID_LEVEL" | "INVALID_BENCHMARK") {
    super(`Scoring rejected: ${code}`); this.name = "ScoringError";
  }
}
