import { z } from "zod";
const ALLOWED_SKILL_IDS = [
  "react",
  "typescript",
  "rest-api",
  "css",
  "javascript",
];

const SkillSchema = z.object({
  skillId: z.string().refine((id) => ALLOWED_SKILL_IDS.includes(id), {
    message: "Skill ID is not registered in the BUKTIVA dataset",
  }),
  level: z.number().min(0).max(4),
  confidence: z.number().min(0).max(1),
  reason: z.string().min(5, "Reason is too short"),
  evidenceRefs: z
    .array(z.string())
    .min(1, "At least 1 evidence reference is required"),
});

const GeminiOutputSchema = z.object({
  analysisId: z.string(),
  skills: z.array(SkillSchema),
  validationPassed: z.boolean(),
});

export function validateAIOutput(rawGeminiResponse: unknown) {
  const result = GeminiOutputSchema.safeParse(rawGeminiResponse);

  // If validation fails (e.g., AI hallucination or corrupted JSON)
  if (!result.success) {
    console.error(
      "[AI Output Validator] Validation Failed:",
      result.error.format(),
    );

    // Throw an error with English message
    throw new Error(`Invalid AI Output: ${result.error.issues[0].message}`);
  }

  return result.data;
}
