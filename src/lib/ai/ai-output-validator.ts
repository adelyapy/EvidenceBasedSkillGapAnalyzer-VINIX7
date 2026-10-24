// src/lib/ai/ai-output-validator.ts
import { z } from "zod";

// 1. Skema Skill (Dibuat lebih fleksibel agar menerima ID angka/string dari Backend)
const SkillSchema = z.object({
  skillId: z.union([z.string(), z.number()]), // Terima string atau angka
  skillName: z.string().optional(),
  level: z.number().min(0).max(4).optional(), // Level mungkin tidak dikirim AI, tapi dihitung Backend
  confidence: z.number().min(0).max(1).optional(),
  reason: z.string().optional(),
  evidenceRefs: z.array(z.any()).optional(),
});

// 2. Skema Skill Gap
const SkillGapSchema = z.object({
  skillId: z.union([z.string(), z.number()]),
  skillName: z.string().optional(),
  currentLevel: z.number().min(0).max(4).nullable(),
  requiredLevel: z.number().min(0).max(4).nullable(),
  gapScore: z.number().nullable(),
  priorityRank: z.number().optional(),
});

// 3. Skema Roadmap
const RoadmapSchema = z.object({
  step: z.number().optional(),
  title: z.string(),
  duration: z.string().optional(),
  topics: z.array(z.string()).optional(),
});

// 4. Skema Output Utama (Dibuat opsional agar tidak crash saat menerima data parsial)
const GeminiOutputSchema = z.object({
  analysisId: z.string(),
  skills: z.array(SkillSchema).default([]),
  skillGaps: z.array(SkillGapSchema).optional().default([]),
  roadmap: z.array(RoadmapSchema).optional().default([]),
  validationPassed: z.boolean().optional().default(true),
});

export function validateAIOutput(rawGeminiResponse: unknown) {
  const result = GeminiOutputSchema.safeParse(rawGeminiResponse);

  if (!result.success) {
    console.error(
      "[AI Output Validator] Validation Failed:",
      result.error.format(),
    );
    throw new Error(`Invalid AI Output: ${result.error.issues[0].message}`);
  }

  return result.data;
}
