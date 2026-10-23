import test from "node:test";
import assert from "node:assert/strict";
import { buildAnswerPrompt, MAX_VALIDATION_PROMPT_BYTES } from "@/lib/ai/validation/answer-prompt";
import { validateAnswerOutput } from "@/lib/ai/validation/answer-output-validator";
import { validationEvaluationResultSchema } from "@/types/validation-evaluation";
import { fixture, modelResponse } from "./fixtures";
import { aiInput, withFiles, mockProvider as extractionMock } from "../ai/fixtures";
import { extractSkillsFromAnalysisInput } from "@/lib/ai/skill-extraction-service";
import { buildQuestionContext } from "@/lib/ai/validation/question-context-builder";
import { createValidationQuestions } from "@/lib/ai/validation/question-catalog";
import { prepareValidationAnswers } from "@/lib/ai/validation/answer-preprocessor";

async function outputFixture() { const f = await fixture(); const prompt = buildAnswerPrompt(f.context, f.answers); return { ...f, prompt, output: modelResponse(prompt) }; }
test("prompt separates trusted rules from data and excludes CV/userId/analysisId", async () => {
  const f = await outputFixture();
  assert.ok(f.prompt.systemInstruction.includes("TRUSTED_RUBRIC"));
  assert.ok(f.prompt.contents.includes("UNTRUSTED_ANSWERS_AND_PROJECT_DATA"));
  for (const value of [f.input.userId, f.input.analysisId, '"cv"', '"userId"']) assert.ok(!f.prompt.contents.includes(value));
  assert.ok(Buffer.byteLength(JSON.stringify(f.prompt)) < MAX_VALIDATION_PROMPT_BYTES);
  assert.equal((f.prompt.responseJsonSchema as { type: string }).type, "object");
});
test("valid five evaluations produce exact deterministic answer subtotals and preserve order", async () => {
  const f = await outputFixture(); f.output.evaluations.reverse();
  const result = validateAnswerOutput(JSON.stringify(f.output), f.context, f.answers);
  assert.deepEqual(result.map(e => e.questionId), f.questions.map(q => q.questionId));
  assert.deepEqual(result[0].answerQuality, { score: 9, maxScore: 12, assessedDimensions: 3, configuredDimensions: 3 });
  assert.equal(result[1].answerQuality.maxScore, 8);
});
for (const scenario of ["four", "duplicate", "unknown-question", "wrong-answer", "bad-quote", "score-high", "score-negative", "max-score", "dimension-duplicate", "unconfigured-dimension", "fake-evidence", "fake-file", "wrong-path", "wrong-source", "fake-skill", "unmapped-skill", "readiness", "total", "ref-quote", "unsupported-claim", "html", "secret", "null-score"] as const) {
  test(`semantic output rejects ${scenario}`, async () => {
    const f = await outputFixture(); const first = f.output.evaluations[0];
    if (scenario === "four") f.output.evaluations.pop();
    if (scenario === "duplicate") f.output.evaluations[1] = structuredClone(first);
    if (scenario === "unknown-question") first.questionId = "77777777-7777-4777-8777-777777777777";
    if (scenario === "wrong-answer") first.answerRef = f.output.evaluations[1].answerRef;
    if (scenario === "bad-quote") first.answerQuote = "Klaim yang tidak pernah dijawab.";
    if (scenario === "score-high") first.dimensions[0].score = 5;
    if (scenario === "score-negative") first.dimensions[0].score = -1;
    if (scenario === "max-score") Object.assign(first.dimensions[0], { maxScore: 5 });
    if (scenario === "dimension-duplicate") first.dimensions[1] = structuredClone(first.dimensions[0]);
    if (scenario === "unconfigured-dimension") first.dimensions[1].dimensionId = "contribution_clarity";
    if (scenario === "fake-evidence") first.evidenceRefs[0].evidenceId = "77777777-7777-4777-8777-777777777777";
    if (scenario === "fake-file") first.evidenceRefs[0].fileRef = `file_${"f".repeat(24)}`;
    if (scenario === "wrong-path") first.evidenceRefs[0].filePath = "src/forged.ts";
    if (scenario === "wrong-source") first.evidenceRefs[0].evidenceId = f.input.analysisId;
    if (scenario === "fake-skill") first.relatedSkillIds = ["123"];
    if (scenario === "unmapped-skill") f.output.evaluations[1].relatedSkillIds = first.relatedSkillIds;
    if (scenario === "readiness") Object.assign(f.output, { readinessScore: 90 });
    if (scenario === "total") Object.assign(first, { totalScore: 12 });
    if (scenario === "ref-quote") first.evidenceRefs[0].quote = "code that is not present";
    if (scenario === "unsupported-claim") first.feedback = "Pengguna terbukti penulis kode dan menguasai TypeScript.";
    if (scenario === "html") first.feedback = '<img src=x onerror="alert(1)">';
    if (scenario === "secret") first.feedback = 'password="synthetic-private"';
    if (scenario === "null-score") first.dimensions[0].score = null;
    assert.throws(() => validateAnswerOutput(JSON.stringify(f.output), f.context, f.answers));
  });
}
test("malformed, empty, oversized or provider-blocked text cannot become scores", async () => {
  const f = await outputFixture();
  for (const text of ["", "not-json", "{}", "x".repeat(65537), JSON.stringify({ blocked: true })]) assert.throws(() => validateAnswerOutput(text, f.context, f.answers));
});
test("contribution claims cannot become verified authorship and contradiction requires concrete refs", async () => {
  const f = await outputFixture(); f.output.evaluations[1].evidenceAlignment = "supported";
  assert.throws(() => validateAnswerOutput(JSON.stringify(f.output), f.context, f.answers));
  const fresh = await outputFixture(); fresh.output.evaluations[0].evidenceAlignment = "contradicted";
  fresh.output.evaluations[0].evidenceRefs = [];
  assert.throws(() => validateAnswerOutput(JSON.stringify(fresh.output), fresh.context, fresh.answers));
});
test("absence of evidence remains not_assessable rather than zero; consistency rules enforced", async () => {
  const f = await outputFixture(); const first = f.output.evaluations[0];
  first.evidenceAlignment = "insufficient_evidence"; first.evidenceRefs = [];
  assert.throws(() => validateAnswerOutput(JSON.stringify(f.output), f.context, f.answers));
  Object.assign(first.dimensions[2], { status: "not_assessable", score: null });
  const result = validateAnswerOutput(JSON.stringify(f.output), f.context, f.answers);
  assert.equal(result[0].answerQuality.score, 6); assert.equal(result[0].answerQuality.maxScore, 8);
  assert.equal(result[0].dimensions[2].score, null);
});
test("final result schema rejects inconsistent subtotals", async () => {
  const f = await outputFixture(); const evaluations = validateAnswerOutput(JSON.stringify(f.output), f.context, f.answers);
  evaluations[0].answerQuality.score = 12;
  assert.equal(validationEvaluationResultSchema.safeParse({ analysisId: f.input.analysisId, status: "completed", model: "mock",
    promptVersion: "buktiva-validation-1.0.0", rubricVersion: "1.0.0", datasetVersion: f.extraction.datasetVersion,
    evaluations, competencies: [], coverage: f.extraction.coverage, extractionWarnings: [], warnings: [] }).success, false);
});
test("feedback cannot smuggle numeric competence levels or final scores", async () => {
  for (const feedback of ["Final competency level: 4", "Skill level 5", "Final score: 90", "Tingkat kompetensi 4"]) {
    const f = await outputFixture(); f.output.evaluations[0].feedback = feedback;
    assert.throws(() => validateAnswerOutput(JSON.stringify(f.output), f.context, f.answers));
  }
});
test("prompt byte limit includes repeated M4 citations and schema, not only source content", async () => {
  const input = withFiles(aiInput(), Array.from({ length: 8 }, (_, i) => ({ path: `src/file${i}.ts`, content: `//${"\\".repeat(6000)}\n` })));
  input.benchmarks = Array.from({ length: 32 }, (_, i) => ({ ...input.benchmarks[0], skillId: String(1000 + i), benchmarkId: String(2000 + i) }));
  const provider = extractionMock();
  const extraction = await extractSkillsFromAnalysisInput(input, { provider: provider.provider });
  const questions = createValidationQuestions(input.analysisId);
  const context = buildQuestionContext(input, extraction, questions);
  const refs = context.prepared.index.slice(0, 2).map(file => ({ evidenceId: file.evidenceId, fileRef: file.fileRef, filePath: file.filePath, quote: file.content.slice(0, 400) }));
  extraction.skills.forEach(skill => { skill.evidenceRefs = refs; skill.reason = "Bukti."; });
  const largeContext = buildQuestionContext(input, extraction, questions);
  const answers = prepareValidationAnswers({ analysisId: input.analysisId, questions, answers: questions.map(q => ({ questionId: q.questionId, answerText: "T." })) }, input.analysisId);
  assert.throws(() => buildAnswerPrompt(largeContext, answers), /PROMPT_LIMIT_EXCEEDED/);
});
