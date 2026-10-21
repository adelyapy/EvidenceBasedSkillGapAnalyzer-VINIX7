export type AnalysisStepId = "project" | "role" | "cv" | "review";

export type AnalysisStep = {
  id: AnalysisStepId;
  label: string;
  href?: string;
};

export type AnalysisProject = {
  type?: string;
  value?: string;
  name?: string;
  title?: string;
  description?: string;
  deskripsi?: string;
  link?: string;
  url?: string;
  evidenceKind?: "url" | "pdf";
  fileName?: string;
  fileSize?: number;
  fileType?: string;
};

export type AnalysisCv = {
  name: string;
  size?: number;
  type?: string;
};

export type AnalysisInput = {
  projects: AnalysisProject[];
  role: string;
  jobDescription: string;
  cv: AnalysisCv | null;
};
