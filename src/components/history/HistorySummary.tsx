
import { getHistorySummary } from "@/data/history";
import type { AnalysisHistoryEntry } from "@/types/history";
import HistoryIcon from "./HistoryIcon";

export default function HistorySummary({
  entries,
}: {
  entries: AnalysisHistoryEntry[];
}) {
  const summary = getHistorySummary(entries);
  const roleValue = summary.dominantRole ?? "Belum ada role dominan";

  const roleNote =
    summary.dominantRole !== null
      ? `${summary.dominantRoleCount} analisis menggunakan role ini`
      : summary.total === 0
        ? "Belum ada analisis"
        : `Terdapat ${summary.dominantRoleCount} analisis pada setiap role terbanyak`;

  return (
    <section className="bkh-summary" aria-labelledby="bkh-summary-title">
      <h2 id="bkh-summary-title">Ringkasan Analisis</h2>

      <dl className="bkh-summaryGrid">
        <div className="bkh-summaryCard">
          <span className="bkh-summaryIcon">
            <HistoryIcon name="analysis" />
          </span>
          <div>
            <dt>Total Analisis</dt>
            <dd>
              <strong>{summary.total}</strong>
              <span>analisis tersimpan</span>
            </dd>
          </div>
        </div>

        <div className="bkh-summaryCard">
          <span className="bkh-summaryIcon">
            <HistoryIcon name="average" />
          </span>
          <div>
            <dt>Rata-rata Skor Kesiapan</dt>
            <dd>
              <strong>
                {summary.averageMatch === null
                  ? "—"
                  : `${summary.averageMatch}%`}
              </strong>
              <span>
                {summary.averageMatch === null
                  ? "Belum tersedia"
                  : "Dari analisis yang memiliki skor"}
              </span>
            </dd>
          </div>
        </div>

        <div className="bkh-summaryCard">
          <span className="bkh-summaryIcon">
            <HistoryIcon name="role" />
          </span>
          <div>
            <dt>Role Terbanyak</dt>
            <dd>
              <strong className="bkh-summaryRole">{roleValue}</strong>
              <span>{roleNote}</span>
            </dd>
          </div>
        </div>
      </dl>
    </section>
  );
}
