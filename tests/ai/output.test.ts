import { describe, it } from "node:test";
import assert from "node:assert";
import { validateAIOutput } from "@/lib/ai/validation/ai-output-validator";

describe("AI Output Validator - Preventing Gemini Hallucinations", () => {
  const validPayload = {
    analysisId: "analysis_001",
    skills: [
      {
        skillId: "react",
        level: 3,
        confidence: 0.85,
        reason: "Uses hooks and state effectively",
        evidenceRefs: ["ev_1"],
      },
    ],
    validationPassed: true,
  };

  it("Should PASS if Gemini output is valid", () => {
    const result = validateAIOutput(validPayload);
    assert.strictEqual(result.skills.length, 1);
    assert.strictEqual(result.skills[0].skillId, "react");
  });

  it("Should FAIL if Level is out of bounds (e.g., 99)", () => {
    const invalidPayload = {
      ...validPayload,
      skills: [{ ...validPayload.skills[0], level: 99 }],
    };

    assert.throws(() => {
      validateAIOutput(invalidPayload);
    }, /Invalid AI Output/);
  });

  it("Should FAIL if Confidence is invalid (e.g., 1.5)", () => {
    const invalidPayload = {
      ...validPayload,
      skills: [{ ...validPayload.skills[0], confidence: 1.5 }],
    };

    assert.throws(() => {
      validateAIOutput(invalidPayload);
    }, /Invalid AI Output/);
  });

  it("Should FAIL if AI claims a skill not in the dataset", () => {
    const invalidPayload = {
      ...validPayload,
      skills: [{ ...validPayload.skills[0], skillId: "unknown_skill_123" }],
    };

    assert.throws(() => {
      validateAIOutput(invalidPayload);
    }, /Invalid AI Output/);
  });

  it("Should FAIL if AI provides no evidence references (hallucination)", () => {
    const invalidPayload = {
      ...validPayload,
      skills: [{ ...validPayload.skills[0], evidenceRefs: [] }],
    };

    assert.throws(() => {
      validateAIOutput(invalidPayload);
    }, /Invalid AI Output/);
  });
});
