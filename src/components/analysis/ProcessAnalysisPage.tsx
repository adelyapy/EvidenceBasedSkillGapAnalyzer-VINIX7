"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AnalysisStepper from "./AnalysisStepper";
import { analysisRoutes } from "@/data/analysis";

const DURATION_MS = 12_000;
const REDIRECT_DELAY_MS = 500;

export default function ProcessAnalysisPage() {
  const router = useRouter();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let currentProgress = 0;
    let redirectTimer: number | undefined;
    const interval = window.setInterval(() => {
      currentProgress = Math.min(currentProgress + 1, 100);
      setProgress(currentProgress);

      if (currentProgress >= 100) {
        window.clearInterval(interval);
        redirectTimer = window.setTimeout(() => router.push(analysisRoutes.question(1)), REDIRECT_DELAY_MS);
      }
    }, DURATION_MS / 100);

    return () => {
      window.clearInterval(interval);
      if (redirectTimer) window.clearTimeout(redirectTimer);
    };
  }, [router]);

  return (
    <div className="process-main">
      <AnalysisStepper current="review" />
      <section className="process-content" aria-labelledby="process-heading">
        <h1 id="process-heading">AI Sedang Menganalisis<br />proyek kamu...</h1>
        <p className="process-description">Proses ini biasanya memakan waktu 1–3 menit.<br />Kami menganalisis teknologi, peran, dan kontribusimu.</p>
        <div className="process-illustration"><Image src="/images/proses-illustrasion.png" alt="Ilustrasi robot sedang menganalisis teknologi, konteks proyek, dan skill" width={703} height={301} unoptimized priority /></div>
        <div className="process-progress-row">
          <div className="process-progress-track" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
            <div className="process-progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <span className="process-progress-value">{progress}%</span>
        </div>
        <div className="process-alert"><span className="process-alert-icon" aria-hidden="true">i</span><span>Jangan tutup halaman ini. Kamu akan diarahkan otomatis setelah proses selesai.</span></div>
      </section>
    </div>
  );
}
