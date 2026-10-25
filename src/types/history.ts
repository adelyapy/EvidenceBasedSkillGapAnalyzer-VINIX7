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
  dateTimeLabel: string;
  match: number | null;
  status: string;
  statusKey: string;
  icon: "portfolio" | "commerce" | "analytics" | "mobile";
  summary: string | null;
  evidences: HistoryProjectEvidence[];
  skillResults: HistorySkillResult[];
  skillGaps: HistorySkillGap[];
};

export type HistorySummaryValue = {
  total: number;
  averageMatch: number | null;
  dominantRole: string | null;
  dominantRoleCount: number;
};

export type HistoryProjectEvidence = {
  id: string;
  evidenceType: string;
  title: string | null;
  url: string | null;
  description: string | null;
};

export type HistorySkillResult = {
  id: string;
  skillName: string | null;
  estimatedLevel: number | null;
  confidenceScore: number | null;
  evidenceSummary: string | null;
};

export type HistorySkillGap = {
  id: string;
  skillName: string | null;
  currentLevel: number | null;
  requiredLevel: number;
  gapScore: number;
  priority: string;
  explanation: string | null;
};
