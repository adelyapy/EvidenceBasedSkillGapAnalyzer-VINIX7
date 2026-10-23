import type {
  AnalysisHistoryEntry,
  HistoryFiltersValue,
  HistorySummaryValue,
} from "@/types/history";

export const DEFAULT_HISTORY_FILTERS: HistoryFiltersValue = {
  query: "",
  role: "all",
  sort: "oldest",
};

// Data contoh dari HTML legacy. Bukan riwayat analisis pengguna atau hasil AI.
export const analysisHistory: AnalysisHistoryEntry[] = [
  {
    id: "website-portofolio",
    projectName: "Website Portofolio",
    roleId: "frontend",
    roleLabel: "Frontend Developer",
    technologies: ["HTML", "CSS", "JavaScript", "React"],
    date: "2026-08-12",
    dateLabel: "12 Agustus 2026",
    match: 79,
    status: "Selesai",
    icon: "portfolio",
  },
  {
    id: "platform-ecommerce",
    projectName: "Platform E-commerce",
    roleId: "full-stack",
    roleLabel: "Full Stack Developer",
    technologies: ["React", "Node.js", "MongoDB", "Express"],
    date: "2026-08-29",
    dateLabel: "29 Agustus 2026",
    match: 60,
    status: "Selesai",
    icon: "commerce",
  },
  {
    id: "dashboard-penjualan",
    projectName: "Dashboard Penjualan",
    roleId: "data-analyst",
    roleLabel: "Data Analyst",
    technologies: ["Python", "Pandas", "SQL", "Tableau"],
    date: "2026-09-03",
    dateLabel: "3 September 2026",
    match: 72,
    status: "Selesai",
    icon: "analytics",
  },
  {
    id: "aplikasi-belajar-mobile",
    projectName: "Aplikasi Belajar Mobile",
    roleId: "mobile",
    roleLabel: "Mobile Developer",
    technologies: ["Flutter", "Dart", "Firebase", "Figma"],
    date: "2026-09-14",
    dateLabel: "14 September 2026",
    match: 68,
    status: "Selesai",
    icon: "mobile",
  },
];

export const historyRoleOptions = [
  { value: "all", label: "Semua role" },
  { value: "frontend", label: "Frontend Developer" },
  { value: "full-stack", label: "Full Stack Developer" },
  { value: "data-analyst", label: "Data Analyst" },
  { value: "mobile", label: "Mobile Developer" },
] as const;

export function getHistorySummary(entries: AnalysisHistoryEntry[]): HistorySummaryValue {
  const total = entries.length;
  const averageMatch = total
    ? Math.round(entries.reduce((sum, entry) => sum + entry.match, 0) / total)
    : 0;
  const roleCounts = entries.reduce<Map<string, number>>((counts, entry) => {
    counts.set(entry.roleLabel, (counts.get(entry.roleLabel) ?? 0) + 1);
    return counts;
  }, new Map());
  const dominantRoleCount = Math.max(0, ...roleCounts.values());
  const dominantRoles = [...roleCounts.entries()].filter(([, count]) => count === dominantRoleCount);

  return {
    total,
    averageMatch,
    dominantRole: dominantRoles.length === 1 ? dominantRoles[0][0] : null,
    dominantRoleCount,
  };
}
