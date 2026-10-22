// Manual only. Do not import the provider or fixture until explicit opt-in.
if (process.env.BUKTIVA_RUN_LIVE_GEMINI_TEST !== "1") {
  console.log(JSON.stringify({ status: "LIVE_GENERATION_BLOCKED", reason: "OPT_IN_DISABLED" }));
} else if (!process.env.GEMINI_API_KEY?.trim() || !process.env.GEMINI_MODEL?.trim()) {
  console.log(JSON.stringify({ status: "LIVE_GENERATION_BLOCKED", reason: "CONFIGURATION_MISSING" }));
  process.exitCode = 1;
} else {
  const { aiInput } = await import("../tests/ai/fixtures");
  const { createGeminiSkillProvider } = await import("../src/lib/ai/gemini-skill-provider");
  const { extractSkillsFromAnalysisInput } = await import("../src/lib/ai/skill-extraction-service");
  const { skillExtractionResultSchema } = await import("../src/types/skill-extraction");
  // Synthetic fixture only; one attempt per model, at most two requests total.
  const run = async (model: string) => {
    const provider = createGeminiSkillProvider({ model, maxAttempts: 1 });
    const start = Date.now();
    const result = await extractSkillsFromAnalysisInput(aiInput(), { provider });
    const validated = skillExtractionResultSchema.safeParse(result).success;
    console.log(JSON.stringify({ model: provider.model, status: result.status,
      durationMs: Date.now() - start, validated,
      ...(result.error ? { error: result.error } : {}) }));
    return result;
  };
  let result = await run(process.env.GEMINI_MODEL.trim());
  const alternative = process.env.BUKTIVA_LIVE_GEMINI_ALTERNATIVE_MODEL?.trim();
  if (alternative && alternative !== process.env.GEMINI_MODEL.trim()
      && result.error?.providerStatus && [503, 504].includes(result.error.providerStatus)) {
    result = await run(alternative);
  }
  const success = result.status === "completed" || result.status === "partial";
  console.log(JSON.stringify({ status: success ? "LIVE_GENERATION_VERIFIED" : "LIVE_GENERATION_BLOCKED" }));
  if (!success) process.exitCode = 1;
}

export {};
