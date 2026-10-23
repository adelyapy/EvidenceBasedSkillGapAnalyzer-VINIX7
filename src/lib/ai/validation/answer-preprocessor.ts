import "server-only";
import { createHash } from "node:crypto";
import { validationSubmissionSchema } from "@/types/validation-evaluation";
import { containsPossibleSecret } from "@/lib/ingestion/file-filter";
import { containsPersonalData, containsPromptInjection, normalizeNewlines } from "../evidence-preparer";
import { createValidationQuestions } from "./question-catalog";
import { ValidationError } from "./errors";

export function isUnsafeText(text: string) {
  return containsPossibleSecret(text) || containsPersonalData(text) || containsPromptInjection(text) ||
    /[\x00-\x08\x0b\x0c\x0e-\x1f\x7f\u202a-\u202e\u2066-\u2069\ud800-\udfff]/u.test(text);
}
export function prepareValidationAnswers(raw: unknown, analysisId: string, privateIds: string[] = []) {
  const parsed = validationSubmissionSchema.safeParse(raw);
  if (!parsed.success) throw new ValidationError("INVALID_SUBMISSION");
  const submission = parsed.data;
  if (submission.analysisId !== analysisId) throw new ValidationError("ANALYSIS_MISMATCH");
  const questions = createValidationQuestions(analysisId);
  for (const question of submission.questions) {
    const official = questions.find(q => q.questionId === question.questionId);
    if (!official || official.order !== question.order || official.questionText !== question.questionText || question.evidenceContext !== undefined) {
      throw new ValidationError("UNTRUSTED_QUESTION");
    }
  }
  const answers = questions.map(question => {
    const rawAnswer = submission.answers.find(answer => answer.questionId === question.questionId)!;
    const answerText = normalizeNewlines(rawAnswer.answerText).trim();
    if (isUnsafeText(answerText) || [analysisId, ...privateIds].some(id => answerText.includes(id))) throw new ValidationError("UNSAFE_ANSWER");
    const answerRef = `answer_${createHash("sha256").update(JSON.stringify([question.questionId, answerText])).digest("hex").slice(0, 24)}`;
    return { questionId: question.questionId, answerText, answerRef };
  });
  return { analysisId, questions, answers };
}
export type PreparedAnswers = ReturnType<typeof prepareValidationAnswers>;
