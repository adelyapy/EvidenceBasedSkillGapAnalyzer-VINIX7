"use client";

import { useMemo, useRef, useState, type FormEvent } from "react";
import { analysisHistory, DEFAULT_HISTORY_FILTERS } from "@/data/history";
import type { AnalysisHistoryEntry, HistoryFiltersValue, HistoryRoleId, HistorySort } from "@/types/history";
import HistoryCard from "./HistoryCard";
import HistoryFilters from "./HistoryFilters";
import HistoryIcon from "./HistoryIcon";
import HistorySummary from "./HistorySummary";

function filterAndSortHistory(filters: HistoryFiltersValue) {
  const normalizedQuery = filters.query.trim().toLocaleLowerCase("id-ID");
  const filtered = analysisHistory.filter((entry) => {
    const matchesQuery = !normalizedQuery ||
      entry.projectName.toLocaleLowerCase("id-ID").includes(normalizedQuery) ||
      entry.roleLabel.toLocaleLowerCase("id-ID").includes(normalizedQuery);
    const matchesRole = filters.role === "all" || entry.roleId === filters.role;
    return matchesQuery && matchesRole;
  });

  return filtered.sort((first, second) => {
    if (filters.sort === "newest") return second.date.localeCompare(first.date);
    if (filters.sort === "highest") return second.match - first.match;
    if (filters.sort === "lowest") return first.match - second.match;
    return first.date.localeCompare(second.date);
  });
}

export default function AnalysisHistoryPage() {
  const [draftFilters, setDraftFilters] = useState<HistoryFiltersValue>(DEFAULT_HISTORY_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState<HistoryFiltersValue>(DEFAULT_HISTORY_FILTERS);
  const [selectedEntry, setSelectedEntry] = useState<AnalysisHistoryEntry | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const results = useMemo(() => filterAndSortHistory(appliedFilters), [appliedFilters]);

  function applyFilters(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAppliedFilters({ ...draftFilters });
  }

  function resetFilters() {
    setDraftFilters(DEFAULT_HISTORY_FILTERS);
    setAppliedFilters(DEFAULT_HISTORY_FILTERS);
  }

  function openDetail(entry: AnalysisHistoryEntry) {
    setSelectedEntry(entry);
    requestAnimationFrame(() => dialogRef.current?.showModal());
  }

  function closeDetail() {
    dialogRef.current?.close();
  }

  return (
    <article className="bkh-page" aria-labelledby="bkh-title">
      <header className="bkh-intro">
        <h1 id="bkh-title">Riwayat Analisis</h1>
        <p>Lihat kembali rangkuman proyek dan kecocokan skill dari data contoh BUKTIVA.</p>
      </header>

      <aside className="bkh-demoNotice" aria-label="Keterangan data contoh">
        <strong>Data contoh prototipe.</strong> Empat entri berikut berasal dari HTML statis, bukan riwayat pengguna atau hasil analisis AI.
      </aside>

      <HistorySummary entries={analysisHistory} />

      <HistoryFilters
        value={draftFilters}
        onQueryChange={(query) => setDraftFilters((current) => ({ ...current, query }))}
        onRoleChange={(role: "all" | HistoryRoleId) => setDraftFilters((current) => ({ ...current, role }))}
        onSortChange={(sort: HistorySort) => setDraftFilters((current) => ({ ...current, sort }))}
        onApply={applyFilters}
        onReset={resetFilters}
      />

      <section className="bkh-listSection" aria-labelledby="bkh-list-title">
        <div className="bkh-listHeading">
          <div>
            <h2 id="bkh-list-title">Daftar Riwayat Analisis</h2>
            <p aria-live="polite">Menampilkan {results.length} dari {analysisHistory.length} analisis contoh.</p>
          </div>
        </div>

        {results.length ? (
          <ol className="bkh-historyGrid">
            {results.map((entry) => <HistoryCard key={entry.id} entry={entry} onOpen={openDetail} />)}
          </ol>
        ) : (
          <div className="bkh-emptyState" role="status">
            <HistoryIcon name="search" size={42} />
            <h3>Riwayat tidak ditemukan</h3>
            <p>Coba kata kunci atau filter lain untuk melihat data contoh.</p>
            <button type="button" onClick={resetFilters}>Reset pencarian dan filter</button>
          </div>
        )}
      </section>

      <dialog
        className="bkh-dialog"
        ref={dialogRef}
        aria-labelledby="bkh-dialog-title"
      >
        {selectedEntry && (
          <div className="bkh-dialogContent">
            <button className="bkh-dialogClose" type="button" onClick={closeDetail} aria-label="Tutup detail riwayat">
              <HistoryIcon name="close" />
            </button>
            <span className="bkh-dialogIcon"><HistoryIcon name={selectedEntry.icon} size={34} /></span>
            <p className="bkh-dialogEyebrow">Detail data contoh</p>
            <h2 id="bkh-dialog-title">{selectedEntry.projectName}</h2>
            <dl>
              <div><dt>Target Role</dt><dd>{selectedEntry.roleLabel}</dd></div>
              <div><dt>Tanggal Analisis</dt><dd><time dateTime={selectedEntry.date}>{selectedEntry.dateLabel}</time></dd></div>
              <div><dt>Skill Match</dt><dd>{selectedEntry.match}%</dd></div>
              <div><dt>Teknologi</dt><dd>{selectedEntry.technologies.join(", ")}</dd></div>
              <div><dt>Status</dt><dd>{selectedEntry.status}</dd></div>
            </dl>
            <p className="bkh-dialogNote">Detail ini berasal dari entri prototipe yang dipilih dan tidak tersimpan ke akun atau database.</p>
            <button className="bkh-dialogDone" type="button" onClick={closeDetail}>Tutup</button>
          </div>
        )}
      </dialog>
    </article>
  );
}
