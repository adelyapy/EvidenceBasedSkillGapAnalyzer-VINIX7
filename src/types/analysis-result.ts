export type AnalysisResultIconName =
  | "download"
  | "portfolio"
  | "commerce"
  | "dashboard"
  | "consistency"
  | "growth"
  | "practice";

export type AnalysisResultSkill = {
  name: string;
  level: "Ahli" | "Mahir" | "Menengah";
  score: number;
};

export type AnalysisResultProject = {
  name: string;
  technologies: string;
  icon: AnalysisResultIconName;
};

export type AnalysisResultRecommendation = {
  text: string;
  icon: AnalysisResultIconName;
};

export type AnalysisResultDemo = {
  score: number;
  role: string;
  summary: string;
  skills: AnalysisResultSkill[];
  projects: AnalysisResultProject[];
  recommendations: AnalysisResultRecommendation[];
};
