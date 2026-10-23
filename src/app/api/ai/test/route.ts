
import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    // Pastikan pengguna sudah login
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
        { status: 401 }
      );
    }

    // Ambil konfigurasi Gemini dari environment server
    const apiKey = process.env.GEMINI_API_KEY;
    const model = process.env.GEMINI_MODEL;

    if (!apiKey || !model) {
      return NextResponse.json(
        {
          success: false,
          message: "Konfigurasi Gemini belum lengkap di server.",
        },
        { status: 500 }
      );
    }

    // Hubungkan ke Gemini
    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model,
      contents:
        "Reply with exactly this text: BUKTIVA_AI_CONNECTION_OK",
    });

    const output = response.text?.trim();

    if (output !== "BUKTIVA_AI_CONNECTION_OK") {
      return NextResponse.json(
        {
          success: false,
          message: "Gemini merespons, tetapi hasil tes tidak sesuai.",
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Koneksi Gemini AI berhasil.",
      model,
    });
  } catch (error) {
    console.error(
      "Gemini connection test failed:",
      error instanceof Error ? error.message : "Unknown error"
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Tes Gemini gagal. Periksa konfigurasi server dan log terminal.",
      },
      { status: 502 }
    );
  }
}
