import "server-only";
import { modelValidationOutputSchema, questionEvaluationSchema, type QuestionEvaluation } from "@/types/validation-evaluation";
import { MAX_MODEL_RESPONSE_BYTES } from "../skill-output-validator";
import { normalizeNewlines } from "../evidence-preparer";
import type { QuestionEvaluationContext } from "./question-context-builder";
import { isUnsafeText, type PreparedAnswers } from "./answer-preprocessor";
import { ValidationError } from "./errors";

function reject(): never { throw new ValidationError("INVALID_MODEL_OUTPUT"); }
export function unsafeFeedback(text: string, privateIds: string[]) {
  return isUnsafeText(text) || privateIds.some(id => text.includes(id)) ||
    /<\/?[a-z][^>]*>|javascript:|https?:\/\/|data:text|readiness|roadmap|skill[ _-]?gap|\b(?:mastered|expert|mahir|menguasai|terbukti\s+penulis|verified\s+author)\b|(?:level|tingkat)\s+(?:kompetensi|skill|competency)|\b(?:competency|skill)\s+level\b|\bfinal\s+score\b|skor\s+(?:akhir|kesiapan)|\b\d{1,3}\s*%/i.test(text);
}
export function validateAnswerOutput(raw: string, context: QuestionEvaluationContext, answers: PreparedAnswers): QuestionEvaluation[] {
  if (typeof raw !== "string" || !raw.trim() || Buffer.byteLength(raw) > MAX_MODEL_RESPONSE_BYTES) return reject();
  let json: unknown;
  try { json = JSON.parse(raw); } catch { return reject(); }
  const parsed = modelValidationOutputSchema.safeParse(json);
  if (!parsed.success) return reject();
  const evaluations = parsed.data.evaluations;
  if (new Set(evaluations.map(e => e.questionId)).size !== 5) return reject();
  const results: QuestionEvaluation[] = [];
  for (const question of context.questions) {
    const evaluation = evaluations.find(e => e.questionId === question.questionId);
    const answer = answers.answers.find(a => a.questionId === question.questionId);
    if (!evaluation || !answer || evaluation.answerRef !== answer.answerRef || !answer.answerText.includes(normalizeNewlines(evaluation.answerQuote))) return reject();
    if (new Set(evaluation.relatedSkillIds).size !== evaluation.relatedSkillIds.length ||
        JSON.stringify([...evaluation.relatedSkillIds].sort()) !== JSON.stringify([...question.relatedSkillIds].sort()) ||
        new Set(evaluation.dimensions.map(d => d.dimensionId)).size !== question.rubric.dimensions.length ||
        evaluation.dimensions.length !== question.rubric.dimensions.length ||
        evaluation.dimensions.some(d => !question.rubric.dimensions.includes(d.dimensionId))) return reject();
    for (const text of [evaluation.feedback, ...evaluation.dimensions.map(d => d.reason)]) {
      if (unsafeFeedback(text, [context.input.userId, context.input.analysisId])) return reject();
    }
    const refs = new Set<string>();
    for (const reference of evaluation.evidenceRefs) {
      const entry = context.prepared.index.find(file => file.fileRef === reference.fileRef);
      const key = JSON.stringify([reference.evidenceId, reference.fileRef, normalizeNewlines(reference.quote)]);
      if (!entry || entry.evidenceId !== reference.evidenceId || entry.filePath !== reference.filePath ||
          !entry.content.includes(normalizeNewlines(reference.quote)) || refs.has(key)) return reject();
      refs.add(key);
    }
    if (evaluation.evidenceAlignment !== "insufficient_evidence" && !evaluation.evidenceRefs.length) return reject();
    if (question.order === 2 && evaluation.evidenceAlignment !== "insufficient_evidence") return reject();
    const consistency = evaluation.dimensions.find(d => d.dimensionId === "evidence_consistency");
    if (consistency && ((evaluation.evidenceAlignment === "insufficient_evidence" && consistency.status !== "not_assessable") ||
        (evaluation.evidenceAlignment !== "insufficient_evidence" && consistency.status !== "assessed") ||
        (evaluation.evidenceAlignment === "contradicted" && consistency.score! > 1) ||
        (evaluation.evidenceAlignment === "supported" && consistency.score! < 2))) return reject();
    const assessed = evaluation.dimensions.filter(d => d.status === "assessed");
    results.push(questionEvaluationSchema.parse({ ...evaluation, answerQuote: normalizeNewlines(evaluation.answerQuote),
      evidenceRefs: evaluation.evidenceRefs.map(ref => ({ ...ref, quote: normalizeNewlines(ref.quote) })).sort((a, b) => a.fileRef.localeCompare(b.fileRef) || a.quote.localeCompare(b.quote)),
      dimensions: question.rubric.dimensions.map(id => evaluation.dimensions.find(d => d.dimensionId === id)!),
      relatedSkillIds: [...question.relatedSkillIds].sort(),
      answerQuality: { score: assessed.length ? assessed.reduce((sum, d) => sum + d.score!, 0) : null,
        maxScore: assessed.length * 4, assessedDimensions: assessed.length, configuredDimensions: evaluation.dimensions.length },
    }));
  }
  return results;
}
