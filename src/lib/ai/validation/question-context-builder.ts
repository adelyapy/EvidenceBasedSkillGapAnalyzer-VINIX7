import "server-only";
import { z } from "zod";
import { analysisInputSchema, databaseInt8Schema } from "@/types/analysis-input";
import { skillExtractionResultSchema } from "@/types/skill-extraction";
import { validationQuestionSchema } from "@/types/validation-evaluation";
import { prepareEvidence, type EvidenceLimits } from "../evidence-preparer";
import { validateSkillOutput } from "../skill-output-validator";
import { validateRubricDataset } from "../rubric-dataset";
import { createValidationQuestions } from "./question-catalog";
import { loadValidationRubrics } from "./rubrics";
import { ValidationError } from "./errors";

const mappingSchema = z.array(z.object({ order: z.number().int().min(1).max(5),
  skillIds: z.array(databaseInt8Schema).max(32), provenance: z.literal("reviewed-server-mapping") }).strict()).max(5);
export type ReviewedQuestionMapping = z.infer<typeof mappingSchema>;

/** Mapping is trusted server configuration, never a field accepted from a submission/model. */
export function buildQuestionContext(rawAnalysis: unknown, rawExtraction: unknown, rawQuestions: unknown, options: {
  rubric?: unknown; reviewedMapping?: ReviewedQuestionMapping; evidenceLimits?: Partial<EvidenceLimits>;
} = {}) {
  const analysis = analysisInputSchema.safeParse(rawAnalysis);
  const extracted = skillExtractionResultSchema.safeParse(rawExtraction);
  const questions = z.array(validationQuestionSchema).length(5).safeParse(rawQuestions);
  if (!analysis.success || !extracted.success || !questions.success) throw new ValidationError("INVALID_INPUT");
  const input = analysis.data; const extraction = extracted.data;
  if (extraction.analysisId !== input.analysisId || questions.data.some(q => q.analysisId !== input.analysisId)) throw new ValidationError("ANALYSIS_MISMATCH");
  if (!["completed", "partial"].includes(extraction.status) || !["complete", "partial"].includes(input.processingStatus)) throw new ValidationError("EXTRACTION_NOT_READY");
  const officialQuestions = createValidationQuestions(input.analysisId);
  if (new Set(questions.data.map(q => q.questionId)).size !== 5 || questions.data.some(q => {
    const official = officialQuestions.find(o => o.questionId === q.questionId);
    return !official || official.order !== q.order || official.questionText !== q.questionText || q.evidenceContext !== undefined;
  })) throw new ValidationError("UNTRUSTED_QUESTION");
  const rubric = loadValidationRubrics(options.rubric);
  if (extraction.datasetVersion !== rubric.extractionDatasetVersion || extraction.datasetVersion !== validateRubricDataset().manifest.datasetVersion) throw new ValidationError("VERSION_MISMATCH");
  const prepared = prepareEvidence(input, options.evidenceLimits);
  if (!prepared.index.length) throw new ValidationError("NO_SAFE_EVIDENCE");
  try { validateSkillOutput(JSON.stringify({ skills: extraction.skills }), input, prepared); }
  catch { throw new ValidationError("EXTRACTION_INVALID"); }
  if (JSON.stringify(extraction.coverage) !== JSON.stringify(prepared.coverage) ||
      JSON.stringify([...extraction.warnings].sort()) !== JSON.stringify(prepared.warnings) ||
      (prepared.partial && extraction.status !== "partial")) throw new ValidationError("EXTRACTION_INVALID");
  const mapping = mappingSchema.safeParse(options.reviewedMapping ?? []);
  if (!mapping.success || new Set(mapping.data.map(m => m.order)).size !== mapping.data.length ||
      mapping.data.some(m => new Set(m.skillIds).size !== m.skillIds.length || (m.order === 2 && m.skillIds.length > 0) ||
        m.skillIds.some(id => !extraction.skills.some(skill => skill.skillId === id)))) throw new ValidationError("INVALID_MAPPING");
  return {
    input, extraction, prepared, rubric,
    partial: extraction.status === "partial" || prepared.partial,
    questions: officialQuestions.map(question => ({ ...question,
      relatedSkillIds: mapping.data.find(m => m.order === question.order)?.skillIds ?? [],
      rubric: rubric.questions.find(q => q.order === question.order)!,
    })),
  };
}
export type QuestionEvaluationContext = ReturnType<typeof buildQuestionContext>;
