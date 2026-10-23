import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync,readdirSync } from "node:fs";
import { roadmapFixture } from "./fixtures";
import { buildLearningRoadmap } from "@/lib/roadmap/roadmap-calculation";
import { validateRoadmapOutput } from "@/lib/roadmap/roadmap-output-validator";
import { generateLearningRoadmap } from "@/lib/roadmap/roadmap-service";
import { learningRoadmapResultSchema } from "@/types/learning-roadmap";
import { prepareRoadmapContext } from "@/lib/roadmap/roadmap-context";
import { parseRoadmapPolicy } from "@/lib/roadmap/roadmap-policy";
import { planRoadmapPhases } from "@/lib/roadmap/roadmap-phase-planner";

test("roadmap result is serializable and deterministic with exact string int8 IDs and no raw source quotes/answers",async()=>{
  const f=await roadmapFixture();const result=generateLearningRoadmap(f.scoring,f.source);
  assert.deepEqual(validateRoadmapOutput(JSON.parse(JSON.stringify(result)),f.context),result);
  assert.deepEqual(generateLearningRoadmap(f.scoring,f.source),result);
  assert.equal(result.sourceSkills[0].skillId,"9007199254740995");assert.equal(typeof result.targetRole.id,"string");
  const json=JSON.stringify(result);for(const value of [f.input.userId,f.submission.answers[0].answerText,'"quote"','"cv"','"answerText"'])assert.ok(!json.includes(value));
});
for(const change of ["extra","duration","readiness","level","coverage","policy","fake-skill","fake-resource","fake-path","unknown-dependency","cycle","duplicate-id","success","phase-order","count","omission","priority-value","priority-order","priority-group","priority-rank","duplicate-resource","completed","finish-date"] as const){
  test(`output validator rejects forged ${change}`,async()=>{
    const f=await roadmapFixture({simulation:true});const result=structuredClone(buildLearningRoadmap(f.context));const tasks=result.phases.flatMap(p=>p.activities);
    if(change==="extra")Object.assign(result,{apiKey:"not-a-real-key"});
    if(change==="duration")Object.assign(tasks[0],{durationMinutes:120});
    if(change==="readiness")result.readinessScore=100;
    if(change==="level")result.sourceSkills[0].currentLevel=4;
    if(change==="coverage")result.coverage.skillRatio=0;
    if(change==="policy")Object.assign(result,{policyStatus:"approved"});
    if(change==="fake-skill")tasks[0].skillId="123";
    if(change==="fake-resource")tasks[0].resourceIds=["invented-resource"];
    if(change==="fake-path")tasks[0].sourceEvidenceRefs[0].filePath="src/invented.ts";
    if(change==="unknown-dependency")tasks[1].dependsOn=[`activity_${"f".repeat(24)}`];
    if(change==="cycle")tasks[0].dependsOn=[tasks[2].activityId];
    if(change==="duplicate-id")tasks[1].activityId=tasks[0].activityId;
    if(change==="success")tasks[0].successCriteria=["Guaranteed expert level in one day"];
    if(change==="phase-order")result.phases.reverse();
    if(change==="count")result.metadata.activityCount=70;
    if(change==="omission")result.omittedSkillIds=["123"];
    if(change==="priority-value")tasks[0].priority.benchmarkPriority="low";
    if(change==="priority-order")tasks[0].priority.groupOrder=2;
    if(change==="priority-group")tasks[0].priority.sourceGroup="manual_review";
    if(change==="priority-rank")tasks[0].priority.benchmarkRank=99;
    if(change==="duplicate-resource")result.resources.push(structuredClone(result.resources[0]));
    if(change==="completed")Object.assign(tasks[0],{status:"completed"});
    if(change==="finish-date")Object.assign(tasks[0],{completedAt:"2026-11-01"});
    assert.throws(()=>validateRoadmapOutput(result,f.context),/INVALID_OUTPUT/);
  });
}
test("schema rejects learning and numeric readiness in nonnumeric draft mode",async()=>{
  const f=await roadmapFixture();const result=generateLearningRoadmap(f.scoring,f.source);
  result.phases[0].activities[0].type="learning";assert.equal(learningRoadmapResultSchema.safeParse(result).success,false);
});
test("every activity inherits the exact M6 group position and raw benchmark priority without invented weights",async()=>{
  for(const options of [{},{mapped:false},{simulation:true}]){
    const f=await roadmapFixture(options);const result=buildLearningRoadmap(f.context);
    for(const activity of result.phases.flatMap(p=>p.activities)){
      const skill=f.scoring.skills.find(s=>s.skillId===activity.skillId)!;
      const ids=activity.priority.sourceGroup==="manual_review"?f.scoring.priorityGroups.manualReview:activity.priority.sourceGroup==="evidence_collection"?f.scoring.priorityGroups.evidenceCollection:f.scoring.priorityGroups.learning;
      assert.equal(activity.priority.groupOrder,ids.indexOf(skill.skillId)+1);
      assert.equal(activity.priority.benchmarkPriority,skill.priority);assert.equal(activity.priority.benchmarkRank,skill.priorityRank);
    }
  }
});
test("M6 semantic recomputation rejects forged priority groups, readiness, policy digest and cross-analysis data",async()=>{
  for(const change of ["priorities","readiness","digest","analysis"] as const){
    const f=await roadmapFixture();const scoring=structuredClone(f.scoring);
    if(change==="priorities")scoring.priorityGroups.learning=[scoring.skills[0].skillId];
    if(change==="readiness")scoring.readinessScore=100;
    if(change==="digest")scoring.calculationMetadata.policyDigest="f".repeat(64);
    if(change==="analysis")scoring.analysisId="77777777-7777-4777-8777-777777777777";
    assert.throws(()=>generateLearningRoadmap(scoring,f.source),/INVALID_SCORING/);
  }
});
test("planner caps select complete per-skill activity chains, records omissions and preserves M6 order",async()=>{
  const f=await roadmapFixture();const scoring=structuredClone(f.scoring);
  const second={...structuredClone(scoring.skills[0]),skillId:"9007199254740997"};scoring.skills.push(second);scoring.priorityGroups.manualReview.push(second.skillId);
  // Unit-only planner fixture: bypasses no runtime trust boundary; policy cap is under test.
  const policy=parseRoadmapPolicy({...f.context.policy,fallbackRules:{...f.context.policy.fallbackRules,maxSkills:1}});
  const planned=planRoadmapPhases({...f.context,scoring,policy});assert.equal(planned.activityCount,2);
  assert.deepEqual(planned.omittedSkillIds,[second.skillId]);assert.ok(planned.warnings.includes("PLAN_TRUNCATED"));
  assert.equal(planned.phases[0].activities[0].skillId,scoring.priorityGroups.manualReview[0]);
});
test("public service performs no external I/O or fixture imports and does not mutate input",async()=>{
  const f=await roadmapFixture();const before=JSON.stringify(f.scoring);const previous=globalThis.fetch;
  globalThis.fetch=async()=>{throw new Error("UNEXPECTED_NETWORK");};
  try{generateLearningRoadmap(f.scoring,f.source);}finally{globalThis.fetch=previous;}
  assert.equal(JSON.stringify(f.scoring),before);
  for(const name of readdirSync("src/lib/roadmap").filter(n=>n.endsWith(".ts"))){
    const source=readFileSync(`src/lib/roadmap/${name}`,"utf8");
    assert.ok(!/@google\/genai|@supabase|gemini-skill-provider|\.\.[^"'\n]*tests\/|process\.env|\bfetch\s*\(|\.insert\s*\(|\.upsert\s*\(|["']use server["']/.test(source),name);
  }
});
test("internal simulation context also requires a semantically valid M6 result",async()=>{
  const f=await roadmapFixture({simulation:true});const scoring=structuredClone(f.scoring);scoring.skills[0].gapScore=4;
  assert.throws(()=>prepareRoadmapContext(scoring,f.scoringContext,f.context.policy,f.context.catalog),/INVALID_SCORING/);
});
