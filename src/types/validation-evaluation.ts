import "server-only";
import { z } from "zod";
import { databaseInt8Schema, uuidSchema } from "./analysis-input";
import { evidenceRefSchema, extractionCoverageSchema, extractionWarningSchema } from "./skill-extraction";

export const VALIDATION_PROMPT_VERSION = "buktiva-validation-1.0.0";
export const ANSWER_LIMITS = Object.freeze({ characters: 1000, bytes: 4000, totalBytes: 20000 });
const nonblank = z.string().min(1).refine(value => Boolean(value.trim()));
export const validationQuestionSchema = z.object({
  questionId: uuidSchema, analysisId: uuidSchema, order: z.number().int().min(1).max(5),
  questionText: nonblank.pipe(z.string().max(1000)),
  evidenceContext: z.object({ relatedSkillIds: z.array(databaseInt8Schema).max(32), evidenceRefs: z.array(evidenceRefSchema).max(8) }).strict().optional(),
}).strict();
export const validationAnswerSchema = z.object({
  questionId: uuidSchema,
  answerText: nonblank.pipe(z.string().max(ANSWER_LIMITS.characters))
    .refine(value => value.length <= ANSWER_LIMITS.characters && Buffer.byteLength(value) <= ANSWER_LIMITS.bytes),
}).strict();
export const validationSubmissionSchema = z.object({
  analysisId: uuidSchema, questions: z.array(validationQuestionSchema).length(5), answers: z.array(validationAnswerSchema).length(5),
}).strict().superRefine((submission, context) => {
  const ids = new Set(submission.questions.map(question => question.questionId));
  if (ids.size !== 5 || new Set(submission.questions.map(question => question.order)).size !== 5 ||
      submission.questions.some(question => question.analysisId !== submission.analysisId) ||
      new Set(submission.answers.map(answer => answer.questionId)).size !== 5 ||
      submission.answers.some(answer => !ids.has(answer.questionId)) ||
      submission.answers.reduce((bytes, answer) => bytes + Buffer.byteLength(answer.answerText), 0) > ANSWER_LIMITS.totalBytes) {
    context.addIssue({ code: "custom", message: "Invalid five-question relationship" });
  }
});
export type ValidationQuestion = z.infer<typeof validationQuestionSchema>;
export type ValidationAnswer = z.infer<typeof validationAnswerSchema>;
export type ValidationSubmission = z.infer<typeof validationSubmissionSchema>;

export const dimensionIdSchema = z.enum(["relevance", "technical_accuracy", "evidence_consistency", "contribution_clarity"]);
export const alignmentSchema = z.enum(["supported", "insufficient_evidence", "contradicted"]);
export const dimensionEvaluationSchema = z.object({
  dimensionId: dimensionIdSchema, status: z.enum(["assessed", "not_assessable"]),
  score: z.number().int().min(0).max(4).nullable(), maxScore: z.literal(4), reason: nonblank.pipe(z.string().max(500)),
}).strict().superRefine((dimension, context) => {
  if ((dimension.status === "assessed") !== (dimension.score !== null)) context.addIssue({ code: "custom", message: "Invalid dimension score status" });
});
export const modelQuestionEvaluationSchema = z.object({
  questionId: uuidSchema, answerRef: z.string().regex(/^answer_[a-f0-9]{24}$/),
  answerQuote: nonblank.pipe(z.string().max(300)), dimensions: z.array(dimensionEvaluationSchema).min(1).max(4),
  evidenceAlignment: alignmentSchema, relatedSkillIds: z.array(databaseInt8Schema).max(32),
  evidenceRefs: z.array(evidenceRefSchema).max(8), feedback: nonblank.pipe(z.string().max(1000)),
}).strict();
export const modelValidationOutputSchema = z.object({ evaluations: z.array(modelQuestionEvaluationSchema).length(5) }).strict();
export const questionEvaluationSchema = modelQuestionEvaluationSchema.extend({
  // Deterministic subtotal of assessed answer-quality dimensions; no cross-question total.
  answerQuality: z.object({ score: z.number().int().min(0).max(16).nullable(), maxScore: z.number().int().min(0).max(16),
    assessedDimensions: z.number().int().min(0).max(4), configuredDimensions: z.number().int().min(1).max(4) }).strict(),
}).superRefine((evaluation, context) => {
  const assessed = evaluation.dimensions.filter(dimension => dimension.status === "assessed");
  const quality = evaluation.answerQuality;
  if (quality.assessedDimensions !== assessed.length || quality.configuredDimensions !== evaluation.dimensions.length ||
      quality.maxScore !== assessed.length * 4 || quality.score !== (assessed.length ? assessed.reduce((sum, dimension) => sum + dimension.score!, 0) : null)) {
    context.addIssue({ code: "custom", message: "Inconsistent deterministic subtotal" });
  }
});
export const provisionalCompetencySchema = z.object({
  skillId: databaseInt8Schema, status: z.enum(["validation_supported", "needs_review", "insufficient_evidence", "contradicted"]),
  reasonCode: z.enum(["EVIDENCE_AND_ANSWERS_SUPPORT", "PARTIAL_OR_UNCERTAIN", "NO_LINKED_EVIDENCE", "CONCRETE_CONTRADICTION"]),
  questionIds: z.array(uuidSchema).max(5), evidenceRefs: z.array(evidenceRefSchema).max(40),
}).strict();
export const validationEvaluationResultSchema = z.object({
  analysisId: uuidSchema, status: z.enum(["completed", "partial", "blocked", "failed"]), model: z.string().min(1).max(100),
  promptVersion: z.literal(VALIDATION_PROMPT_VERSION), rubricVersion: z.string().min(1).max(100), datasetVersion: z.string().min(1).max(100),
  evaluations: z.array(questionEvaluationSchema).max(5), competencies: z.array(provisionalCompetencySchema).max(32),
  coverage: extractionCoverageSchema,
  extractionWarnings: z.array(extractionWarningSchema).max(12),
  warnings: z.array(z.enum(["MVP_RUBRIC_NOT_APPROVED", "NO_REVIEWED_SKILL_MAPPING", "PARTIAL_EVIDENCE", "ASSESSMENT_INCOMPLETE"])).max(4),
  error: z.object({ code: z.string().regex(/^[A-Z_]+$/).max(80), providerStatus: z.number().int().min(400).max(599).optional() }).strict().optional(),
}).strict().superRefine((result, context) => {
  const success = result.status === "completed" || result.status === "partial";
  if (success ? (result.evaluations.length !== 5 || Boolean(result.error) || new Set(result.evaluations.map(e => e.questionId)).size !== 5 || new Set(result.competencies.map(s => s.skillId)).size !== result.competencies.length)
    : (result.evaluations.length > 0 || result.competencies.length > 0 || !result.error)) context.addIssue({ code: "custom", message: "Invalid evaluation outcome" });
});
export type ModelQuestionEvaluation = z.infer<typeof modelQuestionEvaluationSchema>;
export type QuestionEvaluation = z.infer<typeof questionEvaluationSchema>;
export type ProvisionalCompetency = z.infer<typeof provisionalCompetencySchema>;
export type ValidationEvaluationResult = z.infer<typeof validationEvaluationResultSchema>;
