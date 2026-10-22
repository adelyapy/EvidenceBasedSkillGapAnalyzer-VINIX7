import "server-only";
import type { QuestionEvaluationContext } from "./question-context-builder";
import { provisionalCompetencySchema, type ProvisionalCompetency, type QuestionEvaluation } from "@/types/validation-evaluation";

/** Conservative, proposed status policy; no skill level, weights or readiness calculation. */
export function assessProvisionalCompetencies(context: QuestionEvaluationContext, evaluations: QuestionEvaluation[]): ProvisionalCompetency[] {
  return context.extraction.skills.map(skill => {
    const linked = evaluations.filter(e => e.relatedSkillIds.includes(skill.skillId));
    const concrete = linked.filter(e => e.evidenceRefs.some(ref => skill.evidenceRefs.some(original => original.evidenceId === ref.evidenceId && original.fileRef === ref.fileRef)));
    let status: ProvisionalCompetency["status"] = "insufficient_evidence";
    let reasonCode: ProvisionalCompetency["reasonCode"] = "NO_LINKED_EVIDENCE";
    if (concrete.some(e => e.evidenceAlignment === "contradicted")) { status = "contradicted"; reasonCode = "CONCRETE_CONTRADICTION"; }
    else if (skill.evidenceStatus !== "insufficient_evidence" && concrete.length) {
      // No unapproved score threshold. Two distinct linked answers and implementation
      // evidence can support review; a single persuasive answer cannot establish mastery.
      const supported = concrete.filter(e => e.evidenceAlignment === "supported");
      if (!context.partial && skill.evidenceStatus === "implementation_evidence" && supported.length >= 2 &&
          linked.every(e => e.evidenceAlignment === "supported" && e.dimensions.every(d => d.status === "assessed"))) {
        status = "validation_supported"; reasonCode = "EVIDENCE_AND_ANSWERS_SUPPORT";
      } else { status = "needs_review"; reasonCode = "PARTIAL_OR_UNCERTAIN"; }
    }
    const unique = new Map(concrete.flatMap(e => e.evidenceRefs).map(ref => [JSON.stringify(ref), ref]));
    return provisionalCompetencySchema.parse({ skillId: skill.skillId, status, reasonCode,
      questionIds: linked.map(e => e.questionId), evidenceRefs: [...unique.values()] });
  }).sort((a, b) => BigInt(a.skillId) < BigInt(b.skillId) ? -1 : 1);
}
