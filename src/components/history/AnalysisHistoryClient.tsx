
"use client";

import Link from "next/link";
import {
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type FormEvent,
} from "react";
import { analysisRoutes } from "@/data/analysis";
import { DEFAULT_HISTORY_FILTERS } from "@/data/history";
import { useAnimatedDismiss } from "@/hooks/useAnimatedDismiss";
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
import { getHistoryStatusPresentation } from "./historyStatus";
import ProjectSourceIcon from "../analysis/ProjectSourceIcon";
import type { UploadProjectSource } from "@/types/upload-project";

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

type DialogScoreStyle = CSSProperties & {
  "--bkh-dialog-score": string;
};

function isCompleted(status: string) {
  return status.toLowerCase() === "completed";
}

function formatLevel(level: number | null) {
  if (level === null || !Number.isFinite(Number(level))) {
    return "Belum dapat dinilai";
  }

  return `${Number(level).toLocaleString("id-ID")} / 5`;
}

function formatConfidence(score: number | null) {
  if (score === null || !Number.isFinite(Number(score))) {
    return "Tidak tersedia";
  }

  const value = Number(score);
  return `${Math.round(value <= 1 ? value * 100 : value)}%`;
}

function priorityLabel(priority: string) {
  const labels: Record<string, string> = {
    low: "Rendah",
    medium: "Sedang",
    high: "Tinggi",
    critical: "Kritis",
  };

  return labels[priority] ?? priority;
}

function calculateTargetProgress(
  currentLevel: number | null,
  requiredLevel: number,
) {
  if (currentLevel === null) return null;

  const current = Number(currentLevel);
  const required = Number(requiredLevel);

  if (
    !Number.isFinite(current) ||
    !Number.isFinite(required) ||
    required <= 0
  ) {
    return null;
  }

  return Math.round(Math.min(100, Math.max(0, (current / required) * 100)));
}

function getEvidenceSource(
  evidenceType: string,
  url: string | null,
): UploadProjectSource {
  const source = `${evidenceType} ${url ?? ""}`.toLowerCase();

  if (source.includes("github")) return "github";
  if (source.includes("linkedin")) return "linkedin";
  if (source.includes("deploy")) return "deployment";
  if (source.includes("pdf")) return "pdf";
  return "portfolio";
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
  const {
    isClosing: detailDialogClosing,
    requestDismiss: closeDetail,
  } = useAnimatedDismiss({
    onDismiss: () => dialogRef.current?.close(),
  });

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
          <div className="bkh-emptyState">
            <span className="bkh-emptyStateIcon" aria-hidden="true">
              <HistoryIcon
                name={entries.length === 0 ? "history" : "search"}
                size={27}
              />
            </span>

            <div className="bkh-emptyStateMessage" role="status">
              <h3>
                {entries.length === 0
                  ? "Belum ada riwayat analisis"
                  : "Riwayat tidak ditemukan"}
              </h3>

              <p>
                {entries.length === 0
                  ? "Mulai analisis pertamamu untuk menyimpan hasil kompetensi, skill gap, dan roadmap karier di sini."
                  : "Tidak ada riwayat yang cocok dengan kata kunci atau filter saat ini."}
              </p>
            </div>

            {entries.length === 0 ? (
              <Link
                className="bkh-emptyStateAction"
                href={analysisRoutes.uploadProject}
              >
                <HistoryIcon name="plus" size={19} />
                Mulai analisis
              </Link>
            ) : (
              <button
                className="bkh-emptyStateAction"
                type="button"
                onClick={resetFilters}
              >
                Reset pencarian dan filter
              </button>
            )}
          </div>
        )}
      </section>

      <dialog
        className={`bkh-dialog${
          detailDialogClosing ? " bkh-dialog--closing" : ""
        }`}
        ref={dialogRef}
        aria-labelledby="bkh-dialog-title"
        onCancel={(event) => {
          event.preventDefault();
          closeDetail();
        }}
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

            <header className="bkh-resultDialogHeader">
              <span className="bkh-dialogIcon" aria-hidden="true">
                <HistoryIcon name={selectedEntry.icon} size={30} />
              </span>

              <div>
                <p className="bkh-dialogEyebrow">Hasil analisis</p>
                <h2 id="bkh-dialog-title">{selectedEntry.projectName}</h2>
                <span
                  className={`bkh-dialogStatus bkh-status--${getHistoryStatusPresentation(selectedEntry.statusKey).tone}`}
                >
                  <HistoryIcon
                    name={
                      getHistoryStatusPresentation(selectedEntry.statusKey)
                        .icon
                    }
                    size={15}
                  />
                  {selectedEntry.status}
                </span>
              </div>
            </header>

            <section className="bkh-dialogOverview" aria-label="Ringkasan hasil">
              <div className="bkh-dialogOverviewCopy">
                <p className="bkh-dialogSectionLabel">Target role</p>
                <h3>{selectedEntry.roleLabel}</h3>
                <p className="bkh-dialogSummary">
                  {isCompleted(selectedEntry.statusKey) && selectedEntry.summary
                    ? selectedEntry.summary
                    : selectedEntry.statusKey.toLowerCase() === "failed"
                      ? "Analisis ini gagal diproses. Silakan mulai analisis baru setelah memeriksa data proyek Anda."
                      : "Hasil lengkap akan tersedia setelah proses analisis selesai dan tersimpan."}
                </p>

                <dl className="bkh-dialogMeta">
                  <div>
                    <dt>Dibuat pada</dt>
                    <dd>
                      <time dateTime={selectedEntry.date || undefined}>
                        {selectedEntry.dateTimeLabel}
                      </time>
                    </dd>
                  </div>
                  <div>
                    <dt>Status</dt>
                    <dd>{selectedEntry.status}</dd>
                  </div>
                </dl>
              </div>

              <div
                className={`bkh-dialogScoreRing${
                  selectedEntry.match === null
                    ? " bkh-dialogScoreRing--empty"
                    : ""
                }`}
                style={
                  {
                    "--bkh-dialog-score": `${selectedEntry.match ?? 0}%`,
                  } as DialogScoreStyle
                }
                aria-label={`Skor kesiapan ${
                  selectedEntry.match === null
                    ? "belum tersedia"
                    : `${selectedEntry.match}%`
                }`}
              >
                <div>
                  <span>Skor kesiapan</span>
                  <strong>
                    {selectedEntry.match === null
                      ? "—"
                      : `${selectedEntry.match}%`}
                  </strong>
                </div>
              </div>
            </section>

            <section className="bkh-dialogResultSection bkh-dialogEvidencePanel">
              <div className="bkh-dialogSectionHeading">
                <div>
                  <p className="bkh-dialogSectionLabel">Dasar penilaian</p>
                  <h3>Bukti Proyek</h3>
                </div>
                <span>{selectedEntry.evidences.length} bukti</span>
              </div>

              {selectedEntry.evidences.length === 0 ? (
                <p className="bkh-dialogEmptyCopy">
                  Belum ada bukti proyek yang tersimpan untuk analisis ini.
                </p>
              ) : (
                <ul className="bkh-dialogEvidenceList">
                  {selectedEntry.evidences.map((evidence) => (
                    <li key={evidence.id}>
                      <span className="bkh-dialogEvidenceIcon" aria-hidden="true">
                        <ProjectSourceIcon
                          source={getEvidenceSource(
                            evidence.evidenceType,
                            evidence.url,
                          )}
                          size={20}
                        />
                      </span>
                      <div>
                        <strong>{evidence.title || "Bukti proyek"}</strong>
                        <span>Jenis: {evidence.evidenceType}</span>
                        {evidence.description && <p>{evidence.description}</p>}
                        {evidence.url && (
                          <a
                            href={evidence.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Buka bukti proyek ↗
                          </a>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {isCompleted(selectedEntry.statusKey) && (
              <>
                <section className="bkh-dialogResultSection bkh-dialogCompetencyPanel">
                  <div className="bkh-dialogSectionHeading">
                    <div>
                      <p className="bkh-dialogSectionLabel">Kekuatan saat ini</p>
                      <h3>Evaluasi Kompetensi</h3>
                    </div>
                  </div>

                  {selectedEntry.skillResults.length === 0 ? (
                    <p className="bkh-dialogEmptyCopy">
                      Belum ada data kompetensi yang tersimpan untuk analisis ini.
                    </p>
                  ) : (
                    <ul className="bkh-dialogResultCards">
                      {selectedEntry.skillResults.map((skill) => (
                        <li key={skill.id}>
                          <div className="bkh-dialogCardTop">
                            <strong>{skill.skillName || "Keterampilan tidak bernama"}</strong>
                            <span>{formatLevel(skill.estimatedLevel)}</span>
                          </div>
                          <p><b>Hasil Persentase Kompetensi</b> {formatConfidence(skill.confidenceScore)}</p>
                          <p className="bkh-dialogCardDescription">
                            {skill.evidenceSummary ||
                              "Belum ada ringkasan bukti yang tersedia."}
                          </p>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>

                <section className="bkh-dialogResultSection bkh-dialogGapPanel">
                  <div className="bkh-dialogSectionHeading">
                    <div>
                      <p className="bkh-dialogSectionLabel">Fokus pengembangan</p>
                      <h3>Kesenjangan Keterampilan</h3>
                    </div>
                  </div>

                  {selectedEntry.skillGaps.length === 0 ? (
                    <p className="bkh-dialogEmptyCopy">
                      Belum ada data skill gap yang tersimpan untuk analisis ini.
                    </p>
                  ) : (
                    <ul className="bkh-dialogResultCards">
                      {selectedEntry.skillGaps.map((gap) => (
                        <li key={gap.id}>
                          <div className="bkh-dialogCardTop">
                            <strong>{gap.skillName || "Keterampilan tidak bernama"}</strong>
                            <span className={`bkh-dialogPriority bkh-dialogPriority--${gap.priority}`}>
                              {priorityLabel(gap.priority)}
                            </span>
                          </div>
                          <dl className="bkh-dialogGapStats">
                            <div><dt>Saat ini</dt><dd>{formatLevel(gap.currentLevel)}</dd></div>
                            <div><dt>Target</dt><dd>{formatLevel(gap.requiredLevel)}</dd></div>
                            <div><dt>Gap</dt><dd>{Number(gap.gapScore).toLocaleString("id-ID")}</dd></div>
                          </dl>
                          <p className="bkh-dialogCardDescription">
                            {gap.explanation || "Belum ada penjelasan yang tersedia."}
                          </p>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>

                <section className="bkh-dialogResultSection bkh-dialogProgressPanel">
                  <div className="bkh-dialogSectionHeading">
                    <div>
                      <p className="bkh-dialogSectionLabel">
                        Progres terhadap target
                      </p>
                      <h3>Persentase Penguasaan Skill</h3>
                    </div>
                  </div>

                  {selectedEntry.skillGaps.length === 0 ? (
                    <p className="bkh-dialogEmptyCopy">
                      Belum ada data level skill yang dapat dihitung.
                    </p>
                  ) : (
                    <ul className="bkh-dialogProgressList">
                      {selectedEntry.skillGaps.map((gap) => {
                        const percentage = calculateTargetProgress(
                          gap.currentLevel,
                          gap.requiredLevel,
                        );
                        const skillName =
                          gap.skillName || "Keterampilan tidak bernama";

                        return (
                          <li key={gap.id}>
                            <div className="bkh-dialogProgressHeading">
                              <strong>{skillName}</strong>
                              <span>
                                {percentage === null ? "—" : `${percentage}%`}
                              </span>
                            </div>
                            <div
                              className={`bkh-dialogProgressTrack${
                                percentage === null
                                  ? " bkh-dialogProgressTrack--empty"
                                  : ""
                              }`}
                              role="progressbar"
                              aria-label={`Pemenuhan target ${skillName}`}
                              aria-valuemin={0}
                              aria-valuemax={100}
                              aria-valuenow={percentage ?? undefined}
                              aria-valuetext={
                                percentage === null
                                  ? "Belum dapat dihitung"
                                  : `${percentage} persen dari target role`
                              }
                            >
                              <span
                                style={
                                  {
                                    "--bkh-skill-progress": `${percentage ?? 0}%`,
                                  } as CSSProperties
                                }
                              />
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </section>

                <section className="bkh-dialogResultSection bkh-dialogRoadmapPanel">
                  <div className="bkh-dialogSectionHeading">
                    <div>
                      <p className="bkh-dialogSectionLabel">Langkah berikutnya</p>
                      <h3>Roadmap Pengembangan</h3>
                    </div>
                    {selectedEntry.roadmapItems.length > 0 && (
                      <span>{selectedEntry.roadmapItems.length} langkah</span>
                    )}
                  </div>

                  {selectedEntry.roadmapItems.length === 0 ? (
                    <p className="bkh-dialogEmptyCopy">
                      Roadmap pengembangan belum tersedia untuk analisis ini.
                    </p>
                  ) : (
                    <ol className="bkh-dialogRoadmapList">
                      {selectedEntry.roadmapItems.map((item, index) => (
                        <li key={item.id}>
                          <span
                            className="bkh-dialogRoadmapNumber"
                            aria-label={`Langkah ${index + 1}`}
                          >
                            {String(index + 1).padStart(2, "0")}
                          </span>
                          <article className="bkh-dialogRoadmapCard">
                            <div className="bkh-dialogRoadmapHeading">
                              <h4>{item.title}</h4>
                              <div className="bkh-dialogRoadmapTags">
                                {item.priority && (
                                  <span>{priorityLabel(item.priority)}</span>
                                )}
                              </div>
                            </div>
                            {item.description && <p>{item.description}</p>}
                            {item.resourceUrl && (
                              <a
                                href={item.resourceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                Buka sumber belajar ↗
                              </a>
                            )}
                          </article>
                        </li>
                      ))}
                    </ol>
                  )}
                </section>
              </>
            )}

            <aside className="bkh-dialogNotice">
              {isCompleted(selectedEntry.statusKey) &&
              selectedEntry.skillResults.length > 0 ? (
                <>
                  <strong>Hasil evaluasi AI tersedia.</strong>
                  <p>
                    Data kompetensi dan kesenjangan keterampilan ditampilkan
                    berdasarkan hasil evaluasi yang tersimpan. Tingkat penguasaan
                    merupakan estimasi AI berdasarkan bukti dan jawaban validasi,
                    bukan pengukuran mutlak kemampuan pengguna.
                  </p>
                </>
              ) : (
                <>
                  <strong>Hasil evaluasi belum lengkap.</strong>
                  <p>
                    Data target role, bukti proyek, ringkasan, dan skor kesiapan
                    dapat tersedia secara terpisah. Jika data kompetensi atau skill
                    gap belum tersimpan, hasil tersebut belum dapat ditampilkan.
                  </p>
                </>
              )}
            </aside>

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
