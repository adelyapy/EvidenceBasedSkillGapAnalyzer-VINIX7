import "server-only";
import type { ScoringContext } from "./scoring-context";
import { scoringCoverageSchema, type ScoringSkill, type ScoringCoverage } from "@/types/competency-scoring";
export function evaluateCoverage(context: ScoringContext, skills: ScoringSkill[]): ScoringCoverage {
  const count = (status: ScoringSkill["assessmentStatus"]) => skills.filter(s => s.assessmentStatus === status).length;
  const sources = context.input.evidences;
  const sourceCount = (status: string) => sources.filter(s => s.status === status).length;
  const assessed = count("assessed");
  const limitations: ScoringCoverage["limitations"] = ["SOURCE_SELECTION_BOUNDED", "ANSWER_JUDGMENT_UNCALIBRATED"];
  if (context.partial) limitations.push("PARTIAL_UPSTREAM");
  if (assessed !== skills.length) limitations.push("UNMEASURED_BENCHMARKS");
  return scoringCoverageSchema.parse({ benchmarkSkills: skills.length, assessedSkills: assessed, unassessedSkills: skills.length - assessed,
    notAssessableSkills: count("not_assessable"), needsReviewSkills: count("needs_review"), contradictorySkills: count("contradictory_evidence"), pendingPolicySkills: count("policy_pending_approval"),
    skillRatio: assessed / skills.length, sources: { total: sources.length, complete: sourceCount("complete"), partial: sourceCount("partial"), blocked: sourceCount("blocked"), failed: sourceCount("failed"), unsupported: sourceCount("unsupported") },
    sourceCoverage: context.extraction.coverage, extractionStatus: context.extraction.status, validationStatus: context.validation.status,
    incomplete: context.partial || assessed !== skills.length, limitations });
}
