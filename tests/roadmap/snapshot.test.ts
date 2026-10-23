import test from "node:test";
import assert from "node:assert/strict";
import snapshot from "./learning-roadmap.fixture.json";
import { generateLearningRoadmap } from "@/lib/roadmap/roadmap-service";
import { loadRoadmapPolicy } from "@/lib/roadmap/roadmap-policy";
import { loadResourceCatalog } from "@/lib/roadmap/resource-catalog";
import { parseScoringPolicy } from "@/lib/scoring/scoring-policy";
import { prepareScoringContext } from "@/lib/scoring/scoring-context";
import { prepareRoadmapContext } from "@/lib/roadmap/roadmap-context";
import { buildLearningRoadmap } from "@/lib/roadmap/roadmap-calculation";
import { validateRoadmapOutput } from "@/lib/roadmap/roadmap-output-validator";
test("complete documented synthetic snapshot is schema/semantic valid in runtime and internal simulation",()=>{
  assert.deepEqual(generateLearningRoadmap(snapshot.runtime.scoring,snapshot.runtime.source),snapshot.runtime.expected);
  const {analysisInput,skillExtraction,validationEvaluation,scoringPolicy}=snapshot.simulation.source;
  const scoringContext=prepareScoringContext(analysisInput,skillExtraction,validationEvaluation,parseScoringPolicy(scoringPolicy));
  const context=prepareRoadmapContext(snapshot.simulation.scoring,scoringContext,loadRoadmapPolicy(),loadResourceCatalog());
  const result=buildLearningRoadmap(context);assert.deepEqual(result,snapshot.simulation.expected);assert.deepEqual(validateRoadmapOutput(result,context),result);
  assert.equal(snapshot.runtime.expected.readinessScore,null);assert.equal(snapshot.simulation.expected.metadata.executionMode,"synthetic_simulation");
});
