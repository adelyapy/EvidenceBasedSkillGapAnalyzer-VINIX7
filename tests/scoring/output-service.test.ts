import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { scoringFixture, simulate } from "./fixtures";
import { calculateCompetencyGaps } from "@/lib/scoring/competency-scoring-service";
import { validateScoringOutput } from "@/lib/scoring/scoring-output-validator";
import { competencyScoringResultSchema } from "@/types/competency-scoring";
import { prepareScoringContext } from "@/lib/scoring/scoring-context";

test("scoring output round-trips JSON deterministically and preserves int8 IDs as strings",async()=>{
  const f=await scoringFixture();const result=simulate(f);
  assert.deepEqual(validateScoringOutput(JSON.parse(JSON.stringify(result)),f.context),result);
  assert.equal(result.skills[0].skillId,"9007199254740995");assert.equal(typeof result.targetRole.id,"string");
  assert.deepEqual(simulate(f),result); assert.ok(!Object.hasOwn(result,"userId")); assert.ok(!Object.hasOwn(result,"cv"));
});
for(const change of ["gap","coverage","readiness","level","required","duplicate","foreign-analysis","priority","unknown-zero","extra","references"] as const){
  test(`output validator rejects forged ${change}`,async()=>{
    const f=await scoringFixture();const result=structuredClone(simulate(f));
    if(change==="gap")result.skills[0].gapScore=4;
    if(change==="coverage")result.coverage.assessedSkills=0;
    if(change==="readiness")result.readinessScore=100;
    if(change==="level"){result.skills[0].currentLevel=3;result.skills[0].gapScore=0;result.readinessScore=100;}
    if(change==="required"){result.skills[0].requiredLevel=4;result.skills[0].gapScore=2;}
    if(change==="duplicate")result.skills.push(structuredClone(result.skills[0]));
    if(change==="foreign-analysis")result.analysisId="77777777-7777-4777-8777-777777777777";
    if(change==="priority")result.priorityGroups.learning=[];
    if(change==="unknown-zero"){result.skills[0].assessmentStatus="not_assessable";result.skills[0].currentLevel=0;result.skills[0].gapScore=3;}
    if(change==="extra")Object.assign(result,{roadmap:[]});
    if(change==="references")result.skills[0].evidenceRefs[0].fileRef=`file_${"f".repeat(24)}`;
    assert.throws(()=>validateScoringOutput(result,f.context),/INVALID_OUTPUT/);
  });
}
test("draft numeric levels/readiness fail strict result schema",async()=>{
  const f=await scoringFixture();const result=calculateCompetencyGaps(f.input,f.extraction,f.validation);
  assert.ok(competencyScoringResultSchema.safeParse(result).success);
  result.skills[0].currentLevel=1;result.skills[0].assessmentStatus="assessed";result.skills[0].gapScore=2;
  result.readinessScore=33.33;result.readinessStatus="simulation_computed";
  assert.equal(competencyScoringResultSchema.safeParse(result).success,false);
});
test("production entry rejects any supplied synthetic or forged approved policy, regardless of flags",async()=>{
  const f=await scoringFixture();
  assert.throws(()=>calculateCompetencyGaps(f.input,f.extraction,f.validation,f.policy),/UNTRUSTED_POLICY/);
  const production=structuredClone(f.policy);production.scope="production";production.approvalMetadata!.kind="human_review";
  assert.throws(()=>calculateCompetencyGaps(f.input,f.extraction,f.validation,production),/UNTRUSTED_POLICY/);
});
test("M4 blocked and M5 failed stay blocked with unknown levels and explicit upstream coverage",async()=>{
  const f=await scoringFixture();
  const extraction={...f.extraction,status:"blocked",skills:[],error:{code:"NO_SAFE_EVIDENCE"}};
  const validation={...f.validation,status:"blocked",evaluations:[],competencies:[],error:{code:"NO_SAFE_EVIDENCE"}};
  const result=calculateCompetencyGaps(f.input,extraction,validation);
  assert.equal(result.scoringStatus,"blocked");assert.equal(result.readinessScore,null);assert.equal(result.skills[0].currentLevel,null);
  assert.equal(result.coverage.extractionStatus,"blocked");
  const failed={...validation,status:"failed",error:{code:"PROVIDER_FAILURE"}};
  assert.equal(calculateCompetencyGaps(f.input,f.extraction,failed).scoringStatus,"blocked");
  assert.throws(()=>calculateCompetencyGaps(f.input,extraction,f.validation),/INVALID_SNAPSHOT/);
});
test("invalid input, M5 subtotal, foreign skill and snapshot coverage reject before calculation",async()=>{
  const f=await scoringFixture();assert.throws(()=>calculateCompetencyGaps({},f.extraction,f.validation),/INVALID_INPUT/);
  for(const change of ["subtotal","skill","coverage"] as const){
    const validation=structuredClone(f.validation);
    if(change==="subtotal")validation.evaluations[0].answerQuality.score=0;
    if(change==="skill")validation.evaluations[0].relatedSkillIds=["123"];
    if(change==="coverage")validation.coverage.sentContentBytes++;
    assert.throws(()=>calculateCompetencyGaps(f.input,f.extraction,validation));
  }
});
test("a failed source remains visible with no missing-to-zero conversion",async()=>{
  const f=await scoringFixture();const input=structuredClone(f.input);
  input.evidences=[{evidenceId:input.evidences[0].evidenceId,sourceType:"github",sourceReference:`evidence:${input.evidences[0].evidenceId}`,status:"failed",error:"EVIDENCE_FETCH_FAILED",warnings:[]}];
  input.processingStatus="failed";
  const coverage={sourceCount:1,includedSources:0,discoveredFiles:0,availableFiles:0,sentFiles:0,skippedFiles:0,sentContentBytes:0};
  const extraction={...f.extraction,status:"failed",skills:[],coverage,error:{code:"PROVIDER_FAILURE"}};
  const validation={...f.validation,status:"failed",evaluations:[],competencies:[],coverage,error:{code:"PROVIDER_FAILURE"}};
  const result=calculateCompetencyGaps(input,extraction,validation);assert.equal(result.coverage.sources.failed,1);assert.equal(result.skills[0].currentLevel,null);
});
test("invalid benchmark labels remain null and cannot silently become a scale value",async()=>{
  const f=await scoringFixture();f.input.benchmarks[0].requiredLevel="advanced";
  const result=simulate(f);assert.equal(result.skills[0].requiredLevel,null);assert.equal(result.skills[0].currentLevel,null);assert.equal(result.skills[0].gapScore,null);
  assert.ok(result.readinessReasons.includes("INVALID_BENCHMARK"));
});
test("core scoring performs no fetch and runtime never imports fixture policies, SDK, DB or environment approval",async()=>{
  const f=await scoringFixture();const previous=globalThis.fetch;
  globalThis.fetch=async()=>{throw new Error("UNEXPECTED_NETWORK");};
  try{assert.equal(calculateCompetencyGaps(f.input,f.extraction,f.validation).readinessScore,null);}finally{globalThis.fetch=previous;}
  for(const name of readdirSync("src/lib/scoring").filter(n=>n.endsWith(".ts"))){
    const source=readFileSync(`src/lib/scoring/${name}`,"utf8");
    assert.ok(!/@google\/genai|@supabase|gemini-skill-provider|\.\.[^"'\n]*tests\/|process\.env|\bfetch\s*\(|\.insert\s*\(|\.upsert\s*\(|["']use server["']/.test(source),name);
  }
});
test("under-review, retired and production approved claims cannot produce numeric levels in the internal kernel",async()=>{
  const f=await scoringFixture();
  for(const status of ["under_review","retired"] as const){f.policy.policyStatus=status;f.policy.approvalMetadata=null;assert.equal(simulate(f).skills[0].currentLevel,null);}
  const production=structuredClone(f.policy);production.policyStatus="approved";production.scope="production";production.approvalMetadata={kind:"human_review",reviewer:"UNVERIFIED",reference:"untrusted claim",approvedPolicyVersion:production.policyVersion,approvedOn:"2026-10-22"};
  const context=prepareScoringContext(f.input,f.extraction,f.validation,production);
  // Even the internal kernel cannot label this caller-supplied policy as real-user numerical scoring.
  const {buildScoringResult}=await import("@/lib/scoring/scoring-calculation");assert.equal(buildScoringResult(context).skills[0].currentLevel,null);
});
