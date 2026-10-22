import "server-only";
import { modelSkillOutputSchema, type ExtractedSkill } from "@/types/skill-extraction";
import type { AnalysisInput } from "@/types/analysis-input";
import { containsPossibleSecret } from "@/lib/ingestion/file-filter";
import { containsPersonalData, containsPromptInjection, normalizeNewlines, type PreparedEvidence } from "./evidence-preparer";
import { ExtractionError } from "./extraction-errors";

export const MAX_MODEL_RESPONSE_BYTES=64*1024;

export function validateSkillOutput(raw:string,input:AnalysisInput,prepared:PreparedEvidence):ExtractedSkill[] {
  if(typeof raw!=="string"||!raw.trim()||Buffer.byteLength(raw)>MAX_MODEL_RESPONSE_BYTES)throw new ExtractionError("INVALID_MODEL_OUTPUT");
  let object:unknown;
  try{object=JSON.parse(raw);}catch{throw new ExtractionError("INVALID_MODEL_OUTPUT");}
  const parsed=modelSkillOutputSchema.safeParse(object);
  if(!parsed.success)throw new ExtractionError("INVALID_MODEL_OUTPUT");
  const allowed=new Set(input.benchmarks.map(benchmark=>benchmark.skillId));
  const seen=new Set<string>();
  for(const skill of parsed.data.skills){
    if(!allowed.has(skill.skillId))throw new ExtractionError("INVALID_SKILL_ID");
    if(seen.has(skill.skillId))throw new ExtractionError("DUPLICATE_SKILL");
    seen.add(skill.skillId);
    if(containsPossibleSecret(skill.reason)||containsPersonalData(skill.reason)||containsPromptInjection(skill.reason)||
      skill.reason.includes(input.userId)||skill.reason.includes(input.analysisId)||
      /readiness|roadmap|skill[ _-]?gap|\b(?:score|skor)\b|\b\d{1,3}\s*%/i.test(skill.reason))throw new ExtractionError("INVALID_MODEL_OUTPUT");
    if(skill.evidenceStatus==="insufficient_evidence"){
      if(skill.evidenceRefs.length)throw new ExtractionError("INVALID_EVIDENCE_REFERENCE");
      continue;
    }
    if(!skill.evidenceRefs.length)throw new ExtractionError("UNSUPPORTED_IMPLEMENTATION_CLAIM");
    let implementationReference=false;
    const refs=new Set<string>();
    for(const ref of skill.evidenceRefs){
      const entry=prepared.index.find(entry=>entry.fileRef===ref.fileRef);
      const key=JSON.stringify([ref.evidenceId,ref.fileRef,ref.quote]);
      if(!entry||entry.evidenceId!==ref.evidenceId||entry.filePath!==ref.filePath||refs.has(key)||
        !input.evidences.some(e=>e.evidenceId===ref.evidenceId)||!entry.content.includes(normalizeNewlines(ref.quote))){
        throw new ExtractionError("INVALID_EVIDENCE_REFERENCE");
      }
      refs.add(key);
      if(entry.kind==="source"||entry.kind==="test")implementationReference=true;
    }
    if(skill.evidenceStatus==="implementation_evidence"&&!implementationReference)throw new ExtractionError("UNSUPPORTED_IMPLEMENTATION_CLAIM");
  }
  if(seen.size!==allowed.size)throw new ExtractionError("INVALID_SKILL_ID");
  return parsed.data.skills.map(skill=>({...skill,evidenceRefs:skill.evidenceRefs.map(ref=>({...ref,quote:normalizeNewlines(ref.quote)}))
    .sort((a,b)=>a.fileRef<b.fileRef?-1:a.fileRef>b.fileRef?1:a.quote<b.quote?-1:a.quote>b.quote?1:0)}))
    .sort((a,b)=>BigInt(a.skillId)<BigInt(b.skillId)?-1:BigInt(a.skillId)>BigInt(b.skillId)?1:0);
}
