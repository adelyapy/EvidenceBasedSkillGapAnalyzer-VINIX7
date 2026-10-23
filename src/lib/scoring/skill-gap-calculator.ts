import "server-only";
import { ScoringError } from "./errors";
/** Integer 0–4 on a shared scale; caller must already establish assessment authorization. */
export function calculateSkillGap(requiredLevel: number | null, currentLevel: number | null): number | null {
  for (const value of [requiredLevel, currentLevel]) if (value !== null && (!Number.isInteger(value) || value < 0 || value > 4)) throw new ScoringError("INVALID_LEVEL");
  return requiredLevel === null || currentLevel === null ? null : Math.max(0, requiredLevel - currentLevel);
}
