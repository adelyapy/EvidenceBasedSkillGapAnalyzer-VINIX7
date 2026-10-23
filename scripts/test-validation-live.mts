// Manual synthetic diagnostic only. This file is never invoked by offline tests/build/install.
if (process.env.BUKTIVA_RUN_LIVE_VALIDATION_TEST !== "1") {
  console.log(JSON.stringify({ status: "LIVE_VALIDATION_NOT_RUN", reason: "OPT_IN_DISABLED" }));
} else if (!process.env.GEMINI_API_KEY?.trim() || !process.env.GEMINI_MODEL?.trim()) {
  console.log(JSON.stringify({ status: "LIVE_VALIDATION_NOT_RUN", reason: "CONFIGURATION_MISSING" }));
  process.exitCode = 1;
} else {
  // fixture() uses a TEST-ONLY mocked M4 snapshot. Only M5 evaluation calls the live model.
  const { fixture } = await import("../tests/validation/fixtures");
  const { createGeminiSkillProvider } = await import("../src/lib/ai/gemini-skill-provider");
  const { evaluateValidationAnswers } = await import("../src/lib/ai/validation/validation-service");
  const { validationEvaluationResultSchema } = await import("../src/types/validation-evaluation");
  const f = await fixture();
  const provider = createGeminiSkillProvider({ model: process.env.GEMINI_MODEL.trim(), maxAttempts: 1 });
  const start = Date.now();
  const result = await evaluateValidationAnswers(f.input, f.extraction, f.submission, { provider, reviewedMapping: f.reviewedMapping });
  const valid = validationEvaluationResultSchema.safeParse(result).success;
  const success = valid && (result.status === "completed" || result.status === "partial");
  console.log(JSON.stringify({ status: success ? "LIVE_VALIDATION_PASS" : "LIVE_VALIDATION_FAILED", model: provider.model,
    durationMs: Date.now() - start, validated: valid, evaluationStatus: result.status, m4Source: "SYNTHETIC_MOCK_SNAPSHOT",
    ...(result.error ? { error: result.error } : {}) }));
  if (!success) process.exitCode = 1;
}
export {};
