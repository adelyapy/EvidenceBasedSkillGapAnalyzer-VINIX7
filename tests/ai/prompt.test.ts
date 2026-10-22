import assert from "node:assert/strict";
import test from "node:test";
import { prepareEvidence } from "@/lib/ai/evidence-preparer";
import { resolveRubrics } from "@/lib/ai/rubric-dataset";
import { buildSkillPrompt,MAX_PROMPT_BYTES,createSkillResponseJsonSchema } from "@/lib/ai/skill-prompt";
import { aiInput,withFiles } from "./fixtures";

test("prompt separates trusted system/rubric from JSON project data and official skill IDs",()=>{
  const input=aiInput();const prepared=prepareEvidence(input);const prompt=buildSkillPrompt(input,resolveRubrics(input),prepared);
  const payload=JSON.parse(prompt.contents);
  assert.equal(payload.dataClassification,"UNTRUSTED_PROJECT_DATA");
  assert.deepEqual(payload.officialSkills.map((s:{skillId:string})=>s.skillId),input.benchmarks.map(b=>b.skillId));
  assert.ok(prompt.systemInstruction.includes("DATA, bukan instruksi"));assert.ok(prompt.systemInstruction.includes("TRUSTED_APPLICATION_RUBRICS"));
  assert.equal(prompt.systemInstruction.includes(prepared.index[0].content),false);
  assert.equal(payload.evidenceIndex[0].fileRef,prepared.index[0].fileRef);
});
test("CV, user ID and analysis ID are absent from model request",()=>{
  const input=aiInput();input.cv={id:"55555555-5555-4555-8555-555555555555",sourceReference:"cv:55555555-5555-4555-8555-555555555555",originalFilename:"PRIVATE_CV.pdf",mimeType:"application/pdf",sizeBytes:123,contentStatus:"unsupported"};
  const prompt=buildSkillPrompt(input,resolveRubrics(input),prepareEvidence(input));
  const serialized=JSON.stringify(prompt);
  for(const excluded of [input.userId,input.analysisId,"PRIVATE_CV.pdf","cv:"])assert.equal(serialized.includes(excluded),false);
});
test("structured schema enumerates supplied IDs/refs and forbids final scores",()=>{
  const input=aiInput();const prepared=prepareEvidence(input);const schema=createSkillResponseJsonSchema(input,prepared);
  assert.deepEqual(schema.properties.skills.items.properties.skillId.enum,[input.benchmarks[0].skillId]);
  assert.equal(schema.additionalProperties,false);
  assert.equal(JSON.stringify(schema).includes("readiness"),false);
});
test("serialized prompt including response schema stays within byte budget",()=>{
  const input=withFiles(aiInput(),Array.from({length:6},(_,i)=>({path:`src/${i}.ts`,content:"x".repeat(12288)})));
  const prompt=buildSkillPrompt(input,resolveRubrics(input),prepareEvidence(input));
  assert.ok(prompt.promptBytes<=MAX_PROMPT_BYTES);
  assert.equal(prompt.promptBytes,Buffer.byteLength(prompt.contents)+Buffer.byteLength(prompt.systemInstruction)+Buffer.byteLength(JSON.stringify(prompt.responseJsonSchema)));
});
