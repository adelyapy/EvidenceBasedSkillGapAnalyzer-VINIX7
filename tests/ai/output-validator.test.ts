import assert from "node:assert/strict";
import test from "node:test";
import { prepareEvidence } from "@/lib/ai/evidence-preparer";
import { resolveRubrics } from "@/lib/ai/rubric-dataset";
import { buildSkillPrompt } from "@/lib/ai/skill-prompt";
import { validateSkillOutput } from "@/lib/ai/skill-output-validator";
import { ExtractionError } from "@/lib/ai/extraction-errors";
import { aiInput,responseFor,withFiles } from "./fixtures";

function context(){const input=aiInput();const prepared=prepareEvidence(input);const prompt=buildSkillPrompt(input,resolveRubrics(input),prepared);return {input,prepared,output:responseFor(prompt)};}
test("valid citations and implementation references are accepted",()=>{
  const c=context();assert.equal(validateSkillOutput(JSON.stringify(c.output),c.input,c.prepared)[0].evidenceStatus,"implementation_evidence");
});
test("malformed, empty, oversized, empty-skill and unexpected-field JSON are rejected",()=>{
  const c=context();
  for(const raw of ["", "not JSON","{}",'{"skills":[]}',"x".repeat(65537),JSON.stringify({...c.output,readinessScore:100})])assert.throws(()=>validateSkillOutput(raw,c.input,c.prepared));
});
test("JSON-valid fabricated skill ID is rejected",()=>{
  const c=context();c.output.skills[0].skillId="123";
  assert.throws(()=>validateSkillOutput(JSON.stringify(c.output),c.input,c.prepared),e=>e instanceof ExtractionError&&e.code==="INVALID_SKILL_ID");
});
test("JSON-valid fabricated evidence ID, fileRef and wrong path are rejected",()=>{
  for(const field of ["evidenceId","fileRef","filePath"] as const){
    const c=context();c.output.skills[0].evidenceRefs[0][field]=field==="evidenceId"?"77777777-7777-4777-8777-777777777777":field==="fileRef"?`file_${"f".repeat(24)}`:"src/nonexistent.ts";
    assert.throws(()=>validateSkillOutput(JSON.stringify(c.output),c.input,c.prepared));
  }
});
test("citation cannot be reassigned to a different real evidence ID",()=>{
  const c=context();const other=structuredClone(c.input.evidences[0]);other.evidenceId="66666666-6666-4666-8666-666666666666";c.input.evidences.push(other);
  c.output.skills[0].evidenceRefs[0].evidenceId=other.evidenceId;
  assert.throws(()=>validateSkillOutput(JSON.stringify(c.output),c.input,c.prepared));
});
test("invented and whitespace-only excerpts are rejected; exact LF/CRLF excerpts accepted",()=>{
  const c=context();c.output.skills[0].evidenceRefs[0].quote="invented source code";
  assert.throws(()=>validateSkillOutput(JSON.stringify(c.output),c.input,c.prepared));
  c.output.skills[0].evidenceRefs[0].quote=" ";assert.throws(()=>validateSkillOutput(JSON.stringify(c.output),c.input,c.prepared));
  const valid=context();valid.output.skills[0].evidenceRefs[0].quote=valid.output.skills[0].evidenceRefs[0].quote.replace(/\n/g,"\r\n");
  assert.ok(validateSkillOutput(JSON.stringify(valid.output),valid.input,valid.prepared));
});
test("implementation without refs or with only dependency evidence is rejected",()=>{
  const c=context();c.output.skills[0].evidenceRefs=[];assert.throws(()=>validateSkillOutput(JSON.stringify(c.output),c.input,c.prepared));
  const input=withFiles(aiInput(),[{path:"package.json",content:'{"dependencies":{"typescript":"5"}}'}]);
  const prepared=prepareEvidence(input);const output=responseFor(buildSkillPrompt(input,resolveRubrics(input),prepared));
  output.skills[0].evidenceStatus="implementation_evidence";
  assert.throws(()=>validateSkillOutput(JSON.stringify(output),input,prepared),e=>e instanceof ExtractionError&&e.code==="UNSUPPORTED_IMPLEMENTATION_CLAIM");
  output.skills[0].evidenceStatus="observed_technology";
  assert.ok(validateSkillOutput(JSON.stringify(output),input,prepared));
});
test("duplicate skills reject the whole output deterministically",()=>{
  const c=context();c.output.skills.push(structuredClone(c.output.skills[0]));
  assert.throws(()=>validateSkillOutput(JSON.stringify(c.output),c.input,c.prepared),e=>e instanceof ExtractionError&&e.code==="DUPLICATE_SKILL");
});
test("insufficient evidence is explicit and cannot carry implementation refs",()=>{
  const c=context();c.output.skills[0].evidenceStatus="insufficient_evidence";
  assert.throws(()=>validateSkillOutput(JSON.stringify(c.output),c.input,c.prepared));
  c.output.skills[0].evidenceRefs=[];assert.ok(validateSkillOutput(JSON.stringify(c.output),c.input,c.prepared));
});
test("all official skills must be represented and no hidden score is accepted",()=>{
  const c=context();c.input.benchmarks.push({...c.input.benchmarks[0],benchmarkId:"11",skillId:"9007199254740997",skillName:"JavaScript"});
  assert.throws(()=>validateSkillOutput(JSON.stringify(c.output),c.input,c.prepared));
  for(const reason of ["Readiness score 100%","Final score: 90","Skor: 90"," "]){
    const score=context();score.output.skills[0].reason=reason;assert.throws(()=>validateSkillOutput(JSON.stringify(score.output),score.input,score.prepared));
  }
});
