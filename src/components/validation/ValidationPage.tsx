
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { analysisRoutes, analysisStorage } from "@/data/analysis";
import { createClient } from "@/lib/supabase/client";
import type { QuestionNumber } from "./questions";

type ValidationQuestion = {
  id: string;
  question_order: number;
  question_text: string;
  evidence_context: string | null;
};

function readAnswers(): Record<string, string> {
  try {
    const saved = sessionStorage.getItem(
      analysisStorage.validationAnswers
    );
    if (!saved) return {};

    const parsed: unknown = JSON.parse(saved);

    return parsed &&
      typeof parsed === "object" &&
      !Array.isArray(parsed)
      ? (parsed as Record<string, string>)
      : {};
  } catch {
    return {};
  }
}

export default function ValidationPage({
  step,
}: {
  step: QuestionNumber;
}) {
  const router = useRouter();

  const [answer, setAnswer] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [questions, setQuestions] = useState<ValidationQuestion[]>([]);

  const currentQuestion = questions[step - 1];
  const totalQuestions = questions.length;
  const progress = totalQuestions
    ? (step / totalQuestions) * 100
    : 0;

  useEffect(() => {
    let cancelled = false;

    async function loadQuestion() {
      setLoaded(false);
      setError("");

      try {
        const analysisId = sessionStorage.getItem(
          analysisStorage.activeAnalysisId
        );

        if (!analysisId) {
          throw new Error(
            "Analisis aktif tidak ditemukan. Silakan mulai analisis terlebih dahulu."
          );
        }

        const supabase = createClient();

        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          throw new Error("Sesi login berakhir. Silakan login kembali.");
        }

        const { data: analysis, error: analysisError } =
          await supabase
            .from("analyses")
            .select("id")
            .eq("id", analysisId)
            .eq("user_id", user.id)
            .maybeSingle();

        if (analysisError) throw analysisError;

        if (!analysis) {
          throw new Error("Analisis tidak ditemukan atau tidak dapat diakses.");
        }

        const { data: questionRows, error: questionError } =
          await supabase
            .from("validation_questions")
            .select(
              "id, question_order, question_text, evidence_context"
            )
            .eq("analysis_id", analysisId)
            .eq("user_id", user.id)
            .order("question_order", { ascending: true });

        if (questionError) throw questionError;

        if (!questionRows || questionRows.length === 0) {
          throw new Error(
            "Pertanyaan validasi belum tersedia. Buat pertanyaan AI terlebih dahulu."
          );
        }

        if (step < 1 || step > questionRows.length) {
          throw new Error("Nomor pertanyaan tidak valid.");
        }

        const current = questionRows[step - 1];

        const { data: savedAnswer, error: answerError } =
          await supabase
            .from("validation_answers")
            .select("answer_text")
            .eq("question_id", current.id)
            .eq("user_id", user.id)
            .maybeSingle();

        if (answerError) throw answerError;

        if (cancelled) return;

        setQuestions(questionRows as ValidationQuestion[]);

        const localAnswers = readAnswers();
        setAnswer(
          savedAnswer?.answer_text ??
            localAnswers[String(step)] ??
            ""
        );
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Gagal memuat pertanyaan validasi."
          );
        }
      } finally {
        if (!cancelled) setLoaded(true);
      }
    }

    void loadQuestion();

    return () => {
      cancelled = true;
    };
  }, [step]);

  function persistLocalAnswer(value: string) {
    const previous = readAnswers();

    sessionStorage.setItem(
      analysisStorage.validationAnswers,
      JSON.stringify({
        ...previous,
        [String(step)]: value,
      })
    );
  }

  function handleAnswerChange(value: string) {
    setAnswer(value);
    setError("");
    persistLocalAnswer(value);
  }

  async function handleNext(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!answer.trim()) {
      setError("Silakan isi jawaban sebelum melanjutkan.");
      return;
    }

    if (!currentQuestion) {
      setError("Pertanyaan belum tersedia.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const supabase = createClient();

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new Error("Sesi login berakhir. Silakan login kembali.");
      }

      const { data: existingAnswer, error: lookupError } =
        await supabase
          .from("validation_answers")
          .select("id")
          .eq("question_id", currentQuestion.id)
          .eq("user_id", user.id)
          .maybeSingle();

      if (lookupError) throw lookupError;

      if (existingAnswer) {
        const { error: updateError } = await supabase
          .from("validation_answers")
          .update({
            answer_text: answer.trim(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingAnswer.id)
          .eq("user_id", user.id);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from("validation_answers")
          .insert({
            question_id: currentQuestion.id,
            user_id: user.id,
            answer_text: answer.trim(),
          });

        if (insertError) throw insertError;
      }

      persistLocalAnswer(answer.trim());

      
      if (step < totalQuestions) {
        router.push(
          analysisRoutes.question((step + 1) as QuestionNumber)
        );
        return;
      }

      const analysisId = sessionStorage.getItem(
        analysisStorage.activeAnalysisId
      );

      if (!analysisId) {
        throw new Error(
          "Analisis aktif tidak ditemukan. Silakan mulai analisis kembali."
        );
      }

      const response = await fetch("/api/ai/evaluate-analysis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ analysisId }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Evaluasi AI gagal dilakukan. Silakan coba lagi."
        );
      }

      sessionStorage.setItem(
        analysisStorage.validationCompleted,
        "true"
      );

      router.push(analysisRoutes.result);

    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Jawaban gagal disimpan. Silakan coba lagi."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="validation-page">
      <div className="validation-content">
        <div className="validation-intro">
          <h1>Pertanyaan Validasi</h1>
          <p>
            Jawab beberapa pertanyaan berikut untuk memastikan
            pemahamanmu terhadap proyek benar-benar sesuai.
          </p>
        </div>

        {totalQuestions > 0 && (
          <div className="validation-progress-section">
            <div className="validation-progress-label">
              Pertanyaan {step} dari {totalQuestions}
            </div>
            <div
              className="validation-progress-track"
              role="progressbar"
              aria-label="Progres pertanyaan"
              aria-valuenow={step}
              aria-valuemin={0}
              aria-valuemax={totalQuestions}
            >
              <div
                className="validation-progress-fill"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        <div className="validation-workspace">
          <form className="validation-form" onSubmit={handleNext}>
            <div className="validation-question-card">
              <label
                htmlFor="validation-answer"
                className="validation-question-text"
              >
                {currentQuestion?.question_text ??
                  (loaded && !error
                    ? "Pertanyaan tidak tersedia."
                    : "Memuat pertanyaan...")}
              </label>

              <div className="validation-textarea-wrap">
                <textarea
                  id="validation-answer"
                  name={`jawaban-${step}`}
                  placeholder="Tulis jawaban Anda di sini..."
                  value={answer}
                  maxLength={1000}
                  required
                  disabled={!loaded || !currentQuestion || saving}
                  onChange={(event) =>
                    handleAnswerChange(event.target.value)
                  }
                  aria-describedby="validation-counter"
                />
                <span
                  id="validation-counter"
                  className="validation-character-count"
                >
                  {answer.length}/1000
                </span>
              </div>
            </div>

            {error && (
              <p className="validation-error" role="alert">
                {error}
              </p>
            )}

            <div className="validation-buttons">
              {step > 1 && (
                <Link
                  href={analysisRoutes.question(
                    (step - 1) as QuestionNumber
                  )}
                  className="validation-back"
                >
                  ← Kembali
                </Link>
              )}

              <button
                type="submit"
                disabled={!loaded || !currentQuestion || saving}
                className="validation-next"
              >
                {saving
                  ? "Menyimpan..."
                  : step === totalQuestions
                    ? "Selesai"
                    : "Selanjutnya"}
                <span aria-hidden="true">→</span>
              </button>
            </div>
          </form>

          <aside className="validation-tips">
            <h2>
              <span className="validation-tips-icon">!</span>
              Tips Menjawab
            </h2>
            <ul>
              <li>
                Jelaskan pengalaman dan kontribusimu sendiri secara jujur.
              </li>
              <li>
                Berikan contoh teknis yang benar-benar pernah kamu kerjakan.
              </li>
              <li>
                Jika ada hal yang belum kamu kuasai, jelaskan apa yang
                sudah kamu pahami dan bagian yang masih menjadi kendala.
              </li>
            </ul>
            {currentQuestion?.evidence_context && (
              <p>
                <strong>Konteks bukti:</strong>{" "}
                {currentQuestion.evidence_context}
              </p>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
