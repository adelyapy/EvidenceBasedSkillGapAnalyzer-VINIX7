import "server-only";
import { z } from "zod";
import { databaseInt8Schema, uuidSchema, safeTextSchema } from "./analysis-input";
import { evidenceRefSchema, extractionCoverageSchema, extractionWarningSchema } from "./skill-extraction";
import { validationEvaluationResultSchema } from "./validation-evaluation";

export const assessmentStatusSchema = z.enum(["assessed", "not_assessable", "needs_review", "contradictory_evidence", "policy_pending_approval"]);
const level = z.number().int().min(0).max(4).nullable();
export const scoringSkillSchema = z.object({
  skillId: databaseInt8Schema, skillName: safeTextSchema, requiredLevel: level, currentLevel: level, gapScore: level,
  assessmentStatus: assessmentStatusSchema, priority: z.union([z.string().min(1).max(160), z.number().finite().min(0).max(100)]),
  priorityRank: z.number().int().min(1).max(100).nullable(), explanation: z.string().min(1).max(500),
  evidenceRefs: z.array(evidenceRefSchema).max(48), validationRefs: z.array(uuidSchema).max(5),
  limitations: z.array(z.enum(["POLICY_NOT_APPROVED", "INVALID_BENCHMARK", "MISSING_LEVEL_INDICATORS", "QUESTION_SKILL_MAPPING_NOT_APPROVED", "INSUFFICIENT_EVIDENCE", "EVIDENCE_REQUIRES_REVIEW", "UPSTREAM_NOT_READY", "PRIORITY_MAPPING_NOT_APPROVED", "UNMAPPED_BENCHMARK_PRIORITY"])).max(9),
}).strict().superRefine((skill, context) => {
  if ((skill.assessmentStatus === "assessed") !== (skill.currentLevel !== null) ||
    (skill.currentLevel === null || skill.requiredLevel === null ? skill.gapScore !== null : skill.gapScore !== Math.max(0, skill.requiredLevel - skill.currentLevel))) context.addIssue({ code: "custom", message: "Invalid level/gap status" });
});
export const scoringCoverageSchema = z.object({
  benchmarkSkills: z.number().int().positive().max(100), assessedSkills: z.number().int().nonnegative(), unassessedSkills: z.number().int().nonnegative(),
  notAssessableSkills: z.number().int().nonnegative(), needsReviewSkills: z.number().int().nonnegative(), contradictorySkills: z.number().int().nonnegative(), pendingPolicySkills: z.number().int().nonnegative(),
  skillRatio: z.number().min(0).max(1),
  sources: z.object({ total: z.number().int().nonnegative(), complete: z.number().int().nonnegative(), partial: z.number().int().nonnegative(), blocked: z.number().int().nonnegative(), failed: z.number().int().nonnegative(), unsupported: z.number().int().nonnegative() }).strict(),
  sourceCoverage: extractionCoverageSchema, extractionStatus: z.enum(["completed", "partial", "blocked", "failed"]), validationStatus: z.enum(["completed", "partial", "blocked", "failed"]),
  incomplete: z.boolean(), limitations: z.array(z.enum(["SOURCE_SELECTION_BOUNDED", "ANSWER_JUDGMENT_UNCALIBRATED", "PARTIAL_UPSTREAM", "UNMEASURED_BENCHMARKS"])).max(4),
}).strict().superRefine((c, ctx) => {
  if (c.assessedSkills + c.unassessedSkills !== c.benchmarkSkills || c.notAssessableSkills + c.needsReviewSkills + c.contradictorySkills + c.pendingPolicySkills !== c.unassessedSkills ||
    c.sources.total !== c.sources.complete + c.sources.partial + c.sources.blocked + c.sources.failed + c.sources.unsupported ||
    c.skillRatio !== c.assessedSkills / c.benchmarkSkills) ctx.addIssue({ code: "custom", message: "Inconsistent coverage counts" });
});
export const readinessReasonSchema = z.enum(["POLICY_NOT_APPROVED", "METHOD_DISABLED", "INSUFFICIENT_SKILL_COVERAGE", "MISSING_LEVEL_INDICATORS", "QUESTION_SKILL_MAPPING_NOT_APPROVED", "INVALID_BENCHMARK", "EVIDENCE_REQUIRES_REVIEW", "INVALID_WEIGHTS", "MANDATORY_SKILL_UNKNOWN"]);
export const competencyScoringResultSchema = z.object({
  analysisId: uuidSchema, targetRole: z.object({ id: databaseInt8Schema, name: safeTextSchema, slug: z.string().min(1).max(160) }).strict(),
  policyId: z.string().min(1).max(80), policyVersion: z.string().min(1).max(40), policyStatus: z.enum(["draft", "under_review", "approved", "retired"]),
  scoringStatus: z.enum(["policy_pending_approval", "completed", "partial", "blocked"]), skills: z.array(scoringSkillSchema).min(1).max(100),
  coverage: scoringCoverageSchema, readinessScore: z.number().min(0).max(100).nullable(), readinessStatus: z.enum(["not_available", "simulation_computed"]), readinessReasons: z.array(readinessReasonSchema).max(9),
  priorityGroups: z.object({ learning: z.array(databaseInt8Schema).max(100), evidenceCollection: z.array(databaseInt8Schema).max(100), manualReview: z.array(databaseInt8Schema).max(100) }).strict(),
  warnings: z.array(z.enum(["POLICY_PENDING_APPROVAL", "SIMULATION_ONLY", "PARTIAL_INPUT", "UPSTREAM_NOT_READY", "PRIORITY_MAPPING_PENDING", "LEVEL_METHOD_UNAPPROVED"])).max(6),
  calculationMetadata: z.object({ engineVersion: z.literal("buktiva-scoring-1.0.0"), executionMode: z.enum(["non_numeric", "synthetic_simulation"]),
    policyDigest: z.string().regex(/^[a-f0-9]{64}$/), datasetVersion: z.string().min(1).max(100), rubricVersion: z.string().min(1).max(100),
    extractionPromptVersion: z.string().min(1).max(100), validationPromptVersion: z.string().min(1).max(100), rounding: z.literal("integer_levels_exact_gap_readiness_half_up_2dp"),
    extractionWarnings: z.array(extractionWarningSchema).max(12), validationWarnings: validationEvaluationResultSchema.shape.warnings,
  }).strict(),
}).strict().superRefine((r, ctx) => {
  if (new Set(r.skills.map(s => s.skillId)).size !== r.skills.length || r.skills.length !== r.coverage.benchmarkSkills ||
    (r.policyStatus !== "approved" && (r.readinessScore !== null || r.skills.some(s => s.currentLevel !== null))) ||
    ((r.readinessScore !== null) !== (r.readinessStatus === "simulation_computed")) ||
    (r.calculationMetadata.executionMode !== "synthetic_simulation" && r.skills.some(s => s.currentLevel !== null)) ||
    (r.readinessScore !== null && (r.coverage.incomplete || r.readinessReasons.length))) ctx.addIssue({ code: "custom", message: "Invalid scoring outcome" });
});
export type ScoringSkill = z.infer<typeof scoringSkillSchema>;
export type ScoringCoverage = z.infer<typeof scoringCoverageSchema>;
export type CompetencyScoringResult = z.infer<typeof competencyScoringResultSchema>;
