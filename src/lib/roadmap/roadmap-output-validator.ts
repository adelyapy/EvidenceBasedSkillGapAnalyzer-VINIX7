import "server-only";
import { learningRoadmapResultSchema } from "@/types/learning-roadmap";
import { canonical } from "@/lib/scoring/scoring-context";
import { buildLearningRoadmap } from "./roadmap-calculation";
import type { RoadmapContext } from "./roadmap-context";
import { RoadmapError } from "./errors";
export function validateRoadmapOutput(raw:unknown,context:RoadmapContext){
  const parsed=learningRoadmapResultSchema.safeParse(raw);
  if(!parsed.success||canonical(parsed.data)!==canonical(buildLearningRoadmap(context)))throw new RoadmapError("INVALID_OUTPUT");
  return parsed.data;
}
