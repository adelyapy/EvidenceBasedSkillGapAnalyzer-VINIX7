export type IngestionErrorCode =
  | "INVALID_INPUT" | "INVALID_GITHUB_URL" | "UNSUPPORTED_SOURCE"
  | "NOT_FOUND" | "PRIVATE_REPOSITORY" | "RATE_LIMITED" | "GITHUB_FORBIDDEN"
  | "NETWORK_ERROR" | "TIMEOUT" | "UPSTREAM_ERROR" | "INVALID_RESPONSE"
  | "LIMIT_EXCEEDED" | "TRUNCATED_TREE" | "INVALID_ZIP"
  | "UNSAFE_PATH" | "UNSUPPORTED_ENTRY" | "NESTED_ARCHIVE";

const messages: Record<IngestionErrorCode, string> = {
  INVALID_INPUT: "Input ingestion tidak valid.",
  INVALID_GITHUB_URL: "Gunakan URL HTTPS repository publik pada github.com/owner/repository.",
  UNSUPPORTED_SOURCE: "Sumber ini belum didukung. Gunakan GitHub publik atau ZIP.",
  NOT_FOUND: "Repository publik tidak ditemukan atau tidak dapat diakses.",
  PRIVATE_REPOSITORY: "Repository privat tidak didukung.",
  RATE_LIMITED: "Batas permintaan GitHub tercapai. Coba lagi nanti.",
  GITHUB_FORBIDDEN: "GitHub menolak akses repository.",
  NETWORK_ERROR: "Koneksi GitHub gagal.",
  TIMEOUT: "Waktu tunggu GitHub habis.",
  UPSTREAM_ERROR: "GitHub tidak dapat memproses permintaan.",
  INVALID_RESPONSE: "Respons GitHub tidak sesuai kontrak.",
  LIMIT_EXCEEDED: "Sumber melampaui batas resource ingestion.",
  TRUNCATED_TREE: "Tree GitHub terpotong; cakupan repository tidak dapat dipastikan.",
  INVALID_ZIP: "ZIP tidak valid, korup, atau tidak dapat dibaca dengan aman.",
  UNSAFE_PATH: "Sumber berisi path yang tidak aman.",
  UNSUPPORTED_ENTRY: "ZIP berisi symlink, enkripsi, atau jenis entri yang tidak didukung.",
  NESTED_ARCHIVE: "Arsip bersarang tidak didukung.",
};

/** Never includes upstream error text, credentials, file contents or input URLs. */
export class IngestionError extends Error {
  constructor(public readonly code: IngestionErrorCode) {
    super(messages[code]);
    this.name = "IngestionError";
  }
}
