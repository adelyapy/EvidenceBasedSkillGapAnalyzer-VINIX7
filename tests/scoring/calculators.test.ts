import test from "node:test";
import assert from "node:assert/strict";
import { calculateSkillGap } from "@/lib/scoring/skill-gap-calculator";
import { evaluateCoverage } from "@/lib/scoring/coverage-evaluator";
import { calculateReadiness } from "@/lib/scoring/readiness-calculator";
import { rankPriorities } from "@/lib/scoring/priority-ranker";
import { scoringCoverageSchema } from "@/types/competency-scoring";
import { loadScoringPolicy } from "@/lib/scoring/scoring-policy";
import { scoringFixture, simulate } from "./fixtures";

for (const [required, current, expected] of [[3,1,2],[3,3,0],[2,4,0],[3,null,null],[null,2,null],[0,0,0]] as const) {
  test(`gap ${required} - ${current} is ${expected} without unknown-to-zero conversion`, () => {
    assert.equal(calculateSkillGap(required, current), expected); assert.equal(calculateSkillGap(required,current),expected);
  });
}
test("gap rejects fractions, NaN, Infinity, missing/undefined and outside scale", () => {
  for (const value of [-1,5,1.5,NaN,Infinity,undefined]) assert.throws(() => calculateSkillGap(value as number,1));
});
test("coverage reports full versus zero and partial skill counts independently of source inclusion", async () => {
  const f = await scoringFixture(); const result = simulate(f);
  assert.equal(result.coverage.skillRatio,1); assert.equal(result.coverage.assessedSkills,1); assert.equal(result.coverage.sources.complete,1);
  const unknown = structuredClone(result.skills); unknown[0].currentLevel=null; unknown[0].gapScore=null; unknown[0].assessmentStatus="not_assessable";
  const none = evaluateCoverage(f.context,unknown); assert.equal(none.skillRatio,0); assert.equal(none.unassessedSkills,1); assert.equal(none.incomplete,true);
  const two = evaluateCoverage(f.context,[result.skills[0],{...unknown[0],skillId:"9007199254740997"}]); assert.equal(two.skillRatio,0.5); assert.equal(two.unassessedSkills,1);
});
test("source coverage counts complete, partial, blocked, failed, unsupported without conflating model confidence", async () => {
  const f = await scoringFixture({partial:true});
  for (const status of ["blocked","failed","unsupported"] as const) f.context.input.evidences.push({evidenceId:status==="blocked"?"66666666-6666-4666-8666-666666666666":status==="failed"?"77777777-7777-4777-8777-777777777777":"88888888-8888-4888-8888-888888888888",sourceType:"zip",sourceReference:"evidence:placeholder",status,error:"STORAGE_READER_NOT_READY",warnings:[]});
  const coverage=evaluateCoverage(f.context,simulate(f).skills);
  assert.deepEqual(coverage.sources,{total:4,complete:0,partial:1,blocked:1,failed:1,unsupported:1});
  assert.equal(coverage.skillRatio,0); assert.ok(coverage.limitations.includes("PARTIAL_UPSTREAM"));
});
test("coverage schema rejects invented counters and inconsistent ratio", async () => {
  const f=await scoringFixture();const coverage=simulate(f).coverage;
  assert.equal(scoringCoverageSchema.safeParse({...coverage,skillRatio:0.5}).success,false);
  assert.equal(scoringCoverageSchema.safeParse({...coverage,unassessedSkills:10}).success,false);
});
test("readiness draft is null and synthetic readiness uses all benchmark weights and exact rounding", async()=>{
  const f=await scoringFixture();const r=simulate(f);
  assert.equal(calculateReadiness(r.skills,r.coverage,loadScoringPolicy()).readinessScore,null);
  assert.equal(calculateReadiness(r.skills,r.coverage,f.policy).readinessScore,66.67);
  const skills=[{...r.skills[0],skillId:"1",requiredLevel:4,currentLevel:4,gapScore:0},{...r.skills[0],skillId:"2",requiredLevel:4,currentLevel:2,gapScore:2}];
  const coverage=evaluateCoverage(f.context,skills); const p=structuredClone(f.policy);p.readinessWeights=[{skillId:"1",weight:1},{skillId:"2",weight:3}];p.mandatorySkillIds=["1","2"];
  assert.equal(calculateReadiness(skills,coverage,p).readinessScore,62.5);
  assert.deepEqual(calculateReadiness(skills,coverage,p),calculateReadiness(skills,coverage,p));
});
test("unknown mandatory skills cannot become false 100%, even with forged full coverage", async()=>{
  const f=await scoringFixture();const r=simulate(f);const skills=structuredClone(r.skills);skills[0].currentLevel=null;skills[0].gapScore=null;skills[0].assessmentStatus="not_assessable";
  const result=calculateReadiness(skills,r.coverage,f.policy); assert.equal(result.readinessScore,null);
  assert.ok(result.readinessReasons.includes("MANDATORY_SKILL_UNKNOWN"));
  const measured=[{...r.skills[0],currentLevel:4,gapScore:0}, {...skills[0],skillId:"9007199254740997"}];
  const policy=structuredClone(f.policy);policy.readinessWeights.push({skillId:measured[1].skillId,weight:1});policy.coverageRequirements.minimumSkillRatio=0;
  assert.equal(calculateReadiness(measured,evaluateCoverage(f.context,measured),policy).readinessScore,null);
});
test("readiness rejects zero denominator, invalid/duplicate/extra weights and zero required level", async()=>{
  const f=await scoringFixture();const r=simulate(f);
  for(const weights of [[],[{skillId:r.skills[0].skillId,weight:0}],[{skillId:r.skills[0].skillId,weight:-1}],[{skillId:r.skills[0].skillId,weight:NaN}],[{skillId:"123",weight:1}],...[[...f.policy.readinessWeights,...f.policy.readinessWeights]]]){
    const result=calculateReadiness(r.skills,r.coverage,{...f.policy,readinessWeights:weights});assert.equal(result.readinessScore,null);assert.ok(result.readinessReasons.includes("INVALID_WEIGHTS"));
  }
  assert.equal(calculateReadiness([{...r.skills[0],requiredLevel:0}],r.coverage,f.policy).readinessScore,null);
  assert.equal(calculateReadiness([{...r.skills[0],currentLevel:5}],r.coverage,f.policy).readinessScore,null);
});
test("readiness caps overachievement at 100 and never exceeds its scale", async()=>{
  const f=await scoringFixture();const r=simulate(f);
  assert.equal(calculateReadiness([{...r.skills[0],currentLevel:4,requiredLevel:1,gapScore:0}],r.coverage,f.policy).readinessScore,100);
});
test("priority ranking separates learning, evidence collection and manual review with deterministic int8 tie breaks",async()=>{
  const f=await scoringFixture();const s=simulate(f).skills[0];
  const skills=[{...s,skillId:"9007199254740997",gapScore:1,priorityRank:1},{...s,skillId:"9007199254740995",gapScore:1,priorityRank:1},
    {...s,skillId:"9007199254740999",gapScore:3,priorityRank:2},
    {...s,skillId:"9007199254741001",currentLevel:null,gapScore:null,assessmentStatus:"not_assessable" as const},
    {...s,skillId:"9007199254741003",currentLevel:null,gapScore:null,assessmentStatus:"needs_review" as const},
    {...s,skillId:"9007199254741005",currentLevel:null,gapScore:null,assessmentStatus:"contradictory_evidence" as const}];
  const result=rankPriorities(skills);
  assert.deepEqual(result.learning,["9007199254740995","9007199254740997","9007199254740999"]);
  assert.deepEqual(result.evidenceCollection,["9007199254741001"]); assert.deepEqual(result.manualReview,["9007199254741005","9007199254741003"]);
  assert.deepEqual(rankPriorities([...skills].reverse()),result);
});
test("unapproved priority mapping never invents a learning rank",async()=>{
  const f=await scoringFixture();f.policy.benchmarkPriorityRules.approved=false;const result=simulate(f);
  assert.equal(result.skills[0].priorityRank,null);assert.deepEqual(result.priorityGroups.learning,[]);
  f.policy.benchmarkPriorityRules.approved=true;f.input.benchmarks[0].priority="unknown-category";
  const unknown=simulate(f);assert.equal(unknown.skills[0].priorityRank,null);assert.deepEqual(unknown.priorityGroups.learning,[]);
});
