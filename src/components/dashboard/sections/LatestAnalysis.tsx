import Link from "next/link";
import { latestAnalysis } from "@/data/dashboard";
import { HISTORY_ROUTE } from "@/data/workspace";

export default function LatestAnalysis() {
  return (
    <section className="bkd-panel bkd-analysis" aria-labelledby="judul-ringkasan-analisis">
      <div className="bkd-panelHeading"><h2 id="judul-ringkasan-analisis">Ringkasan Analisis Terbaru</h2><Link className="bkd-panelLink" href={HISTORY_ROUTE}>Lihat Semua</Link></div>
      <div className="bkd-analysisBody">
        <div className="bkd-scoreCard">
          <div className="bkd-scoreRing" style={{ "--bkd-score": `${latestAnalysis.score}%` } as React.CSSProperties} role="img" aria-label={`Skor keseluruhan ${latestAnalysis.score} persen`}>
            <div><strong>{latestAnalysis.score}%</strong><small>Skor Keseluruhan</small></div>
          </div>
          <h3>{latestAnalysis.role}</h3>
          <p>{latestAnalysis.description}</p>
        </div>
        <div className="bkd-skillsCard">
          <h3>Kemampuan unggul</h3>
          <ul>{latestAnalysis.strengths.map((skill) => <li key={skill}>{skill}</li>)}</ul>
          <h3>Pengembangan Kemampuan</h3>
          <ul>{latestAnalysis.improvements.map((skill) => <li key={skill}>{skill}</li>)}</ul>
        </div>
      </div>
    </section>
  );
}
