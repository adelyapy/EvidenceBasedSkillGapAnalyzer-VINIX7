import type { AnalysisStep } from "@/types/analysis";

const ANALYSIS_BASE = "/workspace/analisa-baru";

export const analysisRoutes = {
  uploadCv: `${ANALYSIS_BASE}/upload-cv`,
  reviewInput: `${ANALYSIS_BASE}/review-input`,
  process: `${ANALYSIS_BASE}/proses-analisis`,
  question: (number: number) => `${ANALYSIS_BASE}/pertanyaan/${number}`,
  result: `${ANALYSIS_BASE}/hasil-analisis`,
} as const;

export const analysisStorage = {
  projects: "buktiva.analysis.projects",
  targetRole: "buktiva.analysis.targetRole",
  jobDescription: "buktiva.analysis.jobDescription",
  cv: "buktiva.analysis.cv",
  validationAnswers: "buktiva.validation.answers",
  validationCompleted: "buktiva.validation.completed",
} as const;

export const analysisSteps: AnalysisStep[] = [
  { id: "project", label: "Upload Project" },
  { id: "role", label: "Target Role" },
  { id: "cv", label: "CV", href: analysisRoutes.uploadCv },
  { id: "review", label: "Analisis", href: analysisRoutes.reviewInput },
];
