import {
  AnalysisInput,
  EvidenceInput,
  ValidationAnswerInput,
} from "@/types/ai";

const MAX_CONTENT_LENGTH = 15000;
const REQUIRED_QUESTIONS_COUNT = 5;

export function normalizeAnalysisInput(rawInput: any): AnalysisInput {
  const errors: string[] = [];

  if (!rawInput.analysisId) errors.push("analysisId is required.");
  if (!rawInput.targetRoleId) errors.push("targetRoleId is required.");

  const cleanedEvidence: EvidenceInput[] = [];
  if (!Array.isArray(rawInput.evidence) || rawInput.evidence.length === 0) {
    errors.push("At least 1 evidence is required.");
  } else {
    rawInput.evidence.forEach((ev: any, index: number) => {
      if (!ev.content || ev.content.trim() === "") {
        errors.push(`Evidence at index ${index} is empty.`);
        return;
      }

      let cleanContent = ev.content.trim().replace(/\s+/g, " ");
      if (cleanContent.length > MAX_CONTENT_LENGTH) {
        cleanContent =
          cleanContent.substring(0, MAX_CONTENT_LENGTH) + "... [TRUNCATED]";
      }

      cleanedEvidence.push({
        sourceType: ev.sourceType || "github",
        sourceId: ev.sourceId || `ev_${index}`,
        content: cleanContent,
      });
    });
  }

  const cleanedAnswers: ValidationAnswerInput[] = [];
  if (
    !Array.isArray(rawInput.validationAnswers) ||
    rawInput.validationAnswers.length !== REQUIRED_QUESTIONS_COUNT
  ) {
    errors.push(
      `There must be exactly ${REQUIRED_QUESTIONS_COUNT} validation answers.`,
    );
  } else {
    rawInput.validationAnswers.forEach((ans: any) => {
      if (!ans.answer || ans.answer.trim() === "") {
        errors.push(`Answer for question ID ${ans.questionId} is empty.`);
      } else {
        cleanedAnswers.push({
          questionId: ans.questionId,
          answer: ans.answer.trim(),
        });
      }
    });
  }

  if (errors.length > 0) {
    throw new Error(`Input Validation Failed: ${errors.join(" | ")}`);
  }

  return {
    analysisId: rawInput.analysisId,
    targetRoleId: rawInput.targetRoleId,
    evidence: cleanedEvidence,
    validationAnswers: cleanedAnswers,
  };
}

export function verifyAnalysisSession(
  currentAnalysisId: string,
  incomingData: any,
): { isValid: boolean; reason?: string } {
  // 1. Ensure ID is not empty
  if (!currentAnalysisId) {
    return { isValid: false, reason: "Active Analysis ID is missing." };
  }

  // 2. Check if incoming data ID matches the active session
  if (incomingData.analysisId !== currentAnalysisId) {
    return {
      isValid: false,
      reason: `Data mismatch! Incoming data belongs to ID ${incomingData.analysisId}, but active session is ${currentAnalysisId}.`,
    };
  }

  return { isValid: true };
}
