import test from "node:test";
import assert from "node:assert/strict";
import golden from "./golden-cases.json";
import { scoringFixture, simulate } from "./fixtures";

for(const expected of golden.cases){
  test(`golden rule oracle ${expected.id}`,async()=>{
    const result=simulate(await scoringFixture({content:expected.content}));const skill=result.skills[0];
    assert.equal(skill.currentLevel,expected.currentLevel);assert.equal(skill.requiredLevel,expected.requiredLevel);
    assert.equal(skill.gapScore,expected.gapScore);assert.equal(result.readinessScore,expected.readinessScore);
    assert.equal(result.calculationMetadata.executionMode,"synthetic_simulation");
    assert.ok(result.warnings.includes("SIMULATION_ONLY"));
  });
}
