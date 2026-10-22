export const extractionErrorMessages = {
  INVALID_ANALYSIS_INPUT: "AnalysisInput tidak valid.",
  ROLE_NOT_SUPPORTED: "Rubrik untuk target role belum tersedia.",
  DATASET_INVALID: "Dataset rubrik tidak lolos validasi.",
  RUBRIC_NOT_FOUND: "Rubrik salah satu skill resmi belum tersedia.",
  BENCHMARK_LIMIT_EXCEEDED: "Daftar skill melampaui batas ekstraksi MVP.",
  NO_SAFE_EVIDENCE: "Tidak ada bukti aman yang dapat diproses.",
  INVALID_EVIDENCE_LIMITS: "Batas evidence tidak valid.",
  PROMPT_LIMIT_EXCEEDED: "Prompt melampaui batas ukuran.",
  INVALID_MODEL_OUTPUT: "Struktur output provider tidak valid.",
  INVALID_EVIDENCE_REFERENCE: "Referensi bukti output tidak dapat diverifikasi.",
  INVALID_SKILL_ID: "Output memuat identitas skill tidak resmi atau tidak lengkap.",
  DUPLICATE_SKILL: "Output memuat skill duplikat.",
  UNSUPPORTED_IMPLEMENTATION_CLAIM: "Klaim implementasi tidak didukung referensi source yang memadai.",
  PROVIDER_FAILURE: "Provider tidak dapat menyelesaikan ekstraksi.",
} as const;
export type ExtractionErrorCode = keyof typeof extractionErrorMessages;
export class ExtractionError extends Error {
  constructor(public readonly code: ExtractionErrorCode) {
    super(extractionErrorMessages[code]);
    this.name="ExtractionError";
  }
}
