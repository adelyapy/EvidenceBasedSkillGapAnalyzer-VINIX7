export interface EvidenceInput {
  sourceType: "github" | "pdf" | "cv" | "portfolio";
  sourceId: string;
  content: string;
}

export interface ValidationAnswerInput {
  questionId: number;
  answer: string;
}

export interface AnalysisInput {
  analysisId: string;
  targetRoleId: string;
  evidence: EvidenceInput[];
  validationAnswers: ValidationAnswerInput[];
}

export interface RawAISkill {
  skillId: string;
  level: number;
  confidence: number;
  reason: string;
  evidenceRefs: string[];
}

export interface RawAIOutput {
  analysisId: string;
  skills: RawAISkill[];
  validationPassed: boolean;
}

export interface FormattedAIResult extends RawAIOutput {
  status: "completed" | "failed" | "partial";
  processedAt: string;
}
