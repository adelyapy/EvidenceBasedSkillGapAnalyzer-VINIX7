import "server-only";
import { competencyScoringResultSchema } from "@/types/competency-scoring";
import { buildScoringResult } from "./scoring-calculation";
import { canonical, type ScoringContext } from "./scoring-context";
import { ScoringError } from "./errors";

/** Recompute levels, required levels, gaps, counters, priorities, policy gates and readiness. */
export function validateScoringOutput(raw: unknown, context: ScoringContext) {
  const parsed = competencyScoringResultSchema.safeParse(raw);
  if (!parsed.success || canonical(parsed.data) !== canonical(buildScoringResult(context))) throw new ScoringError("INVALID_OUTPUT");
  return parsed.data;
}
