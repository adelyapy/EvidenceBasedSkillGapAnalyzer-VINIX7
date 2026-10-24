export function handleAIError(error: unknown): {
  status: string;
  message: string;
} {
  console.error("[AI System Error]:", error);

  if (error instanceof Error) {
    if (error.message.includes("Validasi Input Gagal")) {
      return { status: "invalid_input", message: error.message };
    }

    if (error.message.includes("timeout")) {
      return {
        status: "timeout",
        message: "Koneksi ke AI terlalu lama. Silakan coba lagi.",
      };
    }
  }

  return {
    status: "failed",
    message: "Terjadi kesalahan sistem saat memproses analisis AI.",
  };
}
