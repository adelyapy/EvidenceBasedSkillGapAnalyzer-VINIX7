import { aiInput, withFiles, mockProvider as extractionMock } from "../ai/fixtures";
import { mockProvider, strongAnswers } from "../validation/fixtures";
import { extractSkillsFromAnalysisInput } from "@/lib/ai/skill-extraction-service";
import { evaluateValidationAnswers } from "@/lib/ai/validation/validation-service";
import { createValidationQuestions } from "@/lib/ai/validation/question-catalog";
import { parseScoringPolicy } from "@/lib/scoring/scoring-policy";
import { prepareScoringContext } from "@/lib/scoring/scoring-context";
import { buildScoringResult } from "@/lib/scoring/scoring-calculation";
import type { ValidationDependencies } from "@/lib/ai/validation/validation-service";
import type { ModelQuestionEvaluation } from "@/types/validation-evaluation";
import policyFile from "./synthetic-policy.fixture.json";

export function syntheticPolicy() { return parseScoringPolicy(structuredClone(policyFile)); }
export async function scoringFixture(options: { partial?: boolean; content?: string; mapped?: boolean; alignment?: ModelQuestionEvaluation["evidenceAlignment"]; dimensionScore?: number } = {}) {
  const input = withFiles(aiInput(), [{ path: "src/identity.ts", content: options.content ?? "export function identity<T>(value: T): T { return value; }\n" }], options.partial);
  const extraction = await extractSkillsFromAnalysisInput(input, { provider: extractionMock().provider });
  const questions = createValidationQuestions(input.analysisId);
  const submission = { analysisId: input.analysisId, questions, answers: questions.map((q, i) => ({ questionId: q.questionId, answerText: strongAnswers[i] })) };
  const reviewedMapping: ValidationDependencies["reviewedMapping"] = options.mapped === false ? [] : [1,3,4,5].map(order => ({ order, skillIds: input.benchmarks.map(b => b.skillId), provenance: "reviewed-server-mapping" }));
  const provider = mockProvider(output => {
    if (options.dimensionScore !== undefined) for (const evaluation of output.evaluations) for (const dimension of evaluation.dimensions) dimension.score = options.dimensionScore;
    if (options.alignment) for (const evaluation of output.evaluations.filter(e => e.questionId !== questions[1].questionId)) {
      evaluation.evidenceAlignment = options.alignment;
      const dimension = evaluation.dimensions.find(d => d.dimensionId === "evidence_consistency")!;
      if (options.alignment === "contradicted") dimension.score = 0;
      if (options.alignment === "insufficient_evidence") { evaluation.evidenceRefs = []; dimension.status = "not_assessable"; dimension.score = null; }
    }
    return output;
  });
  const validation = await evaluateValidationAnswers(input, extraction, submission, { provider: provider.provider, reviewedMapping });
  const policy = syntheticPolicy();
  const context = prepareScoringContext(input, extraction, validation, policy);
  return { input, extraction, validation, submission, policy, context };
}
/** TEST ONLY. Never imported by runtime; all numeric results are synthetic_simulation. */
export function simulate(f: Awaited<ReturnType<typeof scoringFixture>>) { return buildScoringResult(prepareScoringContext(f.input, f.extraction, f.validation, f.policy)); }
