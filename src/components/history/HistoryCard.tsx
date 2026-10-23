import type { CSSProperties } from "react";
import type { AnalysisHistoryEntry } from "@/types/history";
import HistoryIcon from "./HistoryIcon";

type MatchStyle = CSSProperties & { "--bkh-match": string };

export default function HistoryCard({ entry, onOpen }: { entry: AnalysisHistoryEntry; onOpen: (entry: AnalysisHistoryEntry) => void }) {
  return (
    <li className="bkh-historyItem">
      <article className="bkh-historyCard" aria-labelledby={`bkh-history-${entry.id}`}>
        <header className="bkh-cardHeader">
          <span className="bkh-projectIcon"><HistoryIcon name={entry.icon} size={30} /></span>
          <div>
            <h3 id={`bkh-history-${entry.id}`}>{entry.projectName}</h3>
            <p>Target role: <strong>{entry.roleLabel}</strong></p>
          </div>
        </header>

        <div className="bkh-cardContent">
          <dl className="bkh-cardDetails">
            <div><dt>Teknologi</dt><dd>{entry.technologies.join(", ")}</dd></div>
            <div><dt><HistoryIcon name="calendar" size={18} /> Tanggal Analisis</dt><dd><time dateTime={entry.date}>{entry.dateLabel}</time></dd></div>
            <div><dt>Status</dt><dd className="bkh-status"><HistoryIcon name="check" size={18} />{entry.status}</dd></div>
          </dl>

          <div
            className="bkh-matchRing"
            role="progressbar"
            aria-label={`Skill Match ${entry.projectName}: ${entry.match} persen`}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={entry.match}
            style={{ "--bkh-match": `${entry.match}%` } as MatchStyle}
          >
            <div><strong>{entry.match}%</strong><span>Skill Match</span></div>
          </div>
        </div>

        <button className="bkh-detailButton" type="button" onClick={() => onOpen(entry)}>
          Lihat Detail <span aria-hidden="true">→</span>
        </button>
      </article>
    </li>
  );
}
