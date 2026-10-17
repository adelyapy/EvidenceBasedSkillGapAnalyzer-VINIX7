import Link from "next/link";
import type { CSSProperties } from "react";
import AnalysisResultIcon from "./AnalysisResultIcon";
import PrintAnalysisReportButton from "./PrintAnalysisReportButton";
import { analysisRoutes } from "@/data/analysis";
import { analysisResultDemo } from "@/data/analysis-result";

type ScoreStyle = CSSProperties & { "--bkr-score": number };

function normalizedScore(score: number) {
  return Math.min(100, Math.max(0, score));
}

export default function AnalysisResultPage() {
  const score = normalizedScore(analysisResultDemo.score);

  return (
    <article className="bkr-page" aria-labelledby="bkr-title">
      <header className="bkr-intro">
        <div>
          <h1 id="bkr-title">Hasil Analisis Anda</h1>
          <p>Berikut adalah ringkasan hasil analisis kompetensi berdasarkan projek dan jawaban Anda.</p>
        </div>
        <div className="bkr-printAction">
          <PrintAnalysisReportButton />
          <p className="bkr-printHelp bkr-screenOnly" id="bkr-print-help">
            Membuka dialog cetak browser; pilih Simpan sebagai PDF.
          </p>
        </div>
      </header>

      <aside className="bkr-demoNotice" aria-label="Keterangan data demo">
        <strong>Data demo prototipe</strong>
        <p>Contoh hasil prototipe. Skor, kemampuan, bukti proyek, dan rekomendasi masih merupakan data demo Frontend Developer, bukan hasil penilaian AI maupun jawaban pengguna.</p>
      </aside>

      <div className="bkr-reportGrid bkr-reportGrid--top">
        <section className="bkr-panel bkr-scorePanel" aria-labelledby="bkr-score-title">
          <h2 className="bkr-srOnly" id="bkr-score-title">Skor Keseluruhan</h2>
          <div
            className="bkr-scoreRing"
            role="meter"
            aria-label={`Skor keseluruhan demo ${score} persen`}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={score}
            style={{ "--bkr-score": score } as ScoreStyle}
          >
            <div>
              <strong>{score}%</strong>
              <span>Skor Keseluruhan</span>
            </div>
          </div>
          <p>{analysisResultDemo.summary}</p>
        </section>

        <section className="bkr-panel bkr-skillsPanel" aria-labelledby="bkr-skills-title">
          <h2 id="bkr-skills-title">Keunggulan Kemampuan Anda</h2>
          <ul className="bkr-skillList">
            {analysisResultDemo.skills.map((skill) => {
              const skillScore = normalizedScore(skill.score);
              return (
                <li key={skill.name}>
                  <strong>{skill.name}</strong>
                  <span className="bkr-skillLevel">{skill.level}</span>
                  <span
                    className="bkr-skillMeter"
                    role="meter"
                    aria-label={`${skill.name}, tingkat ${skill.level}, ${skillScore} persen`}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={skillScore}
                  >
                    <span style={{ width: `${skillScore}%` }} />
                  </span>
                  <b>{skillScore}%</b>
                </li>
              );
            })}
          </ul>
        </section>
      </div>

      <div className="bkr-reportGrid bkr-reportGrid--bottom">
        <section className="bkr-panel bkr-projectPanel" aria-labelledby="bkr-projects-title">
          <h2 id="bkr-projects-title">Bukti Proyek</h2>
          <ul>
            {analysisResultDemo.projects.map((project) => (
              <li key={project.name}>
                <span className="bkr-listIcon"><AnalysisResultIcon name={project.icon} size={18} /></span>
                <span><strong>{project.name}</strong><small>{project.technologies}</small></span>
              </li>
            ))}
          </ul>
        </section>

        <section className="bkr-panel bkr-recommendationPanel" aria-labelledby="bkr-recommendations-title">
          <h2 id="bkr-recommendations-title">Rekomendasi</h2>
          <ul>
            {analysisResultDemo.recommendations.map((recommendation) => (
              <li key={recommendation.text}>
                <span className="bkr-listIcon"><AnalysisResultIcon name={recommendation.icon} /></span>
                <span>{recommendation.text}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <nav className="bkr-actions bkr-screenOnly" aria-label="Navigasi hasil analisis">
        <Link href={analysisRoutes.question(5)}>← Kembali ke Pertanyaan 5</Link>
        <Link className="bkr-next-button" href={analysisRoutes.skillGap}>Lanjutkan <span aria-hidden="true">→</span></Link>
      </nav>
    </article>
  );
}
