export const analysisErrorMessages = {
  UNAUTHENTICATED: "Sesi pengguna tidak valid atau belum tersedia.",
  ANALYSIS_NOT_FOUND: "Analisis tidak ditemukan.",
  INVALID_ANALYSIS_ID: "ID analisis tidak valid.",
  DATABASE_ERROR: "Data analisis tidak dapat dibaca dengan aman.",
  DATABASE_CONTRACT_ERROR: "Data backend belum sesuai kontrak pipeline.",
  DATA_LIMIT_EXCEEDED: "Data analisis melampaui batas pipeline.",
  SERVER_CONFIGURATION_ERROR: "Client server belum tersedia dalam konteks request yang valid.",
  ROLE_NOT_FOUND: "Target pekerjaan resmi tidak ditemukan.",
  ROLE_AMBIGUOUS: "Target pekerjaan tidak dapat dipetakan secara unik.",
  ROLE_INACTIVE: "Target pekerjaan resmi sedang tidak aktif.",
  BENCHMARK_NOT_CONFIGURED: "Benchmark target pekerjaan belum tersedia.",
  SKILL_NOT_FOUND: "Identitas skill benchmark belum lengkap.",
  INVALID_ANALYSIS_INPUT: "Input analisis tidak lolos validasi pipeline.",
} as const;

export type AnalysisErrorCode = keyof typeof analysisErrorMessages;
export class AnalysisError extends Error {
  constructor(public readonly code: AnalysisErrorCode) {
    super(analysisErrorMessages[code]);
    this.name = "AnalysisError";
  }
}
