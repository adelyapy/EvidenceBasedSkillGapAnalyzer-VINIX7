
"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AnalysisStepper from "./AnalysisStepper";
import { analysisRoutes, analysisStorage } from "@/data/analysis";

const REDIRECT_DELAY_MS = 500;

export default function ProcessAnalysisPage() {
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);
  const [processing, setProcessing] = useState(true);

  useEffect(() => {
    let cancelled = false;
    let redirectTimer: number | undefined;
    let currentProgress = 0;

    setProgress(0);
    setError("");
    setProcessing(true);

    // Progres hanya indikator visual selama proses AI berlangsung.
    const interval = window.setInterval(() => {
      currentProgress = Math.min(currentProgress + 1, 90);

      if (!cancelled) {
        setProgress(currentProgress);
      }
    }, 1000);

    async function processAnalysis() {
      try {
        const analysisId = sessionStorage.getItem(
          analysisStorage.activeAnalysisId
        );

        if (!analysisId) {
          throw new Error(
            "ID analisis tidak ditemukan. Silakan kembali ke halaman input dan buat analisis baru."
          );
        }

        const response = await fetch("/api/ai/validation-questions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ analysisId }),
        });

        const result = await response.json();

        if (!response.ok || result.success !== true) {
          throw new Error(
            typeof result.message === "string"
              ? result.message
              : "Gagal memproses analisis AI."
          );
        }

        if (
          !Array.isArray(result.questions) ||
          result.questions.length === 0
        ) {
          throw new Error(
            "AI belum menghasilkan pertanyaan validasi. Silakan coba lagi."
          );
        }

        if (cancelled) return;

        // Tandai progres selesai hanya setelah backend berhasil.
        window.clearInterval(interval);
        setProgress(100);
        setProcessing(false);

        redirectTimer = window.setTimeout(() => {
          if (!cancelled) {
            router.push(analysisRoutes.question(1));
          }
        }, REDIRECT_DELAY_MS);
      } catch (err) {
        if (cancelled) return;

        window.clearInterval(interval);
        setProcessing(false);
        setError(
          err instanceof Error
            ? err.message
            : "Terjadi kesalahan saat memproses analisis."
        );
      }
    }

    void processAnalysis();

    return () => {
      cancelled = true;
      window.clearInterval(interval);

      if (redirectTimer !== undefined) {
        window.clearTimeout(redirectTimer);
      }
    };
  }, [router, retryCount]);

  return (
    <div className="process-main">
      <AnalysisStepper current="review" />

      <section className="process-content" aria-labelledby="process-heading">
        <h1 id="process-heading">
          {error ? (
            <>Analisis belum selesai</>
          ) : (
            <>
              AI Sedang Menganalisis
              <br />
              proyek kamu...
            </>
          )}
        </h1>

        <p className="process-description">
          {error ? (
            <>Kami belum dapat menyelesaikan analisis proyek kamu.</>
          ) : (
            <>
              Proses ini membutuhkan waktu sesuai respons layanan AI.
              <br />
              Kami menganalisis bukti proyek untuk menyusun pertanyaan validasi.
            </>
          )}
        </p>

        <div className="process-illustration">
          <Image
            src="/images/proses-illustrasion.png"
            alt="Ilustrasi robot sedang menganalisis teknologi, konteks proyek, dan skill"
            width={703}
            height={301}
            unoptimized
            priority
          />
        </div>

        <div className="process-progress-row">
          <div
            className="process-progress-track"
            role="progressbar"
            aria-label="Progres pemrosesan"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="process-progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>

          <span className="process-progress-value">{progress}%</span>
        </div>

        {error && (
          <p className="validation-error" role="alert">
            {error}
          </p>
        )}

        {error && (
          <button
            type="button"
            className="validation-next"
            onClick={() => setRetryCount((count) => count + 1)}
          >
            Coba Lagi <span aria-hidden="true">→</span>
          </button>
        )}

        <div className="process-alert">
          <span className="process-alert-icon" aria-hidden="true">
            i
          </span>
          <span>
            {processing
              ? "Jangan tutup halaman ini. Kamu akan diarahkan setelah pertanyaan berhasil dibuat."
              : error
                ? "Periksa pesan di atas, lalu coba kembali."
                : "Pertanyaan berhasil dibuat. Mengarahkan ke halaman validasi..."}
          </span>
        </div>
      </section>
    </div>
  );
}