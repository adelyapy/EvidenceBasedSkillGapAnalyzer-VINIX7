import "server-only";
import type { ScoringSkill } from "@/types/competency-scoring";
import type { ScoringContext } from "./scoring-context";

export function resolveRequiredLevel(raw: string | number): number | null {
  // Explicit transport equivalence only; no guessing that "advanced" means level 3.
  const value = typeof raw === "number" ? raw : /^[0-4]$/.test(raw) ? Number(raw) : NaN;
  return Number.isInteger(value) && value >= 0 && value <= 4 ? value : null;
}
export function resolveCompetencyLevels(context: ScoringContext): ScoringSkill[] {
  const { input, extraction, validation, policy } = context;
  const simulation = policy.policyStatus === "approved" && policy.scope === "synthetic_test";
  return [...input.benchmarks].sort((a,b) => BigInt(a.skillId) < BigInt(b.skillId) ? -1 : 1).map(benchmark => {
    const candidate = extraction.skills.find(s => s.skillId === benchmark.skillId);
    const competency = validation.competencies.find(c => c.skillId === benchmark.skillId);
    const linked = validation.evaluations.filter(e => e.relatedSkillIds.includes(benchmark.skillId));
    const refs = new Map([...(candidate?.evidenceRefs ?? []), ...(competency?.evidenceRefs ?? [])].map(r => [JSON.stringify(r), r]));
    const skill: ScoringSkill = { skillId: benchmark.skillId, skillName: benchmark.skillName,
      requiredLevel: resolveRequiredLevel(benchmark.requiredLevel), currentLevel: null, gapScore: null,
      assessmentStatus: "not_assessable", priority: benchmark.priority, priorityRank: null,
      explanation: "Level belum dapat dinilai; tidak ada angka pengganti untuk bukti yang belum memadai.",
      evidenceRefs: [...refs.values()], validationRefs: linked.map(e => e.questionId), limitations: [] };
    const indicator = policy.levelIndicators.find(i => i.skillKey === context.skillKey(benchmark.skillName));
    if (skill.requiredLevel === null) skill.limitations.push("INVALID_BENCHMARK");
    if (!policy.benchmarkPriorityRules.approved) skill.limitations.push("PRIORITY_MAPPING_NOT_APPROVED");
    else {
      skill.priorityRank = typeof benchmark.priority === "number" ? policy.benchmarkPriorityRules.numericRanks.find(r => r.value === benchmark.priority)?.rank ?? null : policy.benchmarkPriorityRules.categoryRanks.find(r => r.category === benchmark.priority)?.rank ?? null;
      if (skill.priorityRank === null) skill.limitations.push("UNMAPPED_BENCHMARK_PRIORITY");
    }
    if (!indicator?.levelRules.length) skill.limitations.push("MISSING_LEVEL_INDICATORS");
    if (!policy.validationRequirements.mappingApproved) skill.limitations.push("QUESTION_SKILL_MAPPING_NOT_APPROVED");
    if (!simulation) skill.limitations.push("POLICY_NOT_APPROVED");
    if (!context.upstreamReady) { skill.limitations.push("UPSTREAM_NOT_READY"); return skill; }
    if (competency?.status === "contradicted") {
      skill.assessmentStatus = "contradictory_evidence"; skill.limitations.push("EVIDENCE_REQUIRES_REVIEW");
      skill.explanation = "Terdapat klaim yang bertentangan dengan kutipan bukti; perlu tinjauan manual."; return skill;
    }
    if (context.partial || competency?.status === "needs_review") {
      skill.assessmentStatus = "needs_review"; skill.limitations.push("EVIDENCE_REQUIRES_REVIEW"); return skill;
    }
    if (!candidate || candidate.evidenceStatus !== "implementation_evidence" || competency?.status === "insufficient_evidence" || !candidate.evidenceRefs.length || !linked.length) {
      skill.limitations.push("INSUFFICIENT_EVIDENCE"); return skill;
    }
    if (!simulation) { skill.assessmentStatus = "policy_pending_approval"; skill.explanation = "Policy produksi belum disahkan; level dan gap tetap null."; return skill; }
    const orders = policy.validationRequirements.questionSkillMapping.filter(m => m.skillIds.includes(skill.skillId)).map(m => m.order);
    const linkedOrders = linked.map(e => context.questions.find(q => q.questionId === e.questionId)!.order);
    if (!policy.validationRequirements.mappingApproved || linkedOrders.some(order => !orders.includes(order)) || orders.some(order => !linkedOrders.includes(order))) {
      skill.limitations.push("QUESTION_SKILL_MAPPING_NOT_APPROVED"); return skill;
    }
    if (!indicator?.levelRules.length || linked.length < policy.validationRequirements.minimumLinkedAnswers || skill.requiredLevel === null) return skill;
    // Only an artificial approved test rule may produce a number in this milestone.
    const applicable = indicator.levelRules.filter(rule => rule.requiredQuestionOrders.every(order => orders.includes(order)) &&
      rule.sourceQuotes.every(quote => candidate.evidenceRefs.some(ref => ref.quote.includes(quote))) &&
      rule.requiredQuestionOrders.every(order => {
        const evaluation = linked.find(e => context.questions.find(q => q.questionId === e.questionId)!.order === order);
        return evaluation && evaluation.evidenceAlignment === "supported" && evaluation.evidenceRefs.some(ref => candidate.evidenceRefs.some(c => c.fileRef === ref.fileRef && c.evidenceId === ref.evidenceId)) &&
          evaluation.dimensions.every(d => d.status === "assessed" && d.score !== null && d.score >= rule.minimumDimensionScore);
      })).sort((a,b) => b.level - a.level);
    if (applicable.length) {
      skill.currentLevel = applicable[0].level; skill.assessmentStatus = "assessed";
      skill.explanation = "Simulasi sintetis memenuhi aturan kutipan dan mapping policy fixture; bukan penilaian pengguna.";
    } else skill.limitations.push("INSUFFICIENT_EVIDENCE");
    skill.limitations = [...new Set(skill.limitations)];
    return skill;
  });
}
