export type DashboardStat = {
  label: string;
  value: number;
  icon: string;
};

export type DashboardRecommendation = {
  title: string;
  description: string;
  icon: string;
};

export type DashboardAnalysis = {
  score: number;
  role: string;
  description: string;
  strengths: string[];
  improvements: string[];
};

export type DashboardRoadmapStep = { label: string };
