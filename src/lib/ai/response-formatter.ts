import { RawAIOutput, FormattedAIResult } from "@/types/ai";

export function formatResponseForFrontend(
  validatedData: RawAIOutput,
): FormattedAIResult {
  return {
    ...validatedData,
    status: validatedData.skills.length > 0 ? "completed" : "partial",
    processedAt: new Date().toISOString(),
  };
}
