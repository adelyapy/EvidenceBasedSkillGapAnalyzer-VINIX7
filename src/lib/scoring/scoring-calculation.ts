import "server-only";
import { competencyScoringResultSchema, type CompetencyScoringResult } from "@/types/competency-scoring";
import type { ScoringContext } from "./scoring-context";
import { policyDigest } from "./scoring-policy";
import { resolveCompetencyLevels } from "./competency-level-resolver";
import { calculateSkillGap } from "./skill-gap-calculator";
import { evaluateCoverage } from "./coverage-evaluator";
import { calculateReadiness } from "./readiness-calculator";
import { rankPriorities } from "./priority-ranker";

/** Internal calculation kernel. Numerical outputs are ALWAYS labelled synthetic_simulation.
 * Never an approval boundary or a public request handler. Runtime service pins policy separately.
 */
export function buildScoringResult(context: ScoringContext): CompetencyScoringResult {
  const { input, extraction, validation, policy } = context;
  const simulation = policy.policyStatus === "approved" && policy.scope === "synthetic_test";
  const skills = resolveCompetencyLevels(context).map(skill => ({ ...skill, gapScore: calculateSkillGap(skill.requiredLevel, skill.currentLevel) }));
  const coverage = evaluateCoverage(context, skills);
  const readiness = calculateReadiness(skills, coverage, policy);
  const warnings: CompetencyScoringResult["warnings"] = [];
  if (!simulation) warnings.push("POLICY_PENDING_APPROVAL", "LEVEL_METHOD_UNAPPROVED");
  if (simulation) warnings.push("SIMULATION_ONLY");
  if (context.partial) warnings.push("PARTIAL_INPUT");
  if (!context.upstreamReady) warnings.push("UPSTREAM_NOT_READY");
  if (!policy.benchmarkPriorityRules.approved) warnings.push("PRIORITY_MAPPING_PENDING");
  return competencyScoringResultSchema.parse({ analysisId: input.analysisId,
    targetRole: { id: input.targetRole.id, name: input.targetRole.name, slug: input.targetRole.slug },
    policyId: policy.policyId, policyVersion: policy.policyVersion, policyStatus: policy.policyStatus,
    scoringStatus: !context.upstreamReady ? "blocked" : !simulation ? "policy_pending_approval" : coverage.incomplete ? "partial" : "completed",
    skills, coverage, ...readiness, priorityGroups: rankPriorities(skills), warnings,
    calculationMetadata: { engineVersion: "buktiva-scoring-1.0.0", executionMode: simulation ? "synthetic_simulation" : "non_numeric",
      policyDigest: policyDigest(policy), datasetVersion: extraction.datasetVersion, rubricVersion: validation.rubricVersion,
      extractionPromptVersion: extraction.promptVersion, validationPromptVersion: validation.promptVersion,
      rounding: "integer_levels_exact_gap_readiness_half_up_2dp", extractionWarnings: extraction.warnings, validationWarnings: validation.warnings },
  });
}
