import "server-only";
import type { ScoringSkill } from "@/types/competency-scoring";
import type { RoadmapContext } from "./roadmap-context";

/** Exact existing rubric alias -> catalog key. No skill-ID invention or fuzzy matching. */
export function matchLearningResource(context:RoadmapContext,skill:ScoringSkill){
  const key=context.scoringContext.skillKey(skill.skillName);
  return key?context.catalog.resources.find(resource=>resource.skillKey===key):undefined;
}
