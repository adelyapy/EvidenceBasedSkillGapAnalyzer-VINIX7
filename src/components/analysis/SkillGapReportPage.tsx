import Link from "next/link";
import { analysisRoutes } from "@/data/analysis";
import { skillComparisons, skillGapPriorities } from "@/data/skill-gap";
import SkillGapIllustration from "./SkillGapIllustration";

export default function SkillGapReportPage() {
  return (
    <article className="bks-page" aria-labelledby="bks-title">
      <header className="bks-intro">
        <div>
          <h1 id="bks-title">Skill Gap Report</h1>
          <p>Perbandingan antara kompetensimu dengan kebutuhan Frontend Developer di industri saat ini.</p>
        </div>
        <div className="bks-nextAction">
          <Link className="bks-nextButton" href={analysisRoutes.roadmap}>Lanjutkan <span aria-hidden="true">→</span></Link>
        </div>
      </header>

      <aside className="bks-demoNotice" aria-label="Keterangan data contoh">
        <strong>Data contoh prototipe Frontend Developer.</strong> Skor dan kebutuhan industri belum berasal dari analisis AI atau data pengguna. Jika target role Anda berbeda, perbandingan ini tetap contoh Frontend Developer.
      </aside>

      <section className="bks-legend" aria-label="Keterangan warna perbandingan">
        <span><i className="bks-legendSwatch bks-legendSwatch--you" aria-hidden="true" />Skill Kamu</span>
        <span><i className="bks-legendSwatch bks-legendSwatch--industry" aria-hidden="true" />Kebutuhan Industri</span>
      </section>

      <div className="bks-contentGrid">
        <section className="bks-panel bks-comparisonPanel" aria-labelledby="bks-comparison-title">
          <div className="bks-panelHeading">
            <h2 id="bks-comparison-title">Perbandingan Skill</h2>
            <p>Kompetensi saat ini dibandingkan dengan kebutuhan industri.</p>
          </div>
          <table className="bks-comparisonTable">
            <caption>Data contoh perbandingan tujuh skill Frontend Developer</caption>
            <thead><tr><th scope="col">Skill</th><th scope="col">Perbandingan</th><th scope="col">Nilai</th></tr></thead>
            <tbody>
              {skillComparisons.map((skill) => (
                <tr key={skill.name}>
                  <th scope="row">{skill.name}</th>
                  <td>
                    <div className="bks-barTrack" role="img" aria-label={`${skill.name}: Skill Kamu ${skill.skillKamu} persen, Kebutuhan Industri ${skill.kebutuhanIndustri} persen`}>
                      <span className="bks-barIndustry" style={{ width: `${skill.kebutuhanIndustri}%` }} />
                      <span className="bks-barYou" style={{ width: `${skill.skillKamu}%` }} />
                    </div>
                  </td>
                  <td className="bks-value">{skill.skillKamu}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <aside className="bks-visualPanel" aria-label="Ilustrasi fokus pengembangan skill">
          <SkillGapIllustration />
          <p className="bks-focusNote">FOKUS PADA SKILL YANG PENTING</p>
        </aside>
      </div>

      <section className="bks-panel bks-gapPanel" aria-labelledby="bks-gap-title">
        <h2 id="bks-gap-title">Skill Gap Utama</h2>
        <ol className="bks-priorityList">
          {skillGapPriorities.map((item) => {
            const skill = skillComparisons.find((comparison) => comparison.name === item.skillName);
            if (!skill) return null;
            const gap = Math.max(0, skill.kebutuhanIndustri - skill.skillKamu);
            return (
              <li key={item.skillName}>
                <span className="bks-priorityName">{item.skillName}</span>
                <span className="bks-priorityGap">Selisih {gap}%</span>
                <span className={`bks-priorityBadge bks-priorityBadge--${item.level.toLowerCase()}`}>Prioritas {item.level}</span>
              </li>
            );
          })}
        </ol>
      </section>

      <nav className="bks-bottomNav" aria-label="Navigasi Skill Gap Report">
        <Link href={analysisRoutes.result}>← Kembali ke Hasil Analisis</Link>
        <Link href={analysisRoutes.uploadProject}>Kembali ke Analisa Baru</Link>
        <Link href="/workspace/dashboard">Kembali ke Dashboard</Link>
      </nav>
    </article>
  );
}
