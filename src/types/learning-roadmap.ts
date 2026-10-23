import "server-only";
import { z } from "zod";
import { databaseInt8Schema,uuidSchema } from "./analysis-input";
import { competencyScoringResultSchema,scoringSkillSchema } from "./competency-scoring";
import { activityTypeSchema } from "@/lib/roadmap/roadmap-policy";
import { learningResourceSchema } from "@/lib/roadmap/resource-catalog";
import { evidenceRefSchema } from "./skill-extraction";

export const roadmapEvidenceRefSchema=evidenceRefSchema.omit({quote:true});
export const roadmapSourceSkillSchema=z.object({...scoringSkillSchema.shape,evidenceRefs:z.array(roadmapEvidenceRefSchema).max(48)}).strict();

export const roadmapActivitySchema=z.object({activityId:z.string().regex(/^activity_[a-f0-9]{24}$/),skillId:databaseInt8Schema,type:activityTypeSchema,
  priority:z.object({sourceGroup:z.enum(["learning","evidence_collection","manual_review"]),groupOrder:z.number().int().min(1).max(100),
    benchmarkPriority:scoringSkillSchema.shape.priority,benchmarkRank:scoringSkillSchema.shape.priorityRank}).strict(),
  title:z.string().min(1).max(240),objective:z.string().min(1).max(500),successCriteria:z.array(z.string().min(1).max(300)).min(1).max(4),
  reasonCode:z.enum(["VALIDATED_GAP","MISSING_EVIDENCE","EVIDENCE_VERIFICATION","CONTRADICTION_REVIEW","POLICY_REVIEW","ASSESSMENT_REVIEW","RESOURCE_UNAVAILABLE","REASSESS_AFTER_CHANGES"]),
  resourceIds:z.array(z.string().regex(/^[a-z0-9-]+$/)).max(1),dependsOn:z.array(z.string().regex(/^activity_[a-f0-9]{24}$/)).max(3),
  durationMinutes:z.null(),status:z.literal("proposed"),activation:z.enum(["reviewer_required","after_prerequisites","after_review_and_policy_clearance"]),
  sourceEvidenceRefs:z.array(roadmapEvidenceRefSchema).max(48),
  validationRefs:z.array(uuidSchema).max(5),
}).strict();
export const learningRoadmapResultSchema=z.object({analysisId:uuidSchema,targetRole:competencyScoringResultSchema.shape.targetRole,
  policyId:z.literal("buktiva-frontend-roadmap"),policyVersion:z.literal("0.1.0"),policyStatus:z.literal("draft"),
  status:z.enum(["proposed","partial","blocked","no_actions"]),
  blockingReasons:z.array(z.enum(["SCORING_INPUT_BLOCKED","UPSTREAM_NOT_READY"])).max(2),
  scoringPolicy:z.object({policyId:z.string().min(1).max(80),policyVersion:z.string().min(1).max(40),policyStatus:competencyScoringResultSchema.shape.policyStatus,
    policyDigest:z.string().regex(/^[a-f0-9]{64}$/)}).strict(),
  scoringStatus:competencyScoringResultSchema.shape.scoringStatus,readinessScore:competencyScoringResultSchema.shape.readinessScore,readinessStatus:competencyScoringResultSchema.shape.readinessStatus,
  sourceSkills:z.array(roadmapSourceSkillSchema).min(1).max(100),coverage:competencyScoringResultSchema.shape.coverage,
  scoringWarnings:competencyScoringResultSchema.shape.warnings,readinessReasons:competencyScoringResultSchema.shape.readinessReasons,
  phases:z.array(z.object({phaseId:z.enum(["review","development","verification","reassessment"]),order:z.number().int().min(1).max(4),title:z.string().min(1).max(100),activities:z.array(roadmapActivitySchema).max(80)}).strict()).length(4),
  resources:z.array(learningResourceSchema).max(20),omittedSkillIds:z.array(databaseInt8Schema).max(100),
  warnings:z.array(z.enum(["POLICIES_PENDING_APPROVAL","PARTIAL_SCORING","SCORING_BLOCKED","RESOURCE_UNAVAILABLE","PLAN_TRUNCATED","SIMULATION_ONLY","DURATION_NOT_ESTIMATED"])).max(7),
  metadata:z.object({engineVersion:z.literal("buktiva-roadmap-1.0.0"),executionMode:z.enum(["non_numeric","synthetic_simulation"]),scoringDigest:z.string().regex(/^[a-f0-9]{64}$/),catalogVersion:z.literal("1.0.0"),activityCount:z.number().int().min(0).max(80)}).strict(),
}).strict().superRefine((r,c)=>{
  const activities=r.phases.flatMap(p=>p.activities),ids=new Set(activities.map(a=>a.activityId));
  const seen=new Set<string>(),skills=new Set(r.sourceSkills.map(s=>s.skillId)),resources=new Set(r.resources.map(r=>r.resourceId));
  let invalid=ids.size!==activities.length||activities.length!==r.metadata.activityCount||skills.size!==r.sourceSkills.length||r.phases.some((p,i)=>p.order!==i+1||p.phaseId!==["review","development","verification","reassessment"][i]);
  for(const activity of activities){if(!skills.has(activity.skillId)||activity.dependsOn.some(id=>!seen.has(id))||activity.resourceIds.some(id=>!resources.has(id))||new Set(activity.dependsOn).size!==activity.dependsOn.length)invalid=true;seen.add(activity.activityId);}
  if((r.status==="blocked"?(activities.length>0||!r.blockingReasons.length):r.blockingReasons.length>0)||(r.metadata.executionMode==="non_numeric"&&(r.readinessScore!==null||activities.some(a=>a.type==="learning")))||
    (r.scoringPolicy.policyStatus!=="approved"&&activities.some(a=>a.type==="learning")))invalid=true;
  if(invalid)c.addIssue({code:"custom",message:"Invalid roadmap identities, gates or dependency order"});
});
export type RoadmapActivity=z.infer<typeof roadmapActivitySchema>;
export type LearningRoadmapResult=z.infer<typeof learningRoadmapResultSchema>;
