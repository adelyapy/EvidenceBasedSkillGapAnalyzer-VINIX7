import "server-only";

import { ApiError, GoogleGenAI } from "@google/genai";
import { z } from "zod";

const configurationSchema = z.object({
  apiKey: z.string().trim().min(1),
  model: z.string().trim().min(1),
});

export class GeminiError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
    this.name = "GeminiError";
  }
}

/** Optional server-only structured-output settings; the one-argument M1 API is unchanged. */
export type GeminiTextOptions = {
  systemInstruction?: string;
  responseJsonSchema?: unknown;
  maxOutputTokens?: number;
  model?: string;
};

/** Server-side text transport. Business prompts belong to the caller. */
export async function generateGeminiText(prompt: string, options?: GeminiTextOptions): Promise<{
  model: string;
  result: string;
}> {
  // Read lazily: importing this module during a build requires no secrets.
  const configuration = configurationSchema.safeParse({
    apiKey: process.env.GEMINI_API_KEY,
    model: options?.model?.trim() || process.env.GEMINI_MODEL?.trim() || "gemini-3.8-flash",
  });

  if (!configuration.success) {
    throw new GeminiError("Konfigurasi Gemini server belum tersedia.", 500);
  }
  if (!prompt.trim()) {
    throw new GeminiError("Prompt pengujian tidak boleh kosong.", 400);
  }

  const { apiKey, model } = configuration.data;

  try {
    const ai = new GoogleGenAI({
      apiKey,
      vertexai: false,
      httpOptions: { timeout: 30_000, retryOptions: { attempts: 1 } },
    });
    const response = await ai.models.generateContent({ model, contents: prompt,
      ...(options ? { config: {
        systemInstruction: options.systemInstruction,
        maxOutputTokens: options.maxOutputTokens ?? 8192,
        ...(options.responseJsonSchema ? { responseMimeType: "application/json", responseJsonSchema: options.responseJsonSchema } : {}),
      } } : {}),
    });
    const result = response.text;
    if (!result?.trim()) {
      throw new GeminiError("Gemini tidak mengembalikan respons teks.", 502);
    }
    return { model, result };
  } catch (error: unknown) {
    if (error instanceof GeminiError) throw error;
    // M4 keeps the provider status for bounded retries/diagnostics, never its raw message.
    if (options?.responseJsonSchema && error instanceof ApiError && error.status >= 400 && error.status <= 599) {
      throw new GeminiError("Provider Gemini gagal memproses permintaan terstruktur.", error.status);
    }
    if (error instanceof ApiError && error.status === 429) {
      throw new GeminiError("Kuota atau batas permintaan Gemini tercapai. Coba lagi nanti.", 429);
    }
    if (
      (error instanceof ApiError && [408, 504].includes(error.status)) ||
      (error instanceof Error && ["AbortError", "TimeoutError"].includes(error.name))
    ) {
      throw new GeminiError("Waktu tunggu Gemini habis. Coba lagi nanti.", 504);
    }
    // Do not forward SDK messages, request headers, causes or stack traces.
    throw new GeminiError("Pemanggilan Gemini gagal. Periksa konfigurasi server, model, dan koneksi.", 502);
  }
}
