"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { analysisRoutes, analysisStorage } from "@/data/analysis";
import { questions, type QuestionNumber } from "./questions";

function readAnswers(): Record<string, string> {
  try {
    const saved = sessionStorage.getItem(analysisStorage.validationAnswers);
    if (!saved) return {};
    const parsed: unknown = JSON.parse(saved);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed as Record<string, string> : {};
  } catch {
    return {};
  }
}

export default function ValidationPage({ step }: { step: QuestionNumber }) {
  const router = useRouter();
  const [answer, setAnswer] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");
  const currentQuestion = questions[step];
  const progress = (step / 5) * 100;

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const stored = readAnswers();
      setAnswer(stored[String(step)] || "");
      setLoaded(true);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [step]);

  function persistAnswer(value: string) {
    const previous = readAnswers();
    sessionStorage.setItem(analysisStorage.validationAnswers, JSON.stringify({ ...previous, [step]: value }));
  }

  function handleAnswerChange(value: string) {
    setAnswer(value);
    setError("");
    persistAnswer(value);
  }

  function handleNext(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!answer.trim()) {
      setError("Silakan isi jawaban sebelum melanjutkan.");
      return;
    }

    persistAnswer(answer);

    if (step < 5) {
      router.push(analysisRoutes.question(step + 1));
      return;
    }

    sessionStorage.setItem(analysisStorage.validationCompleted, "true");
    router.push(analysisRoutes.result);
  }

  return (
    <div className="validation-page">
      <div className="validation-content">
        <div className="validation-intro">
          <h1>Pertanyaan Validasi</h1>
          <p>Jawab beberapa pertanyaan berikut untuk memastikan pemahamanmu terhadap proyek benar-benar sesuai.</p>
        </div>

        <div className="validation-progress-section">
          <div className="validation-progress-label">Pertanyaan {step} dari 5</div>
          <div className="validation-progress-track" role="progressbar" aria-label="Progres pertanyaan" aria-valuenow={step} aria-valuemin={0} aria-valuemax={5}>
            <div className="validation-progress-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="validation-workspace">
          <form className="validation-form" onSubmit={handleNext}>
            <div className="validation-question-card">
              <label htmlFor="validation-answer" className="validation-question-text">{currentQuestion.question}</label>
              <div className="validation-textarea-wrap">
                <textarea id="validation-answer" name={`jawaban-${step}`} placeholder="Tulis jawaban Anda di sini..." value={answer} maxLength={1000} required disabled={!loaded} onChange={(event) => handleAnswerChange(event.target.value)} aria-describedby="validation-counter" />
                <span id="validation-counter" className="validation-character-count">{answer.length}/1000</span>
              </div>
            </div>

            {error && <p className="validation-error" role="alert">{error}</p>}

            <div className="validation-buttons">
              {step > 1 && <Link href={analysisRoutes.question(step - 1)} className="validation-back">← Kembali</Link>}
              <button type="submit" disabled={!loaded} className="validation-next">{step === 5 ? "Selesai" : "Selanjutnya"}<span aria-hidden="true">→</span></button>
            </div>
          </form>

          <aside className="validation-tips">
            <h2><span className="validation-tips-icon">!</span>Tips Menjawab</h2>
            <ul>{currentQuestion.tips.map((tip) => <li key={tip}>{tip}</li>)}</ul>
          </aside>
        </div>
      </div>
    </div>
  );
}
