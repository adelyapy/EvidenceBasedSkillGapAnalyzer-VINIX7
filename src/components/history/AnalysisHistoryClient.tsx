
"use client";

import { useMemo, useRef, useState, type FormEvent } from "react";
import { DEFAULT_HISTORY_FILTERS } from "@/data/history";
import type {
  AnalysisHistoryEntry,
  HistoryFiltersValue,
  HistoryRoleId,
  HistorySort,
} from "@/types/history";
import HistoryCard from "./HistoryCard";
import HistoryFilters from "./HistoryFilters";
import HistoryIcon from "./HistoryIcon";
import HistorySummary from "./HistorySummary";

function filterAndSortHistory(
  entries: AnalysisHistoryEntry[],
  filters: HistoryFiltersValue,
): AnalysisHistoryEntry[] {
  const normalizedQuery = filters.query.trim().toLocaleLowerCase("id-ID");

  const filtered = entries.filter((entry) => {
    const matchesQuery =
      !normalizedQuery ||
      entry.projectName.toLocaleLowerCase("id-ID").includes(normalizedQuery) ||
      entry.roleLabel.toLocaleLowerCase("id-ID").includes(normalizedQuery);

    const matchesRole =
      filters.role === "all" || entry.roleId === filters.role;

    return matchesQuery && matchesRole;
  });

  return [...filtered].sort((first, second) => {
    if (filters.sort === "newest") {
      return second.date.localeCompare(first.date);
    }

    if (filters.sort === "oldest") {
      return first.date.localeCompare(second.date);
    }

    // Analisis tanpa skor ditempatkan setelah analisis yang memiliki skor.
    const firstScore = first.match;
    const secondScore = second.match;

    if (firstScore === null && secondScore === null) return 0;
    if (firstScore === null) return 1;
    if (secondScore === null) return -1;

    if (filters.sort === "highest") {
      return secondScore - firstScore;
    }

    return firstScore - secondScore;
  });
}

function getRoleOptions(entries: AnalysisHistoryEntry[]) {
  const roles = new Map<HistoryRoleId, string>();

  for (const entry of entries) {
    if (
      entry.roleLabel.trim() &&
      entry.roleLabel !== "Belum ditentukan"
    ) {
      roles.set(entry.roleId, entry.roleLabel);
    }
  }

  return [...roles.entries()]
    .map(([value, label]) => ({ value, label }))
    .sort((a, b) => a.label.localeCompare(b.label, "id-ID"));
}

export default function AnalysisHistoryClient({
  entries,
  loadError = false,
}: {
  entries: AnalysisHistoryEntry[];
  loadError?: boolean;
}) {
  const [draftFilters, setDraftFilters] =
    useState<HistoryFiltersValue>(DEFAULT_HISTORY_FILTERS);

  const [appliedFilters, setAppliedFilters] =
    useState<HistoryFiltersValue>(DEFAULT_HISTORY_FILTERS);

  const [selectedEntry, setSelectedEntry] =
    useState<AnalysisHistoryEntry | null>(null);

  const dialogRef = useRef<HTMLDialogElement>(null);

  const results = useMemo(
    () => filterAndSortHistory(entries, appliedFilters),
    [entries, appliedFilters],
  );

  // Pilihan role berasal dari riwayat yang diterima dari Supabase.
  const roleOptions = useMemo(() => getRoleOptions(entries), [entries]);

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
        <p>
          Lihat kembali analisis dan skor kesiapan karier yang tersimpan
          di akunmu.
        </p>
      </header>

      {loadError && (
        <aside className="bkh-demoNotice" role="alert">
          <strong>Riwayat belum dapat dimuat.</strong>{" "}
          Silakan muat ulang halaman. Jika masalah berlanjut, periksa
          koneksi Supabase dan kebijakan akses data.
        </aside>
      )}

      <HistorySummary entries={entries} />

      <HistoryFilters
        value={draftFilters}
        roleOptions={roleOptions}
        onQueryChange={(query) =>
          setDraftFilters((current) => ({ ...current, query }))
        }
        onRoleChange={(role: "all" | HistoryRoleId) =>
          setDraftFilters((current) => ({ ...current, role }))
        }
        onSortChange={(sort: HistorySort) =>
          setDraftFilters((current) => ({ ...current, sort }))
        }
        onApply={applyFilters}
        onReset={resetFilters}
      />

      <section className="bkh-listSection" aria-labelledby="bkh-list-title">
        <div className="bkh-listHeading">
          <div>
            <h2 id="bkh-list-title">Daftar Riwayat Analisis</h2>
            <p aria-live="polite">
              Menampilkan {results.length} dari {entries.length} analisis.
            </p>
          </div>
        </div>

        {loadError ? null : results.length > 0 ? (
          <ol className="bkh-historyGrid">
            {results.map((entry) => (
              <HistoryCard
                key={entry.id}
                entry={entry}
                onOpen={openDetail}
              />
            ))}
          </ol>
        ) : (
          <div className="bkh-emptyState" role="status">
            <HistoryIcon name="search" size={42} />

            <h3>
              {entries.length === 0
                ? "Belum ada riwayat analisis"
                : "Riwayat tidak ditemukan"}
            </h3>

            <p>
              {entries.length === 0
                ? "Analisis yang kamu simpan akan muncul di halaman ini."
                : "Coba kata kunci atau filter lain."}
            </p>

            {entries.length > 0 && (
              <button type="button" onClick={resetFilters}>
                Reset pencarian dan filter
              </button>
            )}
          </div>
        )}
      </section>

      <dialog
        className="bkh-dialog"
        ref={dialogRef}
        aria-labelledby="bkh-dialog-title"
        onClose={() => setSelectedEntry(null)}
      >
        {selectedEntry && (
          <div className="bkh-dialogContent">
            <button
              className="bkh-dialogClose"
              type="button"
              onClick={closeDetail}
              aria-label="Tutup detail riwayat"
            >
              <HistoryIcon name="close" />
            </button>

            <span className="bkh-dialogIcon">
              <HistoryIcon name={selectedEntry.icon} size={34} />
            </span>

            <p className="bkh-dialogEyebrow">Detail analisis</p>
            <h2 id="bkh-dialog-title">{selectedEntry.projectName}</h2>

            <dl>
              <div>
                <dt>Target Role</dt>
                <dd>{selectedEntry.roleLabel}</dd>
              </div>

              <div>
                <dt>Tanggal Analisis</dt>
                <dd>
                  <time dateTime={selectedEntry.date || undefined}>
                    {selectedEntry.dateLabel}
                  </time>
                </dd>
              </div>

              <div>
                <dt>Skor Kesiapan</dt>
                <dd>
                  {selectedEntry.match === null
                    ? "Belum tersedia"
                    : `${selectedEntry.match}%`}
                </dd>
              </div>

              <div>
                <dt>Ringkasan</dt>
                <dd>{selectedEntry.summary || "Belum tersedia"}</dd>
              </div>

              <div>
                <dt>Teknologi</dt>
                <dd>
                  {selectedEntry.technologies.length > 0
                    ? selectedEntry.technologies.join(", ")
                    : "Belum tersedia"}
                </dd>
              </div>

              <div>
                <dt>Status</dt>
                <dd>{selectedEntry.status}</dd>
              </div>
            </dl>

            <button
              className="bkh-dialogDone"
              type="button"
              onClick={closeDetail}
            >
              Tutup
            </button>
          </div>
        )}
      </dialog>
    </article>
  );
}
