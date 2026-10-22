import "server-only";

export type ValidationErrorCode = "INVALID_INPUT" | "ANALYSIS_MISMATCH" | "INVALID_SUBMISSION" | "UNTRUSTED_QUESTION" |
  "UNSAFE_ANSWER" | "RUBRIC_INVALID" | "VERSION_MISMATCH" | "EXTRACTION_NOT_READY" | "EXTRACTION_INVALID" |
  "INVALID_MAPPING" | "NO_SAFE_EVIDENCE" | "PROMPT_LIMIT_EXCEEDED" | "INVALID_MODEL_OUTPUT" | "PROVIDER_FAILURE";
export class ValidationError extends Error {
  constructor(public readonly code: ValidationErrorCode) { super(`Validation evaluation rejected: ${code}`); this.name = "ValidationError"; }
}
