import { getHistorySummary } from "@/data/history";
import type { AnalysisHistoryEntry } from "@/types/history";
import HistoryIcon from "./HistoryIcon";

export default function HistorySummary({ entries }: { entries: AnalysisHistoryEntry[] }) {
  const summary = getHistorySummary(entries);
  const roleValue = summary.dominantRole ?? "Tidak ada role dominan";
  const roleNote = summary.dominantRole
    ? `${summary.dominantRoleCount} analisis menggunakan role ini`
    : summary.dominantRoleCount === 1
      ? "Masing-masing role digunakan 1 kali"
      : `Beberapa role sama-sama digunakan ${summary.dominantRoleCount} kali`;

  return (
    <section className="bkh-summary" aria-labelledby="bkh-summary-title">
      <h2 id="bkh-summary-title">Ringkasan Analisis</h2>
      <dl className="bkh-summaryGrid">
        <div className="bkh-summaryCard">
          <span className="bkh-summaryIcon"><HistoryIcon name="analysis" /></span>
          <div><dt>Total Analisis</dt><dd><strong>{summary.total}</strong><span>proyek telah dianalisis</span></dd></div>
        </div>
        <div className="bkh-summaryCard">
          <span className="bkh-summaryIcon"><HistoryIcon name="average" /></span>
          <div><dt>Rata-rata Skill Match</dt><dd><strong>{summary.averageMatch}%</strong><span>dari semua analisis, dibulatkan</span></dd></div>
        </div>
        <div className="bkh-summaryCard">
          <span className="bkh-summaryIcon"><HistoryIcon name="role" /></span>
          <div><dt>Role Terbanyak</dt><dd><strong className="bkh-summaryRole">{roleValue}</strong><span>{roleNote}</span></dd></div>
        </div>
      </dl>
    </section>
  );
}
