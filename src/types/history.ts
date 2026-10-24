export type HistoryRoleId =
  | "frontend"
  | "full-stack"
  | "data-analyst"
  | "mobile"
  | "other";

export type HistorySort = "oldest" | "newest" | "highest" | "lowest";

export type HistoryFiltersValue = {
  query: string;
  role: "all" | HistoryRoleId;
  sort: HistorySort;
};
export type AnalysisHistoryEntry = {
  id: string;
  projectName: string;
  roleId: HistoryRoleId;
  roleLabel: string;
  technologies: string[];
  date: string;
  dateLabel: string;
  match: number | null;
  status: string;
  icon: "portfolio" | "commerce" | "analytics" | "mobile";
  summary: string | null;
};

export type HistorySummaryValue = {
  total: number;
  averageMatch: number | null;
  dominantRole: string | null;
  dominantRoleCount: number;
};
