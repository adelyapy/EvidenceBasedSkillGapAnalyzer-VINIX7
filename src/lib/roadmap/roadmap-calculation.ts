import "server-only";
import { createHash } from "node:crypto";
import { learningRoadmapResultSchema,type LearningRoadmapResult } from "@/types/learning-roadmap";
import { canonical } from "@/lib/scoring/scoring-context";
import type { RoadmapContext } from "./roadmap-context";
import { planRoadmapPhases } from "./roadmap-phase-planner";

/** Internal kernel. All numerical input plans are explicitly synthetic; runtime service rejects them. */
export function buildLearningRoadmap(context:RoadmapContext):LearningRoadmapResult{
  const {scoring,policy,catalog}=context;
  const {phases,warnings:plannerWarnings,usedResourceIds,omittedSkillIds,activityCount}=planRoadmapPhases(context);
  const warnings=new Set<LearningRoadmapResult["warnings"][number]>(["POLICIES_PENDING_APPROVAL","DURATION_NOT_ESTIMATED"]);
  const simulation=scoring.calculationMetadata.executionMode==="synthetic_simulation";
  if(simulation)warnings.add("SIMULATION_ONLY");
  if(scoring.coverage.incomplete)warnings.add("PARTIAL_SCORING");
  for(const warning of plannerWarnings)warnings.add(warning);
  if(scoring.scoringStatus==="blocked")warnings.add("SCORING_BLOCKED");
  return learningRoadmapResultSchema.parse({analysisId:scoring.analysisId,targetRole:scoring.targetRole,policyId:policy.policyId,policyVersion:policy.policyVersion,policyStatus:policy.policyStatus,
    status:scoring.scoringStatus==="blocked"?"blocked":!activityCount?"no_actions":scoring.coverage.incomplete||omittedSkillIds.length?"partial":"proposed",
    blockingReasons:scoring.scoringStatus==="blocked"?["SCORING_INPUT_BLOCKED",...(scoring.warnings.includes("UPSTREAM_NOT_READY")?["UPSTREAM_NOT_READY"]:[])]:[],
    scoringPolicy:{policyId:scoring.policyId,policyVersion:scoring.policyVersion,policyStatus:scoring.policyStatus,policyDigest:scoring.calculationMetadata.policyDigest},
    scoringStatus:scoring.scoringStatus,readinessScore:scoring.readinessScore,readinessStatus:scoring.readinessStatus,
    sourceSkills:scoring.skills.map(skill=>({...skill,evidenceRefs:skill.evidenceRefs.map(({evidenceId,fileRef,filePath})=>({evidenceId,fileRef,filePath}))})),
    coverage:scoring.coverage,scoringWarnings:scoring.warnings,readinessReasons:scoring.readinessReasons,
    phases,resources:catalog.resources.filter(r=>usedResourceIds.has(r.resourceId)).sort((a,b)=>a.resourceId.localeCompare(b.resourceId)),omittedSkillIds,warnings:[...warnings].sort(),
    metadata:{engineVersion:"buktiva-roadmap-1.0.0",executionMode:simulation?"synthetic_simulation":"non_numeric",scoringDigest:createHash("sha256").update(canonical(scoring)).digest("hex"),catalogVersion:catalog.catalogVersion,activityCount},
  });
}
