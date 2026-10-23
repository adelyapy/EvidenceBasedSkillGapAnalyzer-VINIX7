import test from "node:test";
import assert from "node:assert/strict";
import draftFile from "@/data/scoring/scoring-policy.draft.json";
import { loadScoringPolicy, parseScoringPolicy } from "@/lib/scoring/scoring-policy";
import { syntheticPolicy } from "./fixtures";

test("runtime policy is pinned draft with five proposed indicators per local skill, no approved mapping or method", () => {
  const policy = loadScoringPolicy(); assert.equal(policy.policyStatus, "draft"); assert.equal(policy.approvalMetadata, null);
  assert.equal(policy.levelIndicators.length, 10); assert.ok(policy.levelIndicators.every(i => i.descriptions.length === 5 && !i.levelRules.length));
  assert.equal(policy.readinessCalculationMethod, "disabled"); assert.deepEqual(loadScoringPolicy(structuredClone(draftFile)), policy);
});
test("synthetic approved policy is valid but cannot be installed in runtime", () => {
  const policy = syntheticPolicy(); assert.equal(parseScoringPolicy(policy).scope, "synthetic_test");
  assert.throws(() => loadScoringPolicy(policy), /UNTRUSTED_POLICY/);
});
for (const change of ["version", "role", "approval", "wrong-approved-version", "zero-weight", "negative-weight", "duplicate-weight", "no-weights", "missing-indicator", "duplicate-indicator", "duplicate-mapping", "extra-field"] as const) {
  test(`invalid policy rejects ${change}`, () => {
    const raw = structuredClone(syntheticPolicy()) as unknown as Record<string, unknown>;
    if (change === "version") delete raw.policyVersion;
    if (change === "role") raw.supportedRole = "backend-developer";
    if (change === "approval") raw.approvalMetadata = null;
    if (change === "wrong-approved-version") Object.assign(raw.approvalMetadata!, { approvedPolicyVersion: "9.9.9" });
    if (change === "zero-weight") raw.readinessWeights = [{ skillId: "123", weight: 0 }];
    if (change === "negative-weight") raw.readinessWeights = [{ skillId: "123", weight: -1 }];
    if (change === "duplicate-weight") raw.readinessWeights = [{ skillId: "123", weight: 1 }, { skillId: "123", weight: 1 }];
    if (change === "no-weights") raw.readinessWeights = [];
    if (change === "missing-indicator") raw.levelIndicators = [{ skillKey: "typescript", descriptions: ["Only one level"], levelRules: [] }];
    if (change === "duplicate-indicator") raw.levelIndicators = [syntheticPolicy().levelIndicators[0], syntheticPolicy().levelIndicators[0]];
    if (change === "duplicate-mapping") raw.validationRequirements = { ...syntheticPolicy().validationRequirements, questionSkillMapping: [{ order: 1, skillIds: ["123"] }, { order: 1, skillIds: ["123"] }] };
    if (change === "extra-field") raw.approveFromRequest = true;
    assert.throws(() => parseScoringPolicy(raw), /INVALID_POLICY/);
  });
}
test("forged human approval metadata and changed draft rules are not a trusted registry entry", () => {
  const raw = syntheticPolicy(); raw.scope = "production"; raw.approvalMetadata!.kind = "human_review";
  assert.throws(() => loadScoringPolicy(raw), /UNTRUSTED_POLICY/);
  const draft = loadScoringPolicy(); draft.coverageRequirements.minimumSkillRatio = 0;
  assert.throws(() => loadScoringPolicy(draft), /UNTRUSTED_POLICY/);
});
