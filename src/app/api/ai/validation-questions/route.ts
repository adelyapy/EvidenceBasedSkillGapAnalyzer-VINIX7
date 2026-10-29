
import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type Evidence = {
  id: string;
  evidence_type: string;
  title: string | null;
  url: string | null;
  description: string | null;
  storage_path: string | null;
};

type GeneratedQuestion = {
  question: string;
  evidenceContext: string;
};

type SavedQuestion = {
  id: string;
  analysis_id: string;
  user_id: string;
  question_order: number;
  question_text: string;
  evidence_context: string | null;
};

const QUESTION_COUNT = 5;
const MAX_AI_ATTEMPTS = 3;

function jsonError(message: string, status: number) {
  return NextResponse.json(
    { success: false, message },
    { status }
  );
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const MAX_PDF_SIZE = 10 * 1024 * 1024;
const MAX_PDF_TEXT = 20000;

async function readStoredPdf(
  supabase: Awaited<ReturnType<typeof createClient>>,
  evidence: Evidence,
  userId: string,
): Promise<string> {
  if (!evidence.storage_path) {
    throw new Error(`Lokasi PDF "${evidence.title ?? ""}" tidak tersedia.`);
  }

  // Pastikan path berada di folder milik pengguna yang sedang login.
  const expectedPrefix = `${userId}/`;

  if (!evidence.storage_path.startsWith(expectedPrefix)) {
    throw new Error("Lokasi PDF tidak sesuai dengan pemilik analisis.");
  }

  const { data: file, error } = await supabase.storage
    .from("project-evidences")
    .download(evidence.storage_path);

  if (error || !file) {
    console.error("PDF Storage download failed:", error?.message);
    throw new Error(
      `PDF "${evidence.title ?? ""}" tidak dapat diambil dari penyimpanan.`,
    );
  }

  if (file.size === 0 || file.size > MAX_PDF_SIZE) {
    throw new Error("Ukuran PDF kosong atau melebihi batas 10 MiB.");
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  // Periksa signature PDF sebelum parser dijalankan.
  if (buffer.subarray(0, 5).toString("ascii") !== "%PDF-") {
    throw new Error(`File "${evidence.title ?? ""}" bukan PDF yang valid.`);
  }

  const pdfModule = await import("pdf-parse");
  const pdf = pdfModule.default;
  const parsed = await pdf(buffer);
  const text = parsed.text.trim();

  if (!text) {
    throw new Error(
      `PDF "${evidence.title ?? ""}" tidak memiliki teks yang dapat dibaca. PDF hasil scan memerlukan OCR.`,
    );
  }

  return text.slice(0, MAX_PDF_TEXT);
}

function isDuplicateError(error: { code?: string }) {
  return error.code === "23505";
}

async function readPublicGithubRepository(url: string) {
  try {
    const parsed = new URL(url);

    if (
      parsed.protocol !== "https:" ||
      parsed.hostname !== "github.com"
    ) {
      return null;
    }

    const segments = parsed.pathname
      .split("/")
      .filter(Boolean);

    if (segments.length < 2) return null;

    const owner = segments[0];
    const repository = segments[1].replace(/\.git$/, "");

    if (
      !/^[a-zA-Z0-9-]+$/.test(owner) ||
      !/^[a-zA-Z0-9_.-]+$/.test(repository)
    ) {
      return null;
    }

    const apiUrl =
      `https://api.github.com/repos/` +
      `${encodeURIComponent(owner)}/` +
      `${encodeURIComponent(repository)}`;

    const headers = {
      Accept: "application/vnd.github+json",
      "User-Agent": "BUKTIVA-SkillGapAnalyzer",
    };

    const repoResponse = await fetch(apiUrl, {
      headers,
      signal: AbortSignal.timeout(10000),
      cache: "no-store",
    });

    if (!repoResponse.ok) return null;

    const repo = await repoResponse.json();

    const readmeResponse = await fetch(
      `${apiUrl}/readme`,
      {
        headers,
        signal: AbortSignal.timeout(10000),
        cache: "no-store",
      }
    );

    let readme = "";

    if (readmeResponse.ok) {
      const readmeData = await readmeResponse.json();

      if (
        readmeData.encoding === "base64" &&
        typeof readmeData.content === "string"
      ) {
        readme = Buffer.from(
          readmeData.content,
          "base64"
        ).toString("utf8");
      }
    }

    return {
      name: String(repo.full_name ?? `${owner}/${repository}`),
      description: String(repo.description ?? ""),
      language: String(repo.language ?? ""),
      topics: Array.isArray(repo.topics)
        ? repo.topics.join(", ")
        : "",
      readme: readme.slice(0, 16000),
    };
  } catch (error) {
    console.error(
      "GitHub evidence fetch failed:",
      error instanceof Error ? error.message : "Unknown error"
    );

    return null;
  }
}

async function generateQuestions(
  model: string,
  apiKey: string,
  targetRole: string,
  evidences: Evidence[],
  pdfContents: Array<{ title: string; text: string }>
): Promise<{
  questions: GeneratedQuestion[];
  evidenceVerified: boolean;
}> {
  const repositoryDetails: Array<{
    url: string;
    details: NonNullable<
      Awaited<ReturnType<typeof readPublicGithubRepository>>
    >;
  }> = [];

  for (const evidence of evidences) {
    if (
      evidence.evidence_type === "github" &&
      evidence.url
    ) {
      const details = await readPublicGithubRepository(
        evidence.url
      );

      if (details) {
        repositoryDetails.push({
          url: evidence.url,
          details,
        });
      }
    }
  }

  const evidenceVerified = repositoryDetails.length > 0;

  const evidenceContext = evidences.map((evidence) => ({
    type: evidence.evidence_type,
    title: evidence.title,
    url: evidence.url,
    description: evidence.description,
  }));

  const pdfContext = pdfContents.map((item) => ({
  title: item.title,
  text: item.text,
}));

  const prompt = `
Kamu adalah AI evaluator untuk BUKTIVA, aplikasi analisis
kesenjangan kompetensi berbasis bukti proyek.

Target role pengguna:
${targetRole}

Data bukti proyek yang tersimpan:
${JSON.stringify(evidenceContext, null, 2)}

Isi dokumen PDF yang berhasil dibaca:
${JSON.stringify(pdfContext, null, 2)}

Data repositori publik yang berhasil dibaca:
${JSON.stringify(repositoryDetails, null, 2)}

TUGAS:
Buat tepat ${QUESTION_COUNT} pertanyaan validasi yang berbeda,
spesifik terhadap bukti proyek yang benar-benar tersedia dan
relevan dengan target role pengguna.

ATURAN:
1. Gunakan bahasa Indonesia yang jelas dan natural.
2. Pertanyaan harus membantu memverifikasi kontribusi,
   pemahaman teknis, keputusan implementasi, pengujian,
   atau kendala nyata pada proyek.
3. Jika bukti mengungkap teknologi tertentu, pertanyaan boleh
   menyinggung teknologi tersebut.
4. Jangan menganggap pengguna mengerjakan semua bagian proyek.
   Minta pengguna menjelaskan kontribusi pribadinya.
5. Jangan mengarang isi repositori, kode, pengalaman, atau hasil.
6. Jika bukti terbatas, tanyakan hal yang dapat dijelaskan
   pengguna tanpa mengasumsikan fakta yang tidak tersedia.
7. Setiap evidenceContext harus menjelaskan alasan pertanyaan
   berkaitan dengan bukti yang tersedia. Jika bukti tidak cukup,
   nyatakan keterbatasannya.
8. Jangan menghasilkan jawaban atas nama pengguna.
9. Hindari lima pertanyaan yang mengulang hal yang sama.

KELUARAN:
Kembalikan JSON valid saja, tanpa markdown dan tanpa teks lain,
dengan bentuk:
{
  "questions": [
    {
      "question": "Teks pertanyaan",
      "evidenceContext": "Konteks bukti dan alasan pertanyaan"
    }
  ]
}

Pastikan jumlah pertanyaan tepat ${QUESTION_COUNT}.
`;

  const ai = new GoogleGenAI({ apiKey });
  let lastError: unknown;

  for (let attempt = 1; attempt <= MAX_AI_ATTEMPTS; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.3,
        },
      });

      const output = response.text;

      if (!output) {
        throw new Error("Gemini mengembalikan keluaran kosong.");
      }

      const parsed: unknown = JSON.parse(output);

      if (
        !parsed ||
        typeof parsed !== "object" ||
        !("questions" in parsed) ||
        !Array.isArray(parsed.questions)
      ) {
        throw new Error("Format keluaran pertanyaan AI tidak valid.");
      }

      const questions = parsed.questions
        .map((item: unknown) => {
          if (!item || typeof item !== "object") return null;

          const record = item as Record<string, unknown>;

          if (
            typeof record.question !== "string" ||
            !record.question.trim() ||
            typeof record.evidenceContext !== "string"
          ) {
            return null;
          }

          return {
            question: record.question.trim(),
            evidenceContext: record.evidenceContext.trim(),
          };
        })
        .filter(
          (item): item is GeneratedQuestion => item !== null
        );

      if (questions.length !== QUESTION_COUNT) {
        throw new Error(
          `AI menghasilkan ${questions.length} pertanyaan valid; ` +
          `dibutuhkan tepat ${QUESTION_COUNT}.`
        );
      }

      return { questions, evidenceVerified };
    } catch (error) {
      lastError = error;

      console.error(
        `Gemini question generation attempt ${attempt}/${MAX_AI_ATTEMPTS} failed:`,
        error instanceof Error ? error.message : "Unknown error"
      );

      if (attempt < MAX_AI_ATTEMPTS) {
        await sleep(attempt * 1500);
      }
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("Gagal membuat pertanyaan dengan Gemini.");
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return jsonError(
        "Silakan login terlebih dahulu.",
        401
      );
    }

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return jsonError("Format request tidak valid.", 400);
    }

    if (
      !body ||
      typeof body !== "object" ||
      !("analysisId" in body) ||
      typeof body.analysisId !== "string" ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        body.analysisId
      )
    ) {
      return jsonError("ID analisis tidak valid.", 400);
    }

    const analysisId = body.analysisId;

    const { data: analysis, error: analysisError } =
      await supabase
        .from("analyses")
        .select("id, user_id, target_role")
        .eq("id", analysisId)
        .eq("user_id", user.id)
        .maybeSingle();

    if (analysisError) {
      console.error("Analysis lookup failed:", analysisError.message);
      return jsonError("Gagal memeriksa data analisis.", 500);
    }

    if (!analysis) {
      return jsonError(
        "Analisis tidak ditemukan atau tidak dapat diakses.",
        404
      );
    }

    // Jika pertanyaan sudah tersimpan, gunakan kembali.
    const { data: existingQuestions, error: existingError } =
      await supabase
        .from("validation_questions")
        .select(
          "id, analysis_id, user_id, question_order, question_text, evidence_context"
        )
        .eq("analysis_id", analysisId)
        .eq("user_id", user.id)
        .order("question_order", { ascending: true });

    if (existingError) {
      console.error(
        "Existing question lookup failed:",
        existingError.message
      );
      return jsonError(
        "Gagal memeriksa pertanyaan yang sudah tersimpan.",
        500
      );
    }

    if (existingQuestions && existingQuestions.length > 0) {
      if (existingQuestions.length !== QUESTION_COUNT) {
        return jsonError(
          "Pertanyaan yang tersimpan belum lengkap. " +
          "Periksa data analisis sebelum mencoba ulang.",
          409
        );
      }

      return NextResponse.json({
        success: true,
        message: "Pertanyaan validasi sudah tersedia.",
        model: process.env.GEMINI_MODEL ?? "gemini-3.8-flash",
        evidenceVerified: true,
        questions: existingQuestions.map((question) => ({
          id: question.id,
          question_order: question.question_order,
          question_text: question.question_text,
          evidence_context: question.evidence_context,
        })),
      });
    }

    const { data: evidences, error: evidenceError } =
      await supabase
        .from("project_evidences")
        .select(
          "id, evidence_type, title, url, description, storage_path"
        )
        .eq("analysis_id", analysisId)
        .eq("user_id", user.id);

    if (evidenceError) {
      console.error("Evidence lookup failed:", evidenceError.message);
      return jsonError("Gagal membaca bukti proyek.", 500);
    }

    if (!evidences || evidences.length === 0) {
      return jsonError(
        "Belum ada bukti proyek untuk dianalisis.",
        400
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    const model = process.env.GEMINI_MODEL;

    if (!apiKey || !model) {
      return jsonError(
        "Konfigurasi Gemini belum lengkap di server.",
        500
      );
    }

    const typedEvidences = evidences as Evidence[];

    const pdfContents: Array<{ title: string; text: string }> = [];

    for (const evidence of typedEvidences) {
      if (evidence.evidence_type !== "pdf") continue;

      const text = await readStoredPdf(
        supabase,
        evidence,
        user.id,
      );

      pdfContents.push({
        title: evidence.title ?? "Bukti PDF",
        text,
      });
    }

    const generated = await generateQuestions(
      model,
      apiKey,
      analysis.target_role,
      typedEvidences,
      pdfContents,
    );

    const rows = generated.questions.map((question, index) => ({
      analysis_id: analysisId,
      user_id: user.id,
      question_order: index + 1,
      question_text: question.question,
      evidence_context: question.evidenceContext,
    }));

    const { error: insertError } = await supabase
      .from("validation_questions")
      .insert(rows);

    if (insertError) {
      console.error(
        "Question insert failed:",
        insertError.message
      );

      // Request lain mungkin menyimpan pertanyaan bersamaan.
      if (isDuplicateError(insertError)) {
        const { data: concurrentQuestions, error: rereadError } =
          await supabase
            .from("validation_questions")
            .select(
              "id, analysis_id, user_id, question_order, question_text, evidence_context"
            )
            .eq("analysis_id", analysisId)
            .eq("user_id", user.id)
            .order("question_order", { ascending: true });

        if (
          !rereadError &&
          concurrentQuestions?.length === QUESTION_COUNT
        ) {
          return NextResponse.json({
            success: true,
            message: "Pertanyaan validasi sudah tersedia.",
            model,
            evidenceVerified: generated.evidenceVerified,
            questions: concurrentQuestions,
          });
        }
      }

      return jsonError(
        "Pertanyaan berhasil dibuat oleh AI, tetapi gagal disimpan.",
        500
      );
    }

    const { data: savedQuestions, error: savedError } =
      await supabase
        .from("validation_questions")
        .select(
          "id, analysis_id, user_id, question_order, question_text, evidence_context"
        )
        .eq("analysis_id", analysisId)
        .eq("user_id", user.id)
        .order("question_order", { ascending: true });

    if (savedError || !savedQuestions || savedQuestions.length !== QUESTION_COUNT) {
      console.error(
        "Saved questions verification failed:",
        savedError?.message ?? "Unexpected question count"
      );

      return jsonError(
        "Pertanyaan telah diproses, tetapi verifikasi penyimpanan gagal.",
        500
      );
    }

    return NextResponse.json({
      success: true,
      message: "Pertanyaan validasi berhasil dibuat.",
      model,
      evidenceVerified: generated.evidenceVerified,
      questions: savedQuestions,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error";

    console.error("Validation question generation failed:", message);

    const isTemporary =
      /503|UNAVAILABLE|high demand|overloaded|429|rate.?limit|timeout/i.test(
        message
      );

    return jsonError(
      isTemporary
        ? "Layanan AI sedang sibuk atau mencapai batas permintaan. Silakan coba lagi beberapa saat."
        : "Gagal membuat pertanyaan validasi. Periksa log terminal server.",
      502
    );
  }
}
