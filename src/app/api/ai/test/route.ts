import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { GeminiError, generateGeminiText } from "@/lib/ai/gemini";

const TEST_PROMPT = "Reply with exactly this text: BUKTIVA_AI_CONNECTION_OK";

export async function GET() {
  try {
    // Pastikan pengguna sudah login.
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          success: false,
          message: "Silakan login terlebih dahulu.",
        },
        {
          status: 401,
          headers: { "Cache-Control": "no-store" },
        },
      );
    }

    // Pengujian hanya tersedia di lingkungan development.
    if (process.env.NODE_ENV !== "development") {
      return NextResponse.json(
        {
          success: false,
          message: "Endpoint pengujian hanya tersedia di development.",
        },
        {
          status: 404,
          headers: { "Cache-Control": "no-store" },
        },
      );
    }

    // Gunakan helper Gemini bersama dari modul AI.
    const response = await generateGeminiText(TEST_PROMPT);

    if (response.result.trim() !== "BUKTIVA_AI_CONNECTION_OK") {
      return NextResponse.json(
        {
          success: false,
          message: "Gemini merespons, tetapi hasil tes tidak sesuai.",
        },
        {
          status: 502,
          headers: { "Cache-Control": "no-store" },
        },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Koneksi Gemini AI berhasil.",
        model: response.model,
      },
      {
        headers: { "Cache-Control": "no-store" },
      },
    );
  } catch (error: unknown) {
    const status = error instanceof GeminiError ? error.status : 502;

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof GeminiError
            ? error.message
            : "Tes Gemini gagal. Periksa konfigurasi server dan log terminal.",
      },
      {
        status,
        headers: { "Cache-Control": "no-store" },
      },
    );
  }
}
