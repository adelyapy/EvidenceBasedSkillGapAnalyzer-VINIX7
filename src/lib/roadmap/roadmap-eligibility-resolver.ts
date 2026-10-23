import "server-only";
import type { ScoringSkill } from "@/types/competency-scoring";
import type { RoadmapContext } from "./roadmap-context";

export type RoadmapEligibility={skill:ScoringSkill;kind:"review"|"collect"|"learn"};
export function resolveRoadmapEligibility(context:RoadmapContext):RoadmapEligibility[]{
  const {scoring}=context;
  if(scoring.scoringStatus==="blocked")return [];
  const ordered=[...scoring.priorityGroups.manualReview.map(skillId=>({skillId,kind:"review" as const})),
    ...scoring.priorityGroups.evidenceCollection.map(skillId=>({skillId,kind:"collect" as const})),
    ...scoring.priorityGroups.learning.map(skillId=>({skillId,kind:"learn" as const}))];
  return ordered.map(entry=>({skill:scoring.skills.find(skill=>skill.skillId===entry.skillId)!,kind:entry.kind}));
}
export function isLearningEligible(context:RoadmapContext,skill:ScoringSkill){
  return context.scoring.scoringStatus!=="blocked"&&context.scoring.calculationMetadata.executionMode==="synthetic_simulation"&&
    context.scoring.policyStatus==="approved"&&skill.assessmentStatus==="assessed"&&skill.currentLevel!==null&&skill.gapScore!==null&&skill.gapScore>0;
}
