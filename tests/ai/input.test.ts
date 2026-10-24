import { describe, it } from "node:test";
import assert from "node:assert";
import {
  normalizeAnalysisInput,
  verifyAnalysisSession,
} from "@/lib/ai/input-processor";

describe("Input Processor - 5 Answers Validation", () => {
  const validBaseInput = {
    analysisId: "analysis_001",
    targetRoleId: "frontend_developer",
    evidence: [
      { sourceType: "github", sourceId: "ev1", content: "React code" },
    ],
    validationAnswers: [], // Will be filled in each test
  };

  it("Should throw an error if answers are empty (Audit Finding)", () => {
    assert.throws(() => {
      normalizeAnalysisInput(validBaseInput);
    }, /There must be exactly 5 validation answers/);
  });

  it("Should throw an error if only the 5th question is answered (Audit Finding)", () => {
    const inputOnlyQ5 = {
      ...validBaseInput,
      validationAnswers: [{ questionId: 5, answer: "My answer" }],
    };

    assert.throws(() => {
      normalizeAnalysisInput(inputOnlyQ5);
    }, /There must be exactly 5 validation answers/);
  });

  it("Should pass if all 5 answers are provided", () => {
    const completeInput = {
      ...validBaseInput,
      validationAnswers: [
        { questionId: 1, answer: "Answer 1" },
        { questionId: 2, answer: "Answer 2" },
        { questionId: 3, answer: "Answer 3" },
        { questionId: 4, answer: "Answer 4" },
        { questionId: 5, answer: "Answer 5" },
      ],
    };

    const result = normalizeAnalysisInput(completeInput);
    assert.strictEqual(result.validationAnswers.length, 5);
    assert.strictEqual(result.analysisId, "analysis_001");
  });
});

describe("Input Processor - Preventing State Leakage (Audit Finding #2)", () => {
  it("Should reject if analysisId does not match (old session data)", () => {
    const activeSessionId = "new_analysis_123";
    const oldSessionData = {
      analysisId: "old_analysis_999",
      targetRoleId: "frontend_developer",
    };

    const result = verifyAnalysisSession(activeSessionId, oldSessionData);

    assert.strictEqual(result.isValid, false);
    assert.match(result.reason || "", /Data mismatch!/);
  });

  it("Should accept if analysisId matches", () => {
    const activeSessionId = "new_analysis_123";
    const newSessionData = {
      analysisId: "new_analysis_123",
      targetRoleId: "frontend_developer",
    };

    const result = verifyAnalysisSession(activeSessionId, newSessionData);

    assert.strictEqual(result.isValid, true);
  });
});
