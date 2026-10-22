import test from "node:test";
import assert from "node:assert/strict";
import casesFile from "./golden-cases.json";
import { fixture, mockProvider } from "./fixtures";
import { evaluateValidationAnswers } from "@/lib/ai/validation/validation-service";
import type { ModelQuestionEvaluation } from "@/types/validation-evaluation";

// Independently hand-authored mock responses, not a live model prediction or evaluation accuracy metric.
const responses: Record<string, { alignment: ModelQuestionEvaluation["evidenceAlignment"]; scores: (number|null)[] }> = {
  strong: { alignment: "supported", scores: [4, 4, 4] },
  weak: { alignment: "insufficient_evidence", scores: [1, null, null] },
  irrelevant: { alignment: "insufficient_evidence", scores: [0, null, null] },
  contradicted: { alignment: "contradicted", scores: [3, 0, 0] },
};
for (const golden of casesFile.cases) {
  test(`golden ${golden.id}: reviewed fixture passes provenance/rubric checks, without claiming live judgment accuracy`, async () => {
    const f = await fixture(); f.submission.answers[2].answerText = golden.answerText;
    const response = responses[golden.id];
    const mock = mockProvider(output => {
      const evaluation = output.evaluations[2]; evaluation.evidenceAlignment = response.alignment;
      evaluation.dimensions.forEach((d, i) => { d.score = response.scores[i]; d.status = d.score === null ? "not_assessable" : "assessed"; });
      if (response.alignment === "insufficient_evidence") evaluation.evidenceRefs = [];
      evaluation.feedback = response.alignment === "contradicted" ? "Klaim konversi menjadi string bertentangan dengan return value pada kutipan kode." : "Kualitas penjelasan dinilai menurut tujuan pertanyaan dan batas bukti.";
      return output;
    });
    const result = await evaluateValidationAnswers(f.input, f.extraction, f.submission, { provider: mock.provider, reviewedMapping: f.reviewedMapping });
    assert.ok(["completed", "partial"].includes(result.status));
    const evaluation = result.evaluations[2]; assert.equal(evaluation.evidenceAlignment, golden.expected.alignment);
    assert.deepEqual(evaluation.dimensions.map(d => d.score), golden.expected.scores);
    assert.equal(result.competencies[0].status, golden.id === "strong" ? "validation_supported" : golden.id === "contradicted" ? "contradicted" : "needs_review");
    assert.ok(!Object.hasOwn(result.competencies[0], "level"));
    if (golden.id === "contradicted") assert.ok(result.competencies[0].evidenceRefs.length > 0);
  });
}
test("a single supported answer is needs_review rather than evidence of a high skill level", async () => {
  const f = await fixture();
  const result = await evaluateValidationAnswers(f.input, f.extraction, f.submission, { provider: mockProvider().provider, reviewedMapping: [f.reviewedMapping[0]] });
  assert.equal(result.competencies[0].status, "needs_review"); assert.equal(result.competencies[0].questionIds.length, 1);
});
test("all linked answers without evidence are insufficient, not a low numeric skill level", async () => {
  const f = await fixture(); const mock = mockProvider(output => {
    for (const e of output.evaluations) {
      e.evidenceAlignment = "insufficient_evidence"; e.evidenceRefs = [];
      for (const d of e.dimensions) if (d.dimensionId === "evidence_consistency") { d.status = "not_assessable"; d.score = null; }
    }
    return output;
  });
  const result = await evaluateValidationAnswers(f.input, f.extraction, f.submission, { provider: mock.provider, reviewedMapping: f.reviewedMapping });
  assert.equal(result.status, "partial"); assert.equal(result.competencies[0].status, "insufficient_evidence");
  assert.ok(result.evaluations.every(e => e.dimensions.every(d => d.dimensionId !== "evidence_consistency" || d.score === null)));
});
