import test from "node:test";
import assert from "node:assert/strict";
import snapshot from "./competency-scoring.fixture.json";
import { competencyScoringResultSchema } from "@/types/competency-scoring";
import { calculateCompetencyGaps } from "@/lib/scoring/competency-scoring-service";
import { parseScoringPolicy } from "@/lib/scoring/scoring-policy";
import { prepareScoringContext } from "@/lib/scoring/scoring-context";
import { buildScoringResult } from "@/lib/scoring/scoring-calculation";
import { validateScoringOutput } from "@/lib/scoring/scoring-output-validator";

test("documented full synthetic input/output snapshot is schema valid and reproducible in both modes",()=>{
  const {analysisInput,skillExtraction,validationEvaluation,syntheticPolicy}=snapshot.input;
  const context=prepareScoringContext(analysisInput,skillExtraction,validationEvaluation,parseScoringPolicy(syntheticPolicy));
  const simulation=buildScoringResult(context);
  assert.deepEqual(simulation,snapshot.simulationExpected);assert.ok(competencyScoringResultSchema.safeParse(simulation).success);
  assert.equal(simulation.readinessScore,66.67);assert.equal(simulation.skills[0].currentLevel,2);assert.equal(simulation.skills[0].gapScore,1);
  assert.deepEqual(validateScoringOutput(simulation,context),simulation);
  const runtime=calculateCompetencyGaps(analysisInput,skillExtraction,validationEvaluation);
  assert.deepEqual(runtime,snapshot.runtimeExpected);assert.equal(runtime.readinessScore,null);
  assert.equal(runtime.skills[0].currentLevel,null);assert.equal(runtime.skills[0].gapScore,null);
  assert.deepEqual(runtime.priorityGroups.evidenceCollection,[]);assert.equal(runtime.priorityGroups.manualReview.length,1);
});
