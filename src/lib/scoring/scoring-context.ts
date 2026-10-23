import "server-only";
import { analysisInputSchema } from "@/types/analysis-input";
import { skillExtractionResultSchema } from "@/types/skill-extraction";
import { validationEvaluationResultSchema } from "@/types/validation-evaluation";
import { createValidationQuestions } from "@/lib/ai/validation/question-catalog";
import { buildQuestionContext } from "@/lib/ai/validation/question-context-builder";
import { validateAnswerOutput } from "@/lib/ai/validation/answer-output-validator";
import { assessProvisionalCompetencies } from "@/lib/ai/validation/competency-assessment";
import { containsPersonalData } from "@/lib/ai/evidence-preparer";
import { validateRubricDataset } from "@/lib/ai/rubric-dataset";
import { parseScoringPolicy, type ScoringPolicy } from "./scoring-policy";
import { ScoringError } from "./errors";

export function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  if (value && typeof value === "object") return `{${Object.entries(value).sort(([a],[b]) => a < b ? -1 : a > b ? 1 : 0).map(([key,v]) => `${JSON.stringify(key)}:${canonical(v)}`).join(",")}}`;
  return JSON.stringify(value);
}
/** Requires server-held M4/M5 snapshots. Original full answers are intentionally not part of M6. */
export function prepareScoringContext(rawAnalysis: unknown, rawExtraction: unknown, rawValidation: unknown, rawPolicy: ScoringPolicy) {
  const policy = parseScoringPolicy(rawPolicy);
  const a = analysisInputSchema.safeParse(rawAnalysis), e = skillExtractionResultSchema.safeParse(rawExtraction), v = validationEvaluationResultSchema.safeParse(rawValidation);
  if (!a.success || !e.success || !v.success) throw new ScoringError("INVALID_INPUT");
  const input = a.data, extraction = e.data, validation = v.data;
  if (input.analysisId !== extraction.analysisId || input.analysisId !== validation.analysisId) throw new ScoringError("ANALYSIS_MISMATCH");
  if (input.targetRole.slug !== policy.supportedRole) throw new ScoringError("ROLE_MISMATCH");
  if ([input.targetRole.name, ...input.benchmarks.flatMap(b => [b.skillName, String(b.priority)])].some(text => containsPersonalData(text) || text.includes(input.userId))) throw new ScoringError("INVALID_INPUT");
  const extractionReady = ["completed", "partial"].includes(extraction.status);
  const validationReady = ["completed", "partial"].includes(validation.status);
  if (validationReady && !extractionReady) throw new ScoringError("INVALID_SNAPSHOT");
  if ((extractionReady && extraction.datasetVersion !== policy.datasetVersion) ||
      (validationReady && (validation.datasetVersion !== policy.datasetVersion || validation.rubricVersion !== policy.validationRubricVersion))) throw new ScoringError("VERSION_MISMATCH");
  const questions = createValidationQuestions(input.analysisId);
  let projectContext: ReturnType<typeof buildQuestionContext> | undefined;
  if (extractionReady) {
    try {
      const mapping = validationReady ? validation.evaluations.flatMap(evaluation => {
        const question = questions.find(q => q.questionId === evaluation.questionId);
        if (!question) throw new Error();
        return evaluation.relatedSkillIds.length ? [{ order: question.order, skillIds: evaluation.relatedSkillIds, provenance: "reviewed-server-mapping" as const }] : [];
      }) : [];
      projectContext = buildQuestionContext(input, extraction, questions, { reviewedMapping: mapping });
      if (validationReady) {
        if (canonical(validation.coverage) !== canonical(extraction.coverage) || canonical(validation.extractionWarnings) !== canonical(extraction.warnings)) throw new Error();
        // Recheck references, dimensions and subtotal from the server-held M5 excerpt.
        // Cannot reauthenticate answer hashes or verify full answer text without the original submission.
        const answers = { analysisId: input.analysisId, questions, answers: validation.evaluations.map(e => ({ questionId: e.questionId, answerText: e.answerQuote, answerRef: e.answerRef })) };
        const modelOutput = { evaluations: validation.evaluations.map(({ answerQuality: _quality, ...evaluation }) => { void _quality; return evaluation; }) };
        const checked = validateAnswerOutput(JSON.stringify(modelOutput), projectContext, answers);
        if (canonical(checked) !== canonical(validation.evaluations) ||
            canonical(assessProvisionalCompetencies(projectContext, checked)) !== canonical(validation.competencies) ||
            ((projectContext.partial || checked.some(e => e.dimensions.some(d => d.status === "not_assessable"))) && validation.status !== "partial")) throw new Error();
      }
    } catch { throw new ScoringError("INVALID_SNAPSHOT"); }
  }
  const rubrics = validateRubricDataset().rubrics.roles.find(role => role.slug === policy.supportedRole)!.rubrics;
  return { input, extraction, validation, policy, questions, projectContext, upstreamReady: extractionReady && validationReady,
    partial: input.processingStatus !== "complete" || extraction.status !== "completed" || validation.status !== "completed",
    skillKey: (name: string) => rubrics.find(r => r.aliases.some(alias => alias.normalize("NFKC").trim().toLowerCase() === name.normalize("NFKC").trim().toLowerCase()))?.key,
  };
}
export type ScoringContext = ReturnType<typeof prepareScoringContext>;
