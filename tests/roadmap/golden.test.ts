import test from "node:test";
import assert from "node:assert/strict";
import golden from "./golden-cases.json";
import { roadmapFixture } from "./fixtures";
import { buildLearningRoadmap } from "@/lib/roadmap/roadmap-calculation";
for(const expected of golden.cases){
  test(`golden roadmap contract ${expected.id}`,async()=>{
    const f=await roadmapFixture(expected.options as Parameters<typeof roadmapFixture>[0]);const result=buildLearningRoadmap(f.context);
    assert.deepEqual(result.phases.flatMap(p=>p.activities).map(a=>a.type),expected.expectedTypes);
    assert.equal(result.status,expected.expectedStatus);assert.deepEqual(result.resources.map(r=>r.resourceId),expected.expectedResourceIds);
    assert.equal(result.policyStatus,"draft");assert.ok(result.phases.flatMap(p=>p.activities).every(a=>a.durationMinutes===null));
  });
}
