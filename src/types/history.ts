export type HistoryRoleId = "frontend" | "full-stack" | "data-analyst" | "mobile";

export type AnalysisHistoryEntry = {
  id: string;
  projectName: string;
  roleId: HistoryRoleId;
  roleLabel: string;
  technologies: string[];
  date: string;
  dateLabel: string;
  match: number;
  status: "Selesai";
  icon: "portfolio" | "commerce" | "analytics" | "mobile";
};

export type HistorySort = "oldest" | "newest" | "highest" | "lowest";

export type HistoryFiltersValue = {
  query: string;
  role: "all" | HistoryRoleId;
  sort: HistorySort;
};

export type HistorySummaryValue = {
  total: number;
  averageMatch: number;
  dominantRole: string | null;
  dominantRoleCount: number;
};
