import test from "node:test";
import assert from "node:assert/strict";
import { roadmapFixture } from "./fixtures";
import { generateLearningRoadmap } from "@/lib/roadmap/roadmap-service";
import { buildLearningRoadmap } from "@/lib/roadmap/roadmap-calculation";
import { prepareRoadmapContext } from "@/lib/roadmap/roadmap-context";
import { prepareScoringContext } from "@/lib/scoring/scoring-context";
import { buildScoringResult } from "@/lib/scoring/scoring-calculation";
import { parseResourceCatalog } from "@/lib/roadmap/resource-catalog";
import { resolveRoadmapEligibility,isLearningEligible } from "@/lib/roadmap/roadmap-eligibility-resolver";
import { buildSuccessCriteria } from "@/lib/roadmap/success-criteria-builder";

test("draft runtime creates policy review and conditional reassessment, never numeric-gap learning",async()=>{
  const f=await roadmapFixture();const result=generateLearningRoadmap(f.scoring,f.source);
  const activities=result.phases.flatMap(p=>p.activities);
  assert.deepEqual(activities.map(a=>a.type),["manual_review","reassessment"]);
  assert.equal(activities[0].reasonCode,"POLICY_REVIEW");assert.equal(result.policyStatus,"draft");assert.equal(result.scoringPolicy.policyStatus,"draft");
  assert.equal(result.sourceSkills[0].currentLevel,null);assert.equal(result.sourceSkills[0].gapScore,null);assert.equal(result.readinessScore,null);
  assert.ok(activities.every(a=>a.durationMinutes===null));assert.equal(result.resources.length,0);
  assert.deepEqual(result.coverage,f.scoring.coverage);assert.deepEqual(result.scoringWarnings,f.scoring.warnings);
});
test("unknown skill becomes evidence collection, verification and reassessment, not a weak-skill claim",async()=>{
  const f=await roadmapFixture({mapped:false});const result=generateLearningRoadmap(f.scoring,f.source);
  assert.deepEqual(result.phases.flatMap(p=>p.activities).map(a=>a.type),["evidence_collection","evidence_collection","reassessment"]);
  assert.equal(result.phases[1].activities[0].reasonCode,"MISSING_EVIDENCE");assert.equal(result.sourceSkills[0].currentLevel,null);
  assert.equal(result.status,"partial");assert.ok(!JSON.stringify(result).includes("kemampuan rendah karena"));
});
test("partial and contradictory evidence retain review requirements and source limitations",async()=>{
  for(const options of [{partial:true},{alignment:"contradicted" as const}]){
    const f=await roadmapFixture(options);const result=generateLearningRoadmap(f.scoring,f.source);
    assert.ok(result.phases[0].activities.length>0);assert.ok(result.warnings.includes("PARTIAL_SCORING"));
    assert.deepEqual(result.sourceSkills[0].limitations,f.scoring.skills[0].limitations);
    if(options.alignment)assert.equal(result.phases[0].activities[0].reasonCode,"CONTRADICTION_REVIEW");
  }
});
test("blocked scoring returns four empty phases and clear blocking reasons",async()=>{
  const f=await roadmapFixture();const extraction={...f.extraction,status:"blocked",skills:[],error:{code:"NO_SAFE_EVIDENCE"}};
  const validation={...f.validation,status:"blocked",evaluations:[],competencies:[],error:{code:"NO_SAFE_EVIDENCE"}};
  const context=prepareScoringContext(f.input,extraction,validation,f.source.scoringPolicy as typeof f.policy);
  const scoring=buildScoringResult(context);const result=generateLearningRoadmap(scoring,{...f.source,skillExtraction:extraction,validationEvaluation:validation});
  assert.equal(result.status,"blocked");assert.equal(result.metadata.activityCount,0);assert.deepEqual(result.resources,[]);
  assert.deepEqual(result.blockingReasons,["SCORING_INPUT_BLOCKED","UPSTREAM_NOT_READY"]);
});
test("synthetic approved input exercises learning with verified resources while runtime rejects it",async()=>{
  const f=await roadmapFixture({simulation:true});const result=buildLearningRoadmap(f.context);
  assert.equal(result.metadata.executionMode,"synthetic_simulation");assert.ok(result.warnings.includes("SIMULATION_ONLY"));
  assert.deepEqual(result.phases.flatMap(p=>p.activities).map(a=>a.type),["learning","evidence_collection","reassessment"]);
  assert.equal(result.resources[0].resourceId,"typescript-generics");assert.equal(result.readinessScore,66.67);
  assert.throws(()=>generateLearningRoadmap(f.scoring,f.source),/UNTRUSTED_POLICY/);
});
test("missing resource falls back to manual review without inventing a URL or duration",async()=>{
  const f=await roadmapFixture({simulation:true});const catalog=parseResourceCatalog({...f.context.catalog,resources:[]});
  const context=prepareRoadmapContext(f.scoring,f.scoringContext,f.context.policy,catalog);
  const result=buildLearningRoadmap(context);assert.equal(result.resources.length,0);assert.equal(result.phases[0].activities[0].reasonCode,"RESOURCE_UNAVAILABLE");
  assert.ok(result.warnings.includes("RESOURCE_UNAVAILABLE"));assert.ok(result.phases.flatMap(p=>p.activities).every(a=>a.type!=="learning"));
});
test("satisfied synthetic gap produces no forced advanced project, false duration or extra learning",async()=>{
  const f=await roadmapFixture({simulation:true,content:"export function identity<T>(value: T): T { return value; }\nassert.equal(identity(1), 1);\n"});
  const result=buildLearningRoadmap(f.context);assert.equal(result.status,"no_actions");assert.equal(result.metadata.activityCount,0);assert.equal(result.phases.length,4);
});
test("phase ordering and dependencies are deterministic, all criteria describe observable artifacts",async()=>{
  const f=await roadmapFixture({simulation:true});const result=buildLearningRoadmap(f.context);assert.deepEqual(buildLearningRoadmap(f.context),result);
  assert.deepEqual(result.phases.map(p=>p.order),[1,2,3,4]);const tasks=result.phases.flatMap(p=>p.activities);
  assert.deepEqual(tasks[1].dependsOn,[tasks[0].activityId]);assert.deepEqual(tasks[2].dependsOn,[tasks[1].activityId]);
  for(const name of ["review","learn","collect","verify","reassess"] as const){const criteria=buildSuccessCriteria(name);assert.equal(criteria.length,2);assert.ok(criteria.every(c=>!/[0-9]+\s*(minggu|hari|jam)|100%/.test(c)));}
});
test("resource gate and activity eligibility do not reinterpret unknown as learning",async()=>{
  const f=await roadmapFixture({mapped:false});assert.equal(isLearningEligible(f.context,f.scoring.skills[0]),false);
  assert.equal(resolveRoadmapEligibility(f.context)[0].kind,"collect");
});
