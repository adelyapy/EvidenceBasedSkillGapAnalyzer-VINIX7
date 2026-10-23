
import type { CSSProperties } from "react";
import type { AnalysisHistoryEntry } from "@/types/history";
import HistoryIcon from "./HistoryIcon";

type MatchStyle = CSSProperties & {
  "--bkh-match": string;
};

export default function HistoryCard({
  entry,
  onOpen,
}: {
  entry: AnalysisHistoryEntry;
  onOpen: (entry: AnalysisHistoryEntry) => void;
}) {
  const score = entry.match;
  const scoreStyle = {
    "--bkh-match": `${score ?? 0}%`,
  } as MatchStyle;

  return (
    <li className="bkh-historyItem">
      <article
        className="bkh-historyCard"
        aria-labelledby={`bkh-history-${entry.id}`}
      >
        <header className="bkh-cardHeader">
          <span className="bkh-projectIcon">
            <HistoryIcon name={entry.icon} size={30} />
          </span>
          <div>
            <h3 id={`bkh-history-${entry.id}`}>{entry.projectName}</h3>
            <p>
              Target role: <strong>{entry.roleLabel}</strong>
            </p>
          </div>
        </header>

        <div className="bkh-cardContent">
          <dl className="bkh-cardDetails">
            <div>
              <dt>Teknologi</dt>
              <dd>
                {entry.technologies.length
                  ? entry.technologies.join(", ")
                  : "Belum tersedia"}
              </dd>
            </div>

            <div>
              <dt>
                <HistoryIcon name="calendar" size={18} /> Tanggal Analisis
              </dt>
              <dd>
                <time dateTime={entry.date}>{entry.dateLabel}</time>
              </dd>
            </div>

            <div>
              <dt>Status</dt>
              <dd className="bkh-status">
                <HistoryIcon name="check" size={18} />
                {entry.status}
              </dd>
            </div>
          </dl>

          <div
            className="bkh-matchRing"
            role={score === null ? undefined : "progressbar"}
            aria-label={
              score === null
                ? `Skor kesiapan ${entry.projectName} belum tersedia`
                : `Skor kesiapan ${entry.projectName}: ${score} persen`
            }
            aria-valuemin={score === null ? undefined : 0}
            aria-valuemax={score === null ? undefined : 100}
            aria-valuenow={score ?? undefined}
            style={scoreStyle}
          >
            <div>
              <strong>{score === null ? "—" : `${score}%`}</strong>
              <span>Skor Kesiapan</span>
            </div>
          </div>
        </div>

        <button
          className="bkh-detailButton"
          type="button"
          onClick={() => onOpen(entry)}
        >
          Lihat Detail <span aria-hidden="true">→</span>
        </button>
      </article>
    </li>
  );
}
