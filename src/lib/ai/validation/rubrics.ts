import "server-only";
import { z } from "zod";
import file from "@/data/ai/validation-rubrics.json";
import { dimensionIdSchema } from "@/types/validation-evaluation";
import { ValidationError } from "./errors";

export const validationRubricSchema = z.object({
  version: z.literal("1.0.0"), extractionDatasetVersion: z.string().min(1).max(100), approvalStatus: z.literal("mvp_proposed"),
  provenance: z.string().min(1).max(500), aggregation: z.literal("sum_assessed_dimensions_per_question"),
  competencyPolicy: z.literal("conservative_status_only_v1"),
  dimensions: z.array(z.object({ id: dimensionIdSchema, description: z.string().min(1).max(500), minScore: z.literal(0), maxScore: z.literal(4),
    levels: z.array(z.string().min(1).max(300)).length(5), notAssessableWhen: z.string().min(1).max(500) }).strict()).length(4),
  questions: z.array(z.object({ order: z.number().int().min(1).max(5), purpose: z.string().min(1).max(500),
    dimensions: z.array(dimensionIdSchema).min(1).max(4), authorshipVerifiable: z.literal(false) }).strict()).length(5),
}).strict();
export function loadValidationRubrics(raw: unknown = file) {
  const parsed = validationRubricSchema.safeParse(raw);
  if (!parsed.success) throw new ValidationError("RUBRIC_INVALID");
  const rubric = parsed.data;
  if (new Set(rubric.dimensions.map(d => d.id)).size !== 4 || new Set(rubric.questions.map(q => q.order)).size !== 5 ||
      rubric.questions.some(q => new Set(q.dimensions).size !== q.dimensions.length)) throw new ValidationError("RUBRIC_INVALID");
  // Dimension-to-purpose mapping is versioned application policy, not caller/model discretion.
  for (const question of rubric.questions) {
    const expected = question.order === 2 ? ["relevance", "contribution_clarity"] : ["relevance", "technical_accuracy", "evidence_consistency"];
    if (JSON.stringify(question.dimensions) !== JSON.stringify(expected)) throw new ValidationError("RUBRIC_INVALID");
  }
  return rubric;
}
export type ValidationRubric = ReturnType<typeof loadValidationRubrics>;
