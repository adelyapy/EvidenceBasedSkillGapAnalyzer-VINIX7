import { validateAIOutput } from "./validation/ai-output-validator";

export interface FrontendSkillPayload {
  skillId: string;
  level: number;
  confidence: number;
  reason: string;
  uiBadgeColor: "red" | "yellow" | "green";
}

export interface FrontendResponsePayload {
  analysisId: string;
  status: "completed" | "partial" | "failed";
  processedAt: string;
  skills: FrontendSkillPayload[];
  validationPassed: boolean;
  errorMessage?: string;
}

export function formatResponseForFrontend(
  rawGeminiResponse: unknown,
): FrontendResponsePayload {
  const defaultFailureResponse: FrontendResponsePayload = {
    analysisId: "unknown",
    status: "failed",
    processedAt: new Date().toISOString(),
    skills: [],
    validationPassed: false,
    errorMessage: "Failed to process AI output due to an unknown error.",
  };

  try {
    const validatedData = validateAIOutput(rawGeminiResponse);

    const mappedSkills: FrontendSkillPayload[] = validatedData.skills.map(
      (skill) => {
        let badgeColor: "red" | "yellow" | "green" = "red";
        if (skill.level >= 3) badgeColor = "green";
        else if (skill.level === 2) badgeColor = "yellow";

        return {
          ...skill,
          uiBadgeColor: badgeColor,
        };
      },
    );

    return {
      analysisId: validatedData.analysisId,
      status: validatedData.skills.length > 0 ? "completed" : "partial",
      processedAt: new Date().toISOString(),
      skills: mappedSkills,
      validationPassed: validatedData.validationPassed,
    };
  } catch (error) {
    console.error("[Formatter] Error formatting AI output:", error);
    return {
      ...defaultFailureResponse,
      errorMessage:
        error instanceof Error ? error.message : "Invalid AI Output structure.",
    };
  }
}
