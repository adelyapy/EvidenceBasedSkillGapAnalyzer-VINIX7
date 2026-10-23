import test from "node:test";
import assert from "node:assert/strict";
import rubricFile from "@/data/ai/validation-rubrics.json";
import { buildQuestionContext } from "@/lib/ai/validation/question-context-builder";
import { loadValidationRubrics } from "@/lib/ai/validation/rubrics";
import { fixture } from "./fixtures";
import { extractSkillsFromAnalysisInput } from "@/lib/ai/skill-extraction-service";
import { mockProvider as extractionMock } from "../ai/fixtures";

test("reviewed question mapping uses official skill IDs; reflection has no skill mapping", async () => {
  const f = await fixture(); assert.deepEqual(f.context.questions[0].relatedSkillIds, [f.input.benchmarks[0].skillId]);
  assert.deepEqual(f.context.questions[1].relatedSkillIds, []);
  const unmapped = await fixture(false, false); assert.ok(unmapped.context.questions.every(q => q.relatedSkillIds.length === 0));
});
test("partial coverage and all original evidence metadata remain intact", async () => {
  const f = await fixture(true); assert.equal(f.context.partial, true);
  assert.deepEqual(f.context.prepared.coverage, f.extraction.coverage);
  assert.equal(f.context.prepared.index[0].evidenceId, f.input.evidences[0].evidenceId);
});
test("two repositories with identical paths retain distinct file references and origins", async () => {
  const f = await fixture(); const second = structuredClone(f.input.evidences[0]);
  if (!("normalizedProject" in second)) throw new Error("fixture");
  second.evidenceId = "66666666-6666-4666-8666-666666666666";
  second.sourceReference = second.normalizedProject.sourceReference = "https://github.com/acme/second";
  f.input.evidences.push(second);
  const extraction = await extractSkillsFromAnalysisInput(f.input, { provider: extractionMock().provider });
  const context = buildQuestionContext(f.input, extraction, f.questions);
  assert.equal(new Set(context.prepared.index.map(e => e.fileRef)).size, 2);
  assert.equal(new Set(context.prepared.index.map(e => e.origin)).size, 2);
});
test("forged M4 evidence, coverage and warning metadata reject", async () => {
  for (const field of ["evidence", "coverage", "warning"] as const) {
    const f = await fixture();
    if (field === "evidence") f.extraction.skills[0].evidenceRefs[0].fileRef = `file_${"f".repeat(24)}`;
    if (field === "coverage") f.extraction.coverage.sentContentBytes++;
    if (field === "warning") f.extraction.warnings.push("INPUT_PARTIAL");
    assert.throws(() => buildQuestionContext(f.input, f.extraction, f.questions));
  }
});
test("foreign analysis M4 and unreviewed/fictitious mapping reject", async () => {
  const f = await fixture(); f.extraction.analysisId = "77777777-7777-4777-8777-777777777777";
  assert.throws(() => buildQuestionContext(f.input, f.extraction, f.questions));
  f.extraction.analysisId = f.input.analysisId;
  assert.throws(() => buildQuestionContext(f.input, f.extraction, f.questions, { reviewedMapping: [{ order: 1, skillIds: ["123"], provenance: "reviewed-server-mapping" }] }));
  assert.throws(() => buildQuestionContext(f.input, f.extraction, f.questions, { reviewedMapping: [{ order: 2, skillIds: [f.input.benchmarks[0].skillId], provenance: "reviewed-server-mapping" }] }));
});
test("rubric is versioned, proposed, unweighted and exactly aligned with question purposes", () => {
  const rubric = loadValidationRubrics(); assert.equal(rubric.version, "1.0.0"); assert.equal(rubric.approvalStatus, "mvp_proposed");
  assert.ok(rubric.dimensions.every(d => d.minScore === 0 && d.maxScore === 4 && d.levels.length === 5));
  assert.equal(rubric.questions[1].dimensions.includes("technical_accuracy"), false);
});
test("missing rubric, bad scale, duplicate dimensions, fabricated weights and mismatched version reject", async () => {
  for (const value of [null, {}, { ...rubricFile, version: "2.0.0" }, { ...rubricFile, weights: [0.3, 0.7] },
    { ...rubricFile, dimensions: rubricFile.dimensions.map(d => ({ ...d, maxScore: 5 })) },
    { ...rubricFile, questions: rubricFile.questions.map(q => ({ ...q, dimensions: ["relevance", "relevance"] })) }]) assert.throws(() => loadValidationRubrics(value));
  const f = await fixture(); f.extraction.datasetVersion = "wrong-version";
  assert.throws(() => buildQuestionContext(f.input, f.extraction, f.questions));
});
