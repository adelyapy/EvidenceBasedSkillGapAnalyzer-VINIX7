import "server-only";
import type { ScoringPolicy } from "./scoring-policy";
import type { ScoringSkill, ScoringCoverage, CompetencyScoringResult } from "@/types/competency-scoring";

/** Simulation only; the production entry point has no approved policy registry entry. */
export function calculateReadiness(skills: ScoringSkill[], coverage: ScoringCoverage, policy: ScoringPolicy): Pick<CompetencyScoringResult, "readinessScore" | "readinessStatus" | "readinessReasons"> {
  const reasons = new Set<CompetencyScoringResult["readinessReasons"][number]>();
  if (policy.policyStatus !== "approved" || policy.scope !== "synthetic_test") reasons.add("POLICY_NOT_APPROVED");
  if (policy.readinessCalculationMethod === "disabled") reasons.add("METHOD_DISABLED");
  if (!policy.validationRequirements.mappingApproved) reasons.add("QUESTION_SKILL_MAPPING_NOT_APPROVED");
  if (skills.some(s => s.limitations.includes("MISSING_LEVEL_INDICATORS"))) reasons.add("MISSING_LEVEL_INDICATORS");
  if (skills.some(s => s.requiredLevel === null || !Number.isInteger(s.requiredLevel) || s.requiredLevel < 1 || s.requiredLevel > 4 ||
    (s.currentLevel !== null && (!Number.isInteger(s.currentLevel) || s.currentLevel < 0 || s.currentLevel > 4)))) reasons.add("INVALID_BENCHMARK");
  if (coverage.benchmarkSkills !== skills.length || coverage.assessedSkills !== skills.length ||
    skills.some(s => s.currentLevel === null || s.assessmentStatus !== "assessed") ||
    new Set(skills.map(s => s.skillId)).size !== skills.length || coverage.skillRatio < policy.coverageRequirements.minimumSkillRatio) reasons.add("INSUFFICIENT_SKILL_COVERAGE");
  if (coverage.incomplete || skills.some(s => ["needs_review", "contradictory_evidence"].includes(s.assessmentStatus))) reasons.add("EVIDENCE_REQUIRES_REVIEW");
  if (policy.mandatorySkillIds.some(id => !skills.some(s => s.skillId === id && s.currentLevel !== null))) reasons.add("MANDATORY_SKILL_UNKNOWN");
  const weights = policy.readinessWeights;
  if (!skills.length || weights.length !== skills.length || new Set(weights.map(w => w.skillId)).size !== weights.length ||
    weights.some(w => !Number.isSafeInteger(w.weight) || w.weight <= 0 || w.weight > 1000 || !skills.some(s => s.skillId === w.skillId))) reasons.add("INVALID_WEIGHTS");
  if (reasons.size) return { readinessScore: null, readinessStatus: "not_available", readinessReasons: [...reasons].sort() };
  // Exact rational arithmetic: sum(weight * min(current,required)/required) / sum(weight).
  // Integer 0–4 denominators divide 12. Round half-up once to two decimal places.
  const numerator = skills.reduce((sum, skill) => sum + BigInt(weights.find(w => w.skillId === skill.skillId)!.weight) * BigInt(Math.min(skill.currentLevel!, skill.requiredLevel!)) * BigInt(12 / skill.requiredLevel!), BigInt(0));
  const denominator = BigInt(weights.reduce((sum,w) => sum + w.weight, 0)) * BigInt(12);
  const hundredths = (numerator * BigInt(10000) * BigInt(2) + denominator) / (denominator * BigInt(2));
  return { readinessScore: Number(hundredths) / 100, readinessStatus: "simulation_computed", readinessReasons: [] };
}
