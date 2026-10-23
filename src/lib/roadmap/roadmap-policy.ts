import "server-only";
import { z } from "zod";
import file from "@/data/roadmap/roadmap-policy.draft.json";
import { canonical } from "@/lib/scoring/scoring-context";
import { RoadmapError } from "./errors";

export const activityTypeSchema=z.enum(["learning","evidence_collection","manual_review","reassessment"]);
export const roadmapPolicySchema=z.object({
  policyId:z.literal("buktiva-frontend-roadmap"),policyVersion:z.literal("0.1.0"),policyStatus:z.enum(["draft","under_review","approved","retired"]),supportedRole:z.literal("frontend-developer"),
  allowedActivityTypes:z.array(activityTypeSchema).length(4),
  eligibilityRules:z.object({learning:z.literal("approved_scoring_positive_gap_only"),unknown:z.literal("evidence_not_low_ability"),blocked:z.literal("empty_plan"),draftScoring:z.literal("review_and_evidence_only")}).strict(),
  resourceSelectionRules:z.object({catalogVersion:z.literal("1.0.0"),source:z.literal("pinned_verified_catalog"),missing:z.literal("manual_review"),maxPerActivity:z.literal(1)}).strict(),
  phaseOrderingRules:z.array(z.object({phaseId:z.enum(["review","development","verification","reassessment"]),order:z.number().int().min(1).max(4),title:z.string().min(1).max(100)}).strict()).length(4),
  priorityRules:z.literal("preserve_m6_group_order_then_int8"),successCriteriaRules:z.literal("observable_artifact_and_review_no_level_guarantee"),
  approvedPolicyRequirements:z.object({humanReviewRequired:z.literal(true),noRequestApproval:z.literal(true)}).strict(),
  fallbackRules:z.object({missingSkillResource:z.literal("manual_review"),noEligibleActivities:z.literal("empty_plan"),duration:z.literal("unknown_null"),maxSkills:z.number().int().min(1).max(20),maxActivities:z.number().int().min(4).max(80)}).strict(),
  warningRules:z.array(z.enum(["POLICIES_PENDING_APPROVAL","PARTIAL_SCORING","SCORING_BLOCKED","RESOURCE_UNAVAILABLE","PLAN_TRUNCATED","SIMULATION_ONLY","DURATION_NOT_ESTIMATED"])).length(7),
  approvalMetadata:z.null(),
}).strict().superRefine((p,c)=>{
  if(p.policyStatus==="approved"||new Set(p.allowedActivityTypes).size!==4||new Set(p.phaseOrderingRules.map(p=>p.phaseId)).size!==4||
    p.phaseOrderingRules.some((phase,i)=>phase.order!==i+1||phase.phaseId!==["review","development","verification","reassessment"][i])||new Set(p.warningRules).size!==7)c.addIssue({code:"custom",message:"Invalid roadmap policy state/order"});
});
export function parseRoadmapPolicy(raw:unknown=file){const parsed=roadmapPolicySchema.safeParse(raw);if(!parsed.success)throw new RoadmapError("INVALID_POLICY");return parsed.data;}
export function loadRoadmapPolicy(raw?:unknown){const p=parseRoadmapPolicy(raw);if(canonical(p)!==canonical(parseRoadmapPolicy()))throw new RoadmapError("UNTRUSTED_POLICY");return p;}
export type RoadmapPolicy=ReturnType<typeof parseRoadmapPolicy>;
