import { supabaseAdmin } from "@/lib/supabase/admin";
import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const QUESTION_COUNT = 5;

type EvaluatedAnswer = {
  questionId: string;
  score: number;
  feedback: string;
};

type EvaluatedSkill = {
  skillName: string;
  currentLevel: number;
  requiredLevel: number;
  confidence: number;
  evidenceSummary: string;
  explanation: string;
  priority: "tinggi" | "sedang" | "rendah";
};

type EvaluationResult = {
  summary: string;
  answers: EvaluatedAnswer[];
  skills: EvaluatedSkill[];
};

type SkillGapPriority = "low" | "medium" | "high" | "critical";

function normalizePriority(value: unknown): SkillGapPriority {
  switch (
    String(value ?? "")
      .trim()
      .toLowerCase()
  ) {
    case "rendah":
    case "low":
      return "low";

    case "sedang":
    case "medium":
      return "medium";

    case "tinggi":
    case "high":
      return "high";

    case "critical":
      return "critical";

    default:
      throw new Error(`Nilai priority tidak valid: ${String(value)}`);
  }
}

function errorResponse(message: string, status: number) {
  return NextResponse.json({ success: false, message }, { status });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function validNumber(
  value: unknown,
  min: number,
  max: number,
): value is number {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value >= min &&
    value <= max
  );
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return errorResponse("Silakan login terlebih dahulu.", 401);
    }

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return errorResponse("Request tidak valid.", 400);
    }

    if (
      !isRecord(body) ||
      typeof body.analysisId !== "string" ||
      !/^[0-9a-f-]{36}$/i.test(body.analysisId)
    ) {
      return errorResponse("ID analisis tidak valid.", 400);
    }

    const analysisId = body.analysisId;

    const { data: analysis, error: analysisError } = await supabase
      .from("analyses")
      .select("id, user_id, target_role, status")
      .eq("id", analysisId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (analysisError) {
      console.error("Analysis lookup failed:", analysisError.message);
      return errorResponse("Gagal membaca analisis.", 500);
    }

    if (!analysis) {
      return errorResponse("Analisis tidak ditemukan.", 404);
    }

    if (analysis.status === "completed") {
      return errorResponse(
        "Analisis ini sudah selesai dan tidak perlu diproses ulang.",
        409,
      );
    }

    // Ambil pertanyaan yang benar-benar tersimpan.
    const { data: questions, error: questionError } = await supabase
      .from("validation_questions")
      .select("id, question_order, question_text, evidence_context")
      .eq("analysis_id", analysisId)
      .eq("user_id", user.id)
      .order("question_order", { ascending: true });

    if (questionError) {
      console.error("Question lookup failed:", questionError.message);
      return errorResponse("Gagal membaca pertanyaan validasi.", 500);
    }

    if (!questions || questions.length !== QUESTION_COUNT) {
      return errorResponse("Lima pertanyaan validasi belum tersedia.", 400);
    }

    const questionIds = questions.map((question) => question.id);

    const { data: answers, error: answerError } = await supabase
      .from("validation_answers")
      .select("id, question_id, answer_text")
      .eq("user_id", user.id)
      .in("question_id", questionIds);

    if (answerError) {
      console.error("Answer lookup failed:", answerError.message);
      return errorResponse("Gagal membaca jawaban validasi.", 500);
    }

    const answerByQuestion = new Map(
      (answers ?? []).map((answer) => [answer.question_id, answer]),
    );

    if (
      !answers ||
      answers.length !== QUESTION_COUNT ||
      questions.some(
        (question) =>
          !answerByQuestion.has(question.id) ||
          !answerByQuestion.get(question.id)?.answer_text.trim(),
      )
    ) {
      return errorResponse("Pastikan semua pertanyaan sudah dijawab.", 400);
    }

    // Ambil bukti proyek yang tersimpan.
    const { data: evidences, error: evidenceError } = await supabase
      .from("project_evidences")
      .select("evidence_type, title, url, description")
      .eq("analysis_id", analysisId)
      .eq("user_id", user.id);

    if (evidenceError) {
      console.error("Evidence lookup failed:", evidenceError.message);
      return errorResponse("Gagal membaca bukti proyek.", 500);
    }

    if (!evidences || evidences.length === 0) {
      return errorResponse("Bukti proyek tidak ditemukan.", 400);
    }

    // Cegah penambahan hasil ganda saat request diulang.
    const { data: existingSkills, error: existingSkillError } = await supabase
      .from("analysis_skill_results")
      .select("id")
      .eq("analysis_id", analysisId)
      .eq("user_id", user.id)
      .limit(1);

    const { data: existingGaps, error: existingGapError } = await supabase
      .from("skill_gaps")
      .select("id")
      .eq("analysis_id", analysisId)
      .eq("user_id", user.id)
      .limit(1);

    if (existingSkillError || existingGapError) {
      console.error(
        "Existing results lookup failed:",
        existingSkillError?.message ?? existingGapError?.message,
      );
      return errorResponse("Gagal memeriksa hasil analisis sebelumnya.", 500);
    }

    if ((existingSkills?.length ?? 0) > 0 || (existingGaps?.length ?? 0) > 0) {
      return errorResponse(
        "Hasil evaluasi sudah ada sebagian. Periksa data sebelum memproses ulang.",
        409,
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    const model = process.env.GEMINI_MODEL;

    if (!apiKey || !model) {
      return errorResponse("Konfigurasi Gemini belum lengkap.", 500);
    }

    const evaluationInput = {
      targetRole: analysis.target_role,
      evidence: evidences,
      validation: questions.map((question) => ({
        questionId: question.id,
        question: question.question_text,
        evidenceContext: question.evidence_context,
        answer: answerByQuestion.get(question.id)?.answer_text,
      })),
    };

    const prompt = `
Kamu adalah evaluator kompetensi untuk aplikasi BUKTIVA.

Nilai kesiapan pengguna untuk target role berdasarkan bukti
proyek dan jawaban validasi yang diberikan.

DATA:
${JSON.stringify(evaluationInput, null, 2)}

ATURAN PENILAIAN:
1. Jangan menganggap klaim pengguna sebagai bukti teknis yang
   sudah terverifikasi.
2. Bedakan bukti langsung, klaim pengguna, dan informasi yang
   belum dapat diverifikasi.
3. Bukti yang tidak tersedia bukan berarti pengguna tidak
   memiliki keterampilan.
4. currentLevel dan requiredLevel menggunakan skala 0–5:
   0 = belum ada bukti yang cukup untuk menilai,
   1 = dasar, 2 = pemula berkembang, 3 = mandiri,
   4 = mahir, 5 = sangat mahir.
5. Nilai confidence menggunakan skala 0–1.
6. Skor jawaban menggunakan skala 0–100. Nilai pemahaman
   berdasarkan relevansi, kekhususan, dan dukungan bukti.
   Jawaban singkat tidak otomatis berarti tidak kompeten.
7. Jangan mengarang teknologi, kontribusi, hasil, atau
   pengalaman yang tidak ada dalam data.
8. Buat daftar skill yang relevan dengan target role.
9. Setiap skill harus memiliki evidenceSummary dan explanation.
   Jelaskan keterbatasan bukti jika ada.
10. Priority harus "tinggi", "sedang", atau "rendah".
11. Sertakan tindakan konkret untuk menutup gap pada explanation.
    Jangan memberikan tautan atau daftar materi pembelajaran.
12. Kembalikan JSON valid saja.

STRUKTUR JSON:
{
  "summary": "Ringkasan hasil evaluasi dan keterbatasan bukti",
  "answers": [
    {
      "questionId": "ID pertanyaan dari input",
      "score": 0,
      "feedback": "Umpan balik atas jawaban"
    }
  ],
  "skills": [
    {
      "skillName": "Nama keterampilan",
      "currentLevel": 0,
      "requiredLevel": 3,
      "confidence": 0.5,
      "evidenceSummary": "Bukti yang mendukung penilaian",
      "explanation": "Penjelasan gap dan tindakan konkret",
      "priority": "tinggi"
    }
  ]
}

Sertakan satu item answers untuk setiap questionId yang diberikan.
Gunakan nama dan ID pertanyaan yang sama persis dari input.
`;

    const ai = new GoogleGenAI({ apiKey });

    let responseText = "";

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            temperature: 0.2,
          },
        });

        responseText = response.text ?? "";

        if (!responseText.trim()) {
          throw new Error("Gemini mengembalikan respons kosong.");
        }

        break;
      } catch (error) {
        console.error(
          `Evaluation attempt ${attempt}/3 failed:`,
          error instanceof Error ? error.message : "Unknown error",
        );

        if (attempt === 3) throw error;

        await new Promise((resolve) => setTimeout(resolve, attempt * 1500));
      }
    }

    let parsed: unknown;

    try {
      parsed = JSON.parse(responseText);
    } catch {
      return errorResponse("Format hasil evaluasi AI tidak valid.", 502);
    }

    if (
      !isRecord(parsed) ||
      typeof parsed.summary !== "string" ||
      !Array.isArray(parsed.answers) ||
      !Array.isArray(parsed.skills) ||
      parsed.skills.length === 0
    ) {
      return errorResponse("Struktur hasil evaluasi AI tidak valid.", 502);
    }

    const result = parsed as unknown as EvaluationResult;

    const expectedQuestionIds = new Set(questionIds);

    if (
      result.answers.length !== QUESTION_COUNT ||
      result.answers.some(
        (item) =>
          !isRecord(item) ||
          typeof item.questionId !== "string" ||
          !expectedQuestionIds.has(item.questionId) ||
          !validNumber(item.score, 0, 100) ||
          typeof item.feedback !== "string",
      ) ||
      new Set(result.answers.map((item) => item.questionId)).size !==
        QUESTION_COUNT
    ) {
      return errorResponse(
        "AI menghasilkan penilaian jawaban yang tidak lengkap atau tidak valid.",
        502,
      );
    }

    const validSkills = result.skills.every(
      (skill) =>
        isRecord(skill) &&
        typeof skill.skillName === "string" &&
        skill.skillName.trim().length > 0 &&
        validNumber(skill.currentLevel, 0, 5) &&
        validNumber(skill.requiredLevel, 0, 5) &&
        validNumber(skill.confidence, 0, 1) &&
        typeof skill.evidenceSummary === "string" &&
        typeof skill.explanation === "string" &&
        ["tinggi", "sedang", "rendah"].includes(skill.priority),
    );

    if (!validSkills) {
      return errorResponse(
        "AI menghasilkan data kompetensi yang tidak valid.",
        502,
      );
    }

    const { error: processingError } = await supabase
      .from("analyses")
      .update({
        status: "processing",
        updated_at: new Date().toISOString(),
      })
      .eq("id", analysisId)
      .eq("user_id", user.id);

    if (processingError) {
      console.error("Analysis status update failed:", processingError.message);
      return errorResponse("Gagal memperbarui status analisis.", 500);
    }

    const skillRows = result.skills.map((skill) => ({
      analysis_id: analysisId,
      user_id: user.id,
      skill_id: null,
      skill_name: skill.skillName,
      estimated_level: skill.currentLevel,
      confidence_score: skill.confidence,
      evidence_summary: skill.evidenceSummary,
    }));

    const gapRows = result.skills.map((skill) => ({
      analysis_id: analysisId,
      user_id: user.id,
      skill_id: null,
      skill_name: skill.skillName,
      current_level: skill.currentLevel,
      required_level: skill.requiredLevel,
      gap_score: Math.max(0, skill.requiredLevel - skill.currentLevel),
      priority: normalizePriority(skill.priority),
      explanation: skill.explanation,
    }));

    const { error: skillInsertError } = await supabaseAdmin
      .from("analysis_skill_results")
      .insert(skillRows);

    if (skillInsertError) {
      console.error("Skill result insert failed:", skillInsertError.message);
      await supabase
        .from("analyses")
        .update({ status: "failed" })
        .eq("id", analysisId)
        .eq("user_id", user.id);

      return errorResponse(
        "Gagal menyimpan hasil kompetensi. Periksa izin database.",
        500,
      );
    }

    const { error: gapInsertError } = await supabaseAdmin
      .from("skill_gaps")
      .insert(gapRows);

    if (gapInsertError) {
      console.error("Skill gap insert failed:", gapInsertError.message);
      await supabase
        .from("analyses")
        .update({ status: "failed" })
        .eq("id", analysisId)
        .eq("user_id", user.id);

      return errorResponse(
        "Hasil kompetensi tersimpan, tetapi skill gap gagal disimpan. Perlu pemulihan data sebelum mencoba ulang.",
        500,
      );
    }

    for (const answer of result.answers) {
      const savedAnswer = answerByQuestion.get(answer.questionId);

      if (!savedAnswer) {
        return errorResponse(
          "Jawaban tidak ditemukan saat menyimpan evaluasi.",
          500,
        );
      }

      const { error: updateAnswerError } = await supabase
        .from("validation_answers")
        .update({
          evaluated_score: answer.score,
          feedback: answer.feedback,
          updated_at: new Date().toISOString(),
        })
        .eq("id", savedAnswer.id)
        .eq("user_id", user.id);

      if (updateAnswerError) {
        console.error(
          "Answer evaluation update failed:",
          updateAnswerError.message,
        );

        await supabase
          .from("analyses")
          .update({ status: "failed" })
          .eq("id", analysisId)
          .eq("user_id", user.id);

        return errorResponse("Gagal menyimpan evaluasi jawaban.", 500);
      }
    }

    // Skor kesiapan dihitung dari level kompetensi terhadap kebutuhan.
    // Skill dengan level kebutuhan 0 tidak dimasukkan ke penyebut.
    const scoreSkills = result.skills.filter(
      (skill) => skill.requiredLevel > 0,
    );

    const readinessScore =
      scoreSkills.length === 0
        ? null
        : Math.round(
            (scoreSkills.reduce(
              (total, skill) =>
                total + Math.min(skill.currentLevel / skill.requiredLevel, 1),
              0,
            ) /
              scoreSkills.length) *
              100,
          );

    const { error: completeError } = await supabase
      .from("analyses")
      .update({
        readiness_score: readinessScore,
        summary: result.summary,
        status: "completed",
        updated_at: new Date().toISOString(),
      })
      .eq("id", analysisId)
      .eq("user_id", user.id);

    if (completeError) {
      console.error("Analysis completion failed:", completeError.message);
      return errorResponse(
        "Hasil evaluasi tersimpan, tetapi status akhir gagal diperbarui.",
        500,
      );
    }
    // === INTEGRASI ROADMAP (Blocking, Fail-safe) ===
    try {
      // 1. Ambil snapshot trusted
      const { data: analysisRow } = await supabase
        .from("analyses")
        .select("*")
        .eq("id", analysisId)
        .eq("user_id", user.id)
        .single();

      if (analysisRow) {
        // 2. Panggil generator
        const { generateLearningRoadmap } =
          await import("@/lib/roadmap/roadmap-service");
        const { persistRoadmap } =
          await import("@/lib/roadmap/persist-roadmap");

        // Pastikan scoring data tersedia di analysisRow (sesuaikan nama field dengan skema Anda)
        // Jika tidak ada di DB, Anda mungkin perlu me-reconstruct scoring dari `result` atau tabel lain.
        const rawScoring = analysisRow.scoring_data || {};

        const roadmap = generateLearningRoadmap(rawScoring, {
          analysisInput: analysisRow,
          skillExtraction: result,
          validationEvaluation: {}, // Sesuaikan jika ada variabel validasi
        });

        // 3. Simpan ke DB
        const { inserted } = await persistRoadmap(
          supabaseAdmin,
          roadmap,
          user.id,
        );
        console.log(
          `✅ Roadmap tersimpan: ${inserted} item (Status: ${roadmap.status})`,
        );
      }
    } catch (error) {
      // Fail-safe: Hanya log, JANGAN gagalkan response analisis
      console.error(
        "❌ Gagal generate/simpan roadmap (Analisis tetap sukses):",
        error,
      );
    }
    // === END INTEGRASI ROADMAP ===
    // === INTEGRASI ROADMAP (OPSI A) ===
    try {
      // 1. Query data gap & skill dari DB (data yang baru saja disimpan)
      const { data: dbGaps } = await supabase
        .from("skill_gaps")
        .select(
          "skill_name, current_level, required_level, gap_score, priority, explanation",
        )
        .eq("analysis_id", analysisId)
        .eq("user_id", user.id);

      const { data: dbSkills } = await supabase
        .from("analysis_skill_results")
        .select("skill_name, estimated_level, evidence_summary")
        .eq("analysis_id", analysisId)
        .eq("user_id", user.id);

      if (dbGaps && dbSkills) {
        const { generateRoadmapFromGaps } =
          await import("@/lib/roadmap/gap-based-generator");
        const { persistGapBasedRoadmap } =
          await import("@/lib/roadmap/roadmap-persistence");

        // 2. Generate items
        const roadmapItems = generateRoadmapFromGaps(
          analysisId,
          user.id,
          dbGaps,
          dbSkills,
        );

        // 3. Simpan secara idempotent
        if (roadmapItems.length > 0) {
          const { inserted } = await persistGapBasedRoadmap(
            supabaseAdmin,
            roadmapItems,
            analysisId,
            user.id,
          );
          console.log(`✅ Roadmap (Opsi A) tersimpan: ${inserted} item.`);
        } else {
          console.log(
            "ℹ️ Tidak ada gap yang perlu direkomendasikan (roadmap kosong).",
          );
        }
      }
    } catch (roadmapError) {
      // Fail-safe: Jangan gagalkan analisis utama
      console.error(
        "❌ Gagal generate/simpan roadmap (Analisis tetap sukses):",
        roadmapError,
      );
    }
    // === END INTEGRASI ROADMAP ===
    return NextResponse.json({
      success: true,
      message: "Evaluasi kompetensi berhasil disimpan.",
      analysisId,
      readinessScore,
      skillsEvaluated: skillRows.length,
      gapsEvaluated: gapRows.length,
    });
  } catch (error) {
    console.error(
      "Analysis evaluation failed:",
      error instanceof Error ? error.message : "Unknown error",
    );

    return errorResponse(
      "Evaluasi AI gagal. Periksa log terminal server.",
      502,
    );
  }
}
