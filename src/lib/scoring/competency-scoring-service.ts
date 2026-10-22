import "server-only";
import { loadScoringPolicy } from "./scoring-policy";
import { prepareScoringContext } from "./scoring-context";
import { buildScoringResult } from "./scoring-calculation";
import { validateScoringOutput } from "./scoring-output-validator";

/** Production-facing INTERNAL library. No approved production policy exists yet.
 * Caller must authenticate/authorize analysis and load M4/M5 snapshots from trusted server storage.
 * Client JSON claiming approval is never authoritative. No network calls or persistence.
 */
export function calculateCompetencyGaps(analysisInput: unknown, skillExtraction: unknown, validationEvaluation: unknown, scoringPolicy?: unknown) {
  const policy = loadScoringPolicy(scoringPolicy);
  const context = prepareScoringContext(analysisInput, skillExtraction, validationEvaluation, policy);
  return validateScoringOutput(buildScoringResult(context), context);
}
