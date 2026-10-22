import "server-only";
import type { ScoringSkill, CompetencyScoringResult } from "@/types/competency-scoring";
export function rankPriorities(skills: ScoringSkill[]): CompetencyScoringResult["priorityGroups"] {
  const idOrder = (a: ScoringSkill, b: ScoringSkill) => BigInt(a.skillId) < BigInt(b.skillId) ? -1 : BigInt(a.skillId) > BigInt(b.skillId) ? 1 : 0;
  const order = (a: ScoringSkill,b: ScoringSkill) => (a.priorityRank ?? 101) - (b.priorityRank ?? 101) || idOrder(a,b);
  return {
    learning: skills.filter(s => s.assessmentStatus === "assessed" && s.gapScore !== null && s.gapScore > 0 && s.priorityRank !== null).sort((a,b) =>
      (a.priorityRank! - b.priorityRank!) || (b.gapScore! - a.gapScore!) || idOrder(a,b)).map(s => s.skillId),
    evidenceCollection: skills.filter(s => s.currentLevel === null && !["needs_review", "contradictory_evidence", "policy_pending_approval"].includes(s.assessmentStatus)).sort(order).map(s => s.skillId),
    manualReview: skills.filter(s => ["needs_review", "contradictory_evidence", "policy_pending_approval"].includes(s.assessmentStatus)).sort((a,b) =>
      (a.assessmentStatus === "contradictory_evidence" ? 0 : 1) - (b.assessmentStatus === "contradictory_evidence" ? 0 : 1) || order(a,b)).map(s => s.skillId),
  };
}
