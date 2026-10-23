import "server-only";
import { analysisInputSchema } from "@/types/analysis-input";
import { skillExtractionResultSchema } from "@/types/skill-extraction";
import { VALIDATION_PROMPT_VERSION, validationEvaluationResultSchema, type ValidationEvaluationResult } from "@/types/validation-evaluation";
import { initialCoverage, type EvidenceLimits } from "../evidence-preparer";
import { createGeminiSkillProvider, type SkillProvider } from "../gemini-skill-provider";
import { GeminiError } from "../gemini";
import { prepareValidationAnswers } from "./answer-preprocessor";
import { buildQuestionContext, type QuestionEvaluationContext, type ReviewedQuestionMapping } from "./question-context-builder";
import { evaluateAnswerModel } from "./answer-evaluator";
import { validateAnswerOutput } from "./answer-output-validator";
import { assessProvisionalCompetencies } from "./competency-assessment";
import { ValidationError } from "./errors";

export type ValidationDependencies = { provider?: SkillProvider; rubric?: unknown; reviewedMapping?: ReviewedQuestionMapping; evidenceLimits?: Partial<EvidenceLimits> };
/** Internal server function. Authenticated M3 input and server-held M4 snapshot required; no persistence. */
export async function evaluateValidationAnswers(rawAnalysis: unknown, rawExtraction: unknown, submission: unknown,
  dependencies: ValidationDependencies = {}): Promise<ValidationEvaluationResult> {
  const parsed = analysisInputSchema.safeParse(rawAnalysis);
  if (!parsed.success) throw new ValidationError("INVALID_INPUT");
  const input = parsed.data;
  const extraction = skillExtractionResultSchema.safeParse(rawExtraction);
  const provider = dependencies.provider ?? createGeminiSkillProvider();
  const safeModel = /^[a-zA-Z0-9._/-]{1,100}$/.test(provider.model) ? provider.model : "invalid-model";
  const base = { analysisId: input.analysisId, model: safeModel, promptVersion: VALIDATION_PROMPT_VERSION,
    rubricVersion: "unavailable", datasetVersion: "unavailable", evaluations: [], competencies: [], coverage: initialCoverage(input), extractionWarnings: [], warnings: [] };
  let context: QuestionEvaluationContext | undefined;
  try {
    if (!extraction.success) throw new ValidationError("EXTRACTION_INVALID");
    if (extraction.data.analysisId !== input.analysisId) throw new ValidationError("ANALYSIS_MISMATCH");
    if (!["completed", "partial"].includes(extraction.data.status)) throw new ValidationError("EXTRACTION_NOT_READY");
    const answers = prepareValidationAnswers(submission, input.analysisId, [input.userId]);
    context = buildQuestionContext(input, extraction.data, answers.questions, dependencies);
    const details = { datasetVersion: context.extraction.datasetVersion, rubricVersion: context.rubric.version,
      coverage: context.extraction.coverage, extractionWarnings: context.extraction.warnings };
    let response: { model: string; text: string };
    try { response = await evaluateAnswerModel(context, answers, provider); }
    catch (error) {
      if (error instanceof ValidationError) throw error;
      return validationEvaluationResultSchema.parse({ ...base, ...details, status: "failed", error: { code: "PROVIDER_FAILURE",
        ...(error instanceof GeminiError && error.status >= 400 && error.status <= 599 ? { providerStatus: error.status } : {}) } });
    }
    const evaluations = validateAnswerOutput(response.text, context, answers);
    if (!/^[a-zA-Z0-9._/-]{1,100}$/.test(response.model)) throw new ValidationError("INVALID_MODEL_OUTPUT");
    const incomplete = evaluations.some(e => e.dimensions.some(d => d.status === "not_assessable"));
    const warnings: ValidationEvaluationResult["warnings"] = ["MVP_RUBRIC_NOT_APPROVED"];
    if (context.questions.every(q => !q.relatedSkillIds.length)) warnings.push("NO_REVIEWED_SKILL_MAPPING");
    if (context.partial) warnings.push("PARTIAL_EVIDENCE");
    if (incomplete) warnings.push("ASSESSMENT_INCOMPLETE");
    return validationEvaluationResultSchema.parse({ ...base, ...details, model: response.model,
      status: context.partial || incomplete ? "partial" : "completed", evaluations,
      competencies: assessProvisionalCompetencies(context, evaluations), warnings });
  } catch (error) {
    const code = error instanceof ValidationError ? error.code : "INVALID_MODEL_OUTPUT";
    return validationEvaluationResultSchema.parse({ ...base,
      ...(context ? { datasetVersion: context.extraction.datasetVersion, rubricVersion: context.rubric.version,
        coverage: context.extraction.coverage, extractionWarnings: context.extraction.warnings } : {}),
      status: code === "INVALID_MODEL_OUTPUT" ? "failed" : "blocked", error: { code } });
  }
}
