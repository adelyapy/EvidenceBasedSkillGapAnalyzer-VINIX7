import "server-only";
import { z } from "zod";
import { createHash } from "node:crypto";
import draft from "@/data/scoring/scoring-policy.draft.json";
import { databaseInt8Schema } from "@/types/analysis-input";
import { ScoringError } from "./errors";

const level = z.number().int().min(0).max(4);
const rank = z.number().int().min(1).max(100);
export const scoringPolicySchema = z.object({
  policyId: z.string().regex(/^[a-z0-9-]{1,80}$/), policyVersion: z.string().regex(/^\d+\.\d+\.\d+$/),
  policyStatus: z.enum(["draft", "under_review", "approved", "retired"]), scope: z.enum(["production", "synthetic_test"]),
  supportedRole: z.literal("frontend-developer"), datasetVersion: z.string().min(1).max(100), validationRubricVersion: z.string().min(1).max(100),
  skillLevelScale: z.object({ min: z.literal(0), max: z.literal(4), step: z.literal(1) }).strict(),
  levelIndicators: z.array(z.object({ skillKey: z.string().regex(/^[a-z0-9-]+$/), descriptions: z.array(z.string().min(1).max(300)).length(5),
    // Declarative exact-quote rules are used only for artificial fixtures, never inferred from answer averages.
    levelRules: z.array(z.object({ level, sourceQuotes: z.array(z.string().min(1).max(400)).min(1).max(8),
      requiredQuestionOrders: z.array(z.number().int().min(1).max(5)).min(1).max(4),
      minimumDimensionScore: level }).strict()).max(5) }).strict()).max(32),
  evidenceRequirements: z.object({ implementationRequired: z.literal(true), allowPartial: z.literal(false) }).strict(),
  validationRequirements: z.object({ mappingApproved: z.boolean(), questionSkillMapping: z.array(z.object({ order: z.number().int().min(1).max(5), skillIds: z.array(databaseInt8Schema).min(1).max(32) }).strict()).max(4),
    minimumLinkedAnswers: z.number().int().min(2).max(4) }).strict(),
  coverageRequirements: z.object({ minimumSkillRatio: z.number().min(0).max(1), requireAllBenchmarks: z.literal(true) }).strict(),
  benchmarkPriorityRules: z.object({ approved: z.boolean(), categoryRanks: z.array(z.object({ category: z.string().min(1).max(160), rank }).strict()).max(20),
    numericRanks: z.array(z.object({ value: z.number().finite().min(0).max(100), rank }).strict()).max(20) }).strict(),
  gapCalculationMethod: z.literal("nonnegative_difference_same_scale"),
  readinessCalculationMethod: z.enum(["disabled", "weighted_capped_level_ratio_all_benchmarks"]),
  readinessWeights: z.array(z.object({ skillId: databaseInt8Schema, weight: z.number().int().positive().max(1000) }).strict()).max(32),
  mandatorySkillIds: z.array(databaseInt8Schema).max(32),
  roundingRules: z.object({ level: z.literal("integer_only"), gap: z.literal("exact_integer"), readinessDecimals: z.literal(2) }).strict(),
  approvalMetadata: z.object({ kind: z.enum(["human_review", "synthetic_test"]), reviewer: z.string().min(1).max(100),
    reference: z.string().min(1).max(300), approvedPolicyVersion: z.string().min(1), approvedOn: z.iso.date() }).strict().nullable(),
}).strict().superRefine((policy, context) => {
  const unique = (values: unknown[]) => new Set(values).size === values.length;
  if (!unique(policy.levelIndicators.map(i => i.skillKey)) || policy.levelIndicators.some(i => !unique(i.levelRules.map(r => r.level)) || i.levelRules.some(r => !unique(r.requiredQuestionOrders) || r.requiredQuestionOrders.includes(2))) ||
    !unique(policy.validationRequirements.questionSkillMapping.map(m => m.order)) || policy.validationRequirements.questionSkillMapping.some(m => m.order === 2 || !unique(m.skillIds)) ||
    !unique(policy.readinessWeights.map(w => w.skillId)) || !unique(policy.mandatorySkillIds) ||
    !unique(policy.benchmarkPriorityRules.categoryRanks.map(r => r.category)) || !unique(policy.benchmarkPriorityRules.numericRanks.map(r => r.value)) ||
    (policy.readinessCalculationMethod !== "disabled" && !policy.readinessWeights.length) ||
    (policy.policyStatus === "approved" && (!policy.approvalMetadata || policy.approvalMetadata.approvedPolicyVersion !== policy.policyVersion ||
      (policy.scope === "production" ? policy.approvalMetadata.kind !== "human_review" : policy.approvalMetadata.kind !== "synthetic_test"))) ||
    (policy.policyStatus !== "approved" && policy.approvalMetadata !== null)) context.addIssue({ code: "custom", message: "Inconsistent scoring policy" });
});
export type ScoringPolicy = z.infer<typeof scoringPolicySchema>;
export function parseScoringPolicy(raw: unknown): ScoringPolicy {
  const result = scoringPolicySchema.safeParse(raw);
  if (!result.success) throw new ScoringError("INVALID_POLICY");
  return result.data;
}
export function policyDigest(policy: ScoringPolicy) { return createHash("sha256").update(JSON.stringify(policy)).digest("hex"); }
/** Trust comes from the checked-in registry, not JSON approval claims or environment flags.
 * There is currently NO approved production policy. Adding one requires human review of code and approval artifact.
 */
export function loadScoringPolicy(raw?: unknown): ScoringPolicy {
  const pinned = parseScoringPolicy(draft);
  const supplied = raw === undefined ? pinned : parseScoringPolicy(raw);
  if (policyDigest(supplied) !== policyDigest(pinned)) throw new ScoringError("UNTRUSTED_POLICY");
  return parseScoringPolicy(draft);
}
