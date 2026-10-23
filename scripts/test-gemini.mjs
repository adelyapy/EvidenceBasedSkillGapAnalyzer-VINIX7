import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("GEMINI_API_KEY belum diatur");
}

const ai = new GoogleGenAI({
  apiKey,
  vertexai: false,
  httpOptions: { timeout: 30_000, retryOptions: { attempts: 1 } },
});

async function testGemini() {
  try {
    const response = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL || "gemini-3.8-flash",
      contents: `
        Kamu adalah AI untuk aplikasi BUKTIVA,
        sebuah Evidence-Based Skill Gap Analyzer.

        Sebutkan 3 keterampilan penting
        untuk seorang Frontend Developer.
        Jawab singkat dalam bahasa Indonesia.
      `,
    });

    if (!response.text?.trim()) {
      console.error("Gemini tidak mengembalikan respons teks.");
      process.exitCode = 1;
      return;
    }
    console.log("Respons Gemini:");
    console.log(response.text);
  } catch (error) {
    // Pesan SDK mentah dapat memuat detail request; cukup tampilkan status aman.
    const status = Number.isInteger(error?.status) ? error.status : "jaringan/konfigurasi";
    console.error(`Koneksi Gemini gagal (status: ${status}). Periksa key, model, kuota, dan koneksi.`);
    process.exitCode = 1;
  }
}

testGemini();
