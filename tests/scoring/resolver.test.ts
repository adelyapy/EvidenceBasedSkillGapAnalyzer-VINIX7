import test from "node:test";
import assert from "node:assert/strict";
import { scoringFixture, simulate } from "./fixtures";
import { calculateCompetencyGaps } from "@/lib/scoring/competency-scoring-service";
import { prepareScoringContext } from "@/lib/scoring/scoring-context";
import { resolveRequiredLevel } from "@/lib/scoring/competency-level-resolver";

test("draft never promotes validation_supported to a numeric skill level", async () => {
  const f = await scoringFixture(); assert.equal(f.validation.competencies[0].status, "validation_supported");
  const result = calculateCompetencyGaps(f.input, f.extraction, f.validation);
  assert.equal(result.skills[0].currentLevel, null); assert.equal(result.skills[0].gapScore, null);
  assert.equal(result.scoringStatus, "policy_pending_approval"); assert.equal(result.readinessScore, null);
});
test("synthetic exact indicator and linked validation resolve level two; answer average is not used", async () => {
  const f = await scoringFixture(); const result = simulate(f);
  assert.equal(result.skills[0].currentLevel, 2); assert.equal(result.skills[0].gapScore, 1);
  assert.equal(result.calculationMetadata.executionMode, "synthetic_simulation");
  assert.equal(result.readinessScore, 66.67); assert.deepEqual(result.priorityGroups.learning, [f.input.benchmarks[0].skillId]);
});
test("explicit level zero rule can match, while missing source always remains null", async () => {
  const zero = await scoringFixture({ content: "export const zeroFixture = true;\n" });
  assert.equal(simulate(zero).skills[0].currentLevel, 0); assert.equal(simulate(zero).readinessScore, 0);
  const absent = await scoringFixture({ alignment: "insufficient_evidence" });
  assert.equal(simulate(absent).skills[0].currentLevel, null); assert.equal(simulate(absent).skills[0].gapScore, null);
});
test("partial input and needs_review retain null even with synthetic approved policy", async () => {
  const f = await scoringFixture({ partial: true }); const result = simulate(f);
  assert.equal(result.skills[0].assessmentStatus, "needs_review"); assert.equal(result.skills[0].currentLevel, null);
  assert.equal(result.scoringStatus, "partial"); assert.equal(result.readinessScore, null);
});
test("contradicted evidence routes manual review and never silently assigns zero", async () => {
  const f = await scoringFixture({ alignment: "contradicted" }); const result = simulate(f);
  assert.equal(result.skills[0].assessmentStatus, "contradictory_evidence"); assert.equal(result.skills[0].currentLevel, null);
  assert.deepEqual(result.priorityGroups.manualReview, [f.input.benchmarks[0].skillId]);
});
test("no mapping, unapproved mapping, or no level rule produces NOT_ASSESSABLE", async () => {
  const none = await scoringFixture({ mapped: false }); assert.equal(simulate(none).skills[0].currentLevel, null);
  const f = await scoringFixture(); f.policy.validationRequirements.mappingApproved = false;
  assert.equal(simulate(f).skills[0].currentLevel, null);
  f.policy.validationRequirements.mappingApproved = true; f.policy.levelIndicators[0].levelRules = [];
  assert.equal(simulate(f).skills[0].currentLevel, null);
});
test("required-level transport is explicit and never maps labels or percentages to 0–4", () => {
  assert.equal(resolveRequiredLevel("3"), 3); assert.equal(resolveRequiredLevel(0), 0);
  for (const raw of ["advanced", "03", "3.0", " 3", "80", 80, 1.5]) assert.equal(resolveRequiredLevel(raw), null);
});
test("foreign analysis, role and dataset/rubric mismatches reject", async () => {
  const f = await scoringFixture(); const other = "77777777-7777-4777-8777-777777777777";
  assert.throws(() => prepareScoringContext({ ...f.input, analysisId: other }, f.extraction, f.validation, f.policy), /ANALYSIS_MISMATCH/);
  assert.throws(() => prepareScoringContext(f.input, { ...f.extraction, datasetVersion: "bad" }, f.validation, f.policy), /VERSION_MISMATCH/);
  assert.throws(() => prepareScoringContext(f.input, f.extraction, { ...f.validation, rubricVersion: "bad" }, f.policy), /VERSION_MISMATCH/);
  assert.throws(() => prepareScoringContext({ ...f.input, targetRole: { ...f.input.targetRole, slug: "backend-developer" } }, f.extraction, f.validation, f.policy), /ROLE_MISMATCH/);
});
test("unknown skill IDs, forged evidence and fabricated M5 provisional status reject", async () => {
  for (const field of ["skill", "ref", "status"] as const) {
    const f = await scoringFixture();
    if (field === "skill") f.extraction.skills[0].skillId = "123";
    if (field === "ref") f.validation.evaluations[0].evidenceRefs[0].fileRef = `file_${"f".repeat(24)}`;
    if (field === "status") f.validation.competencies[0].status = "contradicted";
    assert.throws(() => prepareScoringContext(f.input, f.extraction, f.validation, f.policy), /INVALID_SNAPSHOT/);
  }
});
