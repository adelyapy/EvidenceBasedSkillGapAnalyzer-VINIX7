import type { AnalysisStep } from "@/types/analysis";

const ANALYSIS_BASE = "/workspace/analisa-baru";

export const analysisRoutes = {
  uploadProject: ANALYSIS_BASE,
  targetRole: `${ANALYSIS_BASE}/target-role`,
  uploadCv: `${ANALYSIS_BASE}/upload-cv`,
  reviewInput: `${ANALYSIS_BASE}/review-input`,
  process: `${ANALYSIS_BASE}/proses-analisis`,
  question: (number: number) => `${ANALYSIS_BASE}/pertanyaan/${number}`,
  result: `${ANALYSIS_BASE}/hasil-analisis`,
  skillGap: `${ANALYSIS_BASE}/skill-gap-report`,
  roadmap: `${ANALYSIS_BASE}/roadmap`,
} as const;

export const analysisStorage = {
  projects: "buktiva.analysis.projects",
  targetRole: "buktiva.analysis.targetRole",
  jobDescription: "buktiva.analysis.jobDescription",
  cv: "buktiva.analysis.cv",
  activeAnalysisId: "buktiva.analysis.activeAnalysisId",
  validationAnswers: "buktiva.validation.answers",
  validationCompleted: "buktiva.validation.completed",
} as const;

export const analysisSteps: AnalysisStep[] = [
  { id: "project", label: "Upload Project", href: analysisRoutes.uploadProject },
  { id: "role", label: "Target Role", href: analysisRoutes.targetRole },
  { id: "cv", label: "CV", href: analysisRoutes.uploadCv },
  { id: "review", label: "Analisis", href: analysisRoutes.reviewInput },
];
