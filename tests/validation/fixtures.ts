import { aiInput, mockProvider as extractionMock, withFiles } from "../ai/fixtures";
import { extractSkillsFromAnalysisInput } from "@/lib/ai/skill-extraction-service";
import { createValidationQuestions } from "@/lib/ai/validation/question-catalog";
import { prepareValidationAnswers } from "@/lib/ai/validation/answer-preprocessor";
import { buildQuestionContext, type ReviewedQuestionMapping } from "@/lib/ai/validation/question-context-builder";
import type { SkillProvider, SkillProviderRequest } from "@/lib/ai/gemini-skill-provider";
import type { ValidationSubmission, ModelQuestionEvaluation } from "@/types/validation-evaluation";

/** Reviewed synthetic cases, not a real user's private answers. */
export const strongAnswers = [
  "Modul identity berupa fungsi murni generik, terpisah dari UI. Pemisahan ini menjaga logika mudah diuji tanpa efek samping.",
  "Saya mengklaim mengerjakan fungsi identity; bagian UI dikerjakan tim. Klaim kontribusi ini belum dibuktikan oleh repositori.",
  "TypeScript dipilih agar tipe T masukan dipertahankan pada keluaran fungsi identity. Kompilasi membantu memeriksa kontrak tipe.",
  "Kendala yang saya jelaskan adalah kehilangan informasi tipe. Parameter generik T menjaga hubungan tipe masukan dan keluaran.",
  "Tujuannya mengembalikan masukan tanpa perubahan. Contoh uji yang dapat dibuat adalah identity(7) menghasilkan 7; ini usulan uji, bukan klaim uji sudah dijalankan.",
];
export async function fixture(partial = false, mapped = true) {
  const input = partial ? withFiles(aiInput(), [{ path: "src/identity.ts", content: "export function identity<T>(value: T): T { return value; }\n" }], true) : aiInput();
  const extraction = await extractSkillsFromAnalysisInput(input, { provider: extractionMock().provider });
  const questions = createValidationQuestions(input.analysisId);
  const submission: ValidationSubmission = { analysisId: input.analysisId, questions,
    answers: questions.map((q, i) => ({ questionId: q.questionId, answerText: strongAnswers[i] })) };
  const reviewedMapping: ReviewedQuestionMapping = mapped ? [1, 3, 4, 5].map(order => ({ order, skillIds: [input.benchmarks[0].skillId], provenance: "reviewed-server-mapping" })) : [];
  const answers = prepareValidationAnswers(submission, input.analysisId, [input.userId]);
  const context = buildQuestionContext(input, extraction, questions, { reviewedMapping });
  return { input, extraction, questions, submission, reviewedMapping, answers, context };
}
type PromptPayload = { questions: { questionId: string; order: number; relatedSkillIds: string[]; dimensionIds: ModelQuestionEvaluation["dimensions"][number]["dimensionId"][] }[];
  answers: { questionId: string; answerRef: string; answerText: string }[];
  evidenceIndex: { evidenceId: string; fileRef: string; filePath: string; content: string }[] };
/** TEST ONLY: hand-authored expected responses. Never a production fallback. */
export function modelResponse(request: SkillProviderRequest): { evaluations: ModelQuestionEvaluation[] } {
  const payload = JSON.parse(request.contents) as PromptPayload;
  return { evaluations: payload.questions.map(question => {
    const answer = payload.answers.find(a => a.questionId === question.questionId)!;
    const file = payload.evidenceIndex[0];
    return { questionId: question.questionId, answerRef: answer.answerRef, answerQuote: answer.answerText.slice(0, 300),
      dimensions: question.dimensionIds.map(dimensionId => ({ dimensionId, status: "assessed", score: 3, maxScore: 4, reason: "Uraian menjawab tujuan pada konteks yang diberikan." })),
      evidenceAlignment: question.order === 2 ? "insufficient_evidence" : "supported", relatedSkillIds: question.relatedSkillIds,
      evidenceRefs: question.order === 2 ? [] : [{ evidenceId: file.evidenceId, fileRef: file.fileRef, filePath: file.filePath, quote: file.content.slice(0, 200) }],
      feedback: question.order === 2 ? "Batas kontribusi dijelaskan; kepengarangan belum dapat diverifikasi." : "Penjelasan merujuk implementasi yang tersedia, dengan batas verifikasi proyek.",
    };
  }) };
}
export function mockProvider(change?: (output: ReturnType<typeof modelResponse>) => unknown) {
  const requests: SkillProviderRequest[] = [];
  const provider: SkillProvider = { model: "mock-validation", async generate(request) {
    requests.push(request); const output = modelResponse(request);
    return { model: "mock-validation", text: JSON.stringify(change ? change(output) : output) };
  } };
  return { provider, requests };
}
