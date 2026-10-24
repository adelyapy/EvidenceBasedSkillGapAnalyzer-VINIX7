import type {
  AnalysisHistoryEntry,
  HistoryFiltersValue,
  HistorySummaryValue,
} from "@/types/history";

export const DEFAULT_HISTORY_FILTERS: HistoryFiltersValue = {
  query: "",
  role: "all",
  sort: "newest",
};

export const historyRoleOptions = [
  { value: "all", label: "Semua role" },
  { value: "frontend", label: "Frontend Developer" },
  { value: "full-stack", label: "Full Stack Developer" },
  { value: "data-analyst", label: "Data Analyst" },
  { value: "mobile", label: "Mobile Developer" },
  { value: "other", label: "Role lainnya" },
] as const;

export function getHistorySummary(
  entries: AnalysisHistoryEntry[],
): HistorySummaryValue {
  const total = entries.length;
  const scoredEntries = entries.filter((entry) => entry.match !== null);

  const averageMatch = scoredEntries.length
    ? Math.round(
        scoredEntries.reduce((sum, entry) => sum + (entry.match ?? 0), 0) /
          scoredEntries.length,
      )
    : null;

  const roleCounts = entries.reduce<Map<string, number>>((counts, entry) => {
    counts.set(entry.roleLabel, (counts.get(entry.roleLabel) ?? 0) + 1);
    return counts;
  }, new Map());

  const dominantRoleCount = Math.max(0, ...roleCounts.values());

  const dominantRoles = [...roleCounts.entries()].filter(
    ([, count]) => count === dominantRoleCount,
  );

  return {
    total,
    averageMatch,
    dominantRole: dominantRoles.length === 1 ? dominantRoles[0][0] : null,
    dominantRoleCount,
  };
}
