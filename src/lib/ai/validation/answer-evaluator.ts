import "server-only";
import type { SkillProvider } from "../gemini-skill-provider";
import { createGeminiSkillProvider } from "../gemini-skill-provider";
import { buildAnswerPrompt } from "./answer-prompt";
import type { QuestionEvaluationContext } from "./question-context-builder";
import type { PreparedAnswers } from "./answer-preprocessor";

/** Reuses M4 adapter: SDK, timeout, bounded retries, and no fabricated fallback. */
export async function evaluateAnswerModel(context: QuestionEvaluationContext, answers: PreparedAnswers, provider: SkillProvider = createGeminiSkillProvider()) {
  return provider.generate(buildAnswerPrompt(context, answers));
}
