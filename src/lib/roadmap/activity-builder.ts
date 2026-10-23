import "server-only";
import { createHash } from "node:crypto";
import type { RoadmapActivity } from "@/types/learning-roadmap";
import type { ScoringSkill } from "@/types/competency-scoring";
import type { RoadmapContext } from "./roadmap-context";
import { buildSuccessCriteria } from "./success-criteria-builder";
import { canonical } from "@/lib/scoring/scoring-context";
import { RoadmapError } from "./errors";

const definitions={
  review:{type:"manual_review",phase:"review",title:"Tinjau dasar penilaian",objective:"Minta reviewer memeriksa hubungan bukti, klaim, mapping pertanyaan, dan status persetujuan policy sebelum menyimpulkan kemampuan.",activation:"reviewer_required"},
  learn:{type:"learning",phase:"development",title:"Latihan terarah",objective:"Pelajari referensi yang relevan lalu buat latihan kecil yang menjawab gap sah pada input simulasi; aktivitas tidak menjamin kenaikan level.",activation:"after_prerequisites"},
  collect:{type:"evidence_collection",phase:"development",title:"Lengkapi bukti",objective:"Sediakan contoh implementasi yang relevan, asal proyek dan revisinya, serta batas kontribusi yang diklaim. Bukti belum tersedia bukan berarti kemampuan rendah.",activation:"after_prerequisites"},
  verify:{type:"evidence_collection",phase:"verification",title:"Verifikasi artefak",objective:"Siapkan pemeriksaan perilaku dan kasus batas yang relevan untuk artefak; catat apa yang benar-benar diuji dan yang belum diverifikasi.",activation:"after_prerequisites"},
  reassess:{type:"reassessment",phase:"reassessment",title:"Ajukan asesmen ulang",objective:"Setelah bukti atau temuan review diperbarui, ajukan validasi ulang melalui alur yang sah. Jangan menganggap aktivitas selesai sebagai persetujuan atau perubahan skor.",activation:"after_review_and_policy_clearance"},
} as const;
export type ActivityTemplate=keyof typeof definitions;
export function createRoadmapActivity(context:RoadmapContext,skill:ScoringSkill,template:ActivityTemplate,reasonCode:RoadmapActivity["reasonCode"],dependsOn:string[]=[],resourceId?:string){
  const definition=definitions[template];
  const groups=context.scoring.priorityGroups;
  const sourceGroup=groups.manualReview.includes(skill.skillId)?"manual_review":groups.evidenceCollection.includes(skill.skillId)?"evidence_collection":groups.learning.includes(skill.skillId)?"learning":undefined;
  if(!sourceGroup)throw new RoadmapError("INVALID_SCORING");
  const sourceIds=sourceGroup==="manual_review"?groups.manualReview:sourceGroup==="evidence_collection"?groups.evidenceCollection:groups.learning;
  const activityId=`activity_${createHash("sha256").update(JSON.stringify([canonical(context.scoring),context.policy.policyVersion,skill.skillId,template])).digest("hex").slice(0,24)}`;
  const references=new Map(skill.evidenceRefs.map(({evidenceId,fileRef,filePath})=>[`${evidenceId}:${fileRef}`,{evidenceId,fileRef,filePath}]));
  const activity:RoadmapActivity={activityId,skillId:skill.skillId,type:definition.type,title:`${definition.title}: ${skill.skillName}`,objective:definition.objective,
    priority:{sourceGroup,groupOrder:sourceIds.indexOf(skill.skillId)+1,benchmarkPriority:skill.priority,benchmarkRank:skill.priorityRank},
    successCriteria:buildSuccessCriteria(template),reasonCode,resourceIds:resourceId?[resourceId]:[],dependsOn,durationMinutes:null,status:"proposed",activation:definition.activation,
    sourceEvidenceRefs:[...references.values()],validationRefs:[...skill.validationRefs]};
  return {phaseId:definition.phase,activity};
}
