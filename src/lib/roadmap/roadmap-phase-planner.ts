import "server-only";
import type { LearningRoadmapResult } from "@/types/learning-roadmap";
import type { RoadmapContext } from "./roadmap-context";
import { createRoadmapActivity } from "./activity-builder";
import { resolveRoadmapEligibility,isLearningEligible } from "./roadmap-eligibility-resolver";
import { matchLearningResource } from "./learning-resource-matcher";

export function planRoadmapPhases(context:RoadmapContext){
  const phases:LearningRoadmapResult["phases"]=context.policy.phaseOrderingRules.map(phase=>({...phase,activities:[]}));
  const warnings=new Set<LearningRoadmapResult["warnings"][number]>();
  const usedResourceIds=new Set<string>(),omittedSkillIds:string[]=[];
  let selected=0,activityCount=0;
  for(const entry of resolveRoadmapEligibility(context)){
    const {skill}=entry,resource=matchLearningResource(context,skill);
    const fallback=entry.kind==="learn"&&(!isLearningEligible(context,skill)||!resource);
    const kind=fallback?"review":entry.kind;
    const requiredActivities=kind==="review"?2:3;
    if(selected>=context.policy.fallbackRules.maxSkills||activityCount+requiredActivities>context.policy.fallbackRules.maxActivities){omittedSkillIds.push(skill.skillId);warnings.add("PLAN_TRUNCATED");continue;}
    const reason:LearningRoadmapResult["phases"][number]["activities"][number]["reasonCode"]=fallback?"RESOURCE_UNAVAILABLE":kind==="learn"?"VALIDATED_GAP":kind==="collect"?"MISSING_EVIDENCE":skill.assessmentStatus==="contradictory_evidence"?"CONTRADICTION_REVIEW":skill.assessmentStatus==="policy_pending_approval"?"POLICY_REVIEW":"ASSESSMENT_REVIEW";
    if(fallback)warnings.add("RESOURCE_UNAVAILABLE");
    const first=createRoadmapActivity(context,skill,kind,reason,[],kind==="learn"?resource!.resourceId:undefined);
    phases.find(p=>p.phaseId===first.phaseId)!.activities.push(first.activity);
    if(kind==="learn")usedResourceIds.add(resource!.resourceId);
    let dependency=first.activity.activityId;
    if(kind!=="review"){
      const verification=createRoadmapActivity(context,skill,"verify","EVIDENCE_VERIFICATION",[dependency]);
      phases[2].activities.push(verification.activity);dependency=verification.activity.activityId;
    }
    const reassessment=createRoadmapActivity(context,skill,"reassess","REASSESS_AFTER_CHANGES",[dependency]);
    phases[3].activities.push(reassessment.activity);selected++;activityCount+=requiredActivities;
  }
  return {phases,warnings:[...warnings],usedResourceIds,omittedSkillIds,activityCount};
}
