import assert from "node:assert/strict";
import test from "node:test";
import { resolveRubrics,validateRubricDataset } from "@/lib/ai/rubric-dataset";
import { ExtractionError } from "@/lib/ai/extraction-errors";
import { aiInput } from "./fixtures";

test("local dataset is valid, versioned and explicitly not an official benchmark",()=>{
  const dataset=validateRubricDataset();
  assert.equal(dataset.manifest.datasetVersion,"buktiva-local-rubrics-1.0.0");
  assert.equal(dataset.manifest.scope,"local-evidence-rubric");
  assert.equal(dataset.manifest.references.length,0);
});
test("rubric mapping preserves only official IDs from AnalysisInput",()=>{
  const input=aiInput();const result=resolveRubrics(input);
  assert.equal(result.skills[0].skillId,input.benchmarks[0].skillId);
  assert.equal(result.skills[0].rubric.key,"typescript");
  assert.equal("skillId" in result.skills[0].rubric,false);
});
test("unsupported role does not silently use frontend rubric",()=>{
  const input=aiInput();input.targetRole.slug="backend-developer";
  assert.throws(()=>resolveRubrics(input),e=>e instanceof ExtractionError&&e.code==="ROLE_NOT_SUPPORTED");
});
test("missing rubric rejects unknown official skill names without fabricating IDs",()=>{
  const input=aiInput();input.benchmarks[0].skillName="Unknown internal skill";
  assert.throws(()=>resolveRubrics(input),e=>e instanceof ExtractionError&&e.code==="RUBRIC_NOT_FOUND");
});
test("invalid version and ambiguous aliases are rejected",()=>{
  const dataset=validateRubricDataset();
  assert.throws(()=>validateRubricDataset({...dataset.rubrics,version:"bad"},dataset.manifest));
  dataset.rubrics.roles[0].rubrics[1].aliases.push("TypeScript");
  assert.throws(()=>validateRubricDataset(dataset.rubrics,dataset.manifest));
});
test("dataset cannot expand the list of official benchmark skills",()=>{
  const input=aiInput();const dataset=validateRubricDataset();
  assert.ok(dataset.rubrics.roles[0].rubrics.length>input.benchmarks.length);
  assert.equal(resolveRubrics(input,dataset).skills.length,input.benchmarks.length);
});
