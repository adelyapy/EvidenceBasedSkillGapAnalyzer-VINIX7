import { describe, it } from "node:test";
import assert from "node:assert";
import { evaluateGeminiResult } from "@/lib/ai/evaluation/evaluator";

describe("Evaluation Script - Comparing AI vs Ground Truth", () => {
  const groundTruth = {
    skills: [
      { skillId: "react", level: 3 },
      { skillId: "typescript", level: 3 },
    ],
  };

  it("Should PASS if AI output matches ground truth perfectly", () => {
    const aiOutput = {
      skills: [
        { skillId: "react", level: 3 },
        { skillId: "typescript", level: 3 },
      ],
    };

    const result = evaluateGeminiResult("eval_001", aiOutput, groundTruth);
    assert.strictEqual(result.passed, true);
    assert.strictEqual(result.matchRate, 1.0);
  });

  it("Should FAIL if AI misses a skill", () => {
    const aiOutput = {
      skills: [{ skillId: "react", level: 3 }],
    };

    const result = evaluateGeminiResult("eval_002", aiOutput, groundTruth);
    assert.strictEqual(result.passed, false);
    assert.ok(
      result.issues.some((i) => i.includes("Missing skill: typescript")),
    );
  });

  it("Should FAIL if AI hallucinates an extra skill", () => {
    const aiOutput = {
      skills: [
        { skillId: "react", level: 3 },
        { skillId: "typescript", level: 3 },
        { skillId: "python", level: 2 },
      ],
    };

    const result = evaluateGeminiResult("eval_003", aiOutput, groundTruth);
    assert.strictEqual(result.passed, false);
    assert.ok(result.issues.some((i) => i.includes("Hallucination detected")));
  });

  it("Should FAIL if AI gets the level wrong", () => {
    const aiOutput = {
      skills: [
        { skillId: "react", level: 4 }, // Expected level 3
        { skillId: "typescript", level: 3 },
      ],
    };

    const result = evaluateGeminiResult("eval_004", aiOutput, groundTruth);
    assert.strictEqual(result.passed, false);

    // PERBAIKAN DI SINI: Sesuaikan dengan format teks dari evaluator.ts
    assert.ok(result.issues.some((i) => i.includes("Expected level 3, got 4")));
  });
});
