import { GeminiError, generateGeminiText } from "@/lib/ai/gemini";

// Node.js is the default runtime. An explicit runtime export is incompatible
// with this project's cacheComponents configuration in Next.js 16.4.

const TEST_PROMPT = "Kamu adalah asisten AI untuk aplikasi BUKTIVA, sebuah Evidence-Based Skill Gap Analyzer. Sebutkan tiga keterampilan penting untuk Frontend Developer dalam bahasa Indonesia secara singkat.";

export async function POST() {
  // Also blocks preview/test environments; never call Gemini in production.
  if (process.env.NODE_ENV !== "development") {
    return Response.json({ success: false, error: "Endpoint tidak tersedia." }, { status: 404 });
  }

  try {
    const response = await generateGeminiText(TEST_PROMPT);
    return Response.json({ success: true, ...response }, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error: unknown) {
    return Response.json({
      success: false,
      error: error instanceof GeminiError ? error.message : "Pengujian Gemini gagal.",
    }, {
      status: error instanceof GeminiError ? error.status : 500,
      headers: { "Cache-Control": "no-store" },
    });
  }
}
