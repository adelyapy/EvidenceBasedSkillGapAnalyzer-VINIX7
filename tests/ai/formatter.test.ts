import { describe, it } from "node:test";
import assert from "node:assert";
import { formatResponseForFrontend } from "@/lib/ai/ai-result-formatter";

describe("AI Result Formatter - Frontend Preparation", () => {
  it("Should format valid data and assign correct UI badge colors", () => {
    const validData = {
      analysisId: "analysis_001",
      skills: [
        {
          skillId: "react",
          level: 3,
          confidence: 0.9,
          reason: "Good implementation of hooks and state",
          evidenceRefs: ["ev_1"],
        },
        {
          skillId: "css",
          level: 1,
          confidence: 0.5,
          reason: "Basic styling using flexbox",
          evidenceRefs: ["ev_1"],
        },
      ],
      validationPassed: true,
    };

    const result = formatResponseForFrontend(validData);

    assert.strictEqual(result.status, "completed");

    assert.strictEqual(result.skills.length, 2);

    assert.strictEqual(result.skills[0].uiBadgeColor, "green");
    assert.strictEqual(result.skills[1].uiBadgeColor, "red");
  });

  it("Should return partial status if no skills are found", () => {
    const emptyData = {
      analysisId: "analysis_002",
      skills: [],
      validationPassed: false,
    };

    const result = formatResponseForFrontend(emptyData);

    assert.strictEqual(result.status, "partial");
    assert.strictEqual(result.skills.length, 0);
  });

  it("Should catch validation errors and return a safe failure state", () => {
    const invalidData = {
      analysisId: "analysis_003",
      skills: [
        {
          skillId: "react",
          level: 99,
          confidence: 0.9,
          reason: "This reason is long enough",
          evidenceRefs: ["ev_1"],
        },
      ],
      validationPassed: true,
    };

    const result = formatResponseForFrontend(invalidData);

    assert.strictEqual(result.status, "failed");
    assert.strictEqual(result.analysisId, "unknown");
    assert.ok(result.errorMessage?.includes("Invalid AI Output"));
  });
});
