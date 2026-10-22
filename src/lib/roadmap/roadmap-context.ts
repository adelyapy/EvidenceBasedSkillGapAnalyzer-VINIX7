import "server-only";
import type { ScoringContext } from "@/lib/scoring/scoring-context";
import { validateScoringOutput } from "@/lib/scoring/scoring-output-validator";
import { parseRoadmapPolicy,type RoadmapPolicy } from "./roadmap-policy";
import { parseResourceCatalog,type ResourceCatalog } from "./resource-catalog";
import { RoadmapError } from "./errors";

/** Internal shared validator. Runtime service separately pins all policies/catalogs. */
export function prepareRoadmapContext(rawScoring:unknown,scoringContext:ScoringContext,policy:RoadmapPolicy,catalog:ResourceCatalog){
  let scoring:ReturnType<typeof validateScoringOutput>;
  try{scoring=validateScoringOutput(rawScoring,scoringContext);}catch{throw new RoadmapError("INVALID_SCORING");}
  const checkedPolicy=parseRoadmapPolicy(policy),checkedCatalog=parseResourceCatalog(catalog);
  if(scoring.targetRole.slug!==checkedPolicy.supportedRole||checkedCatalog.catalogVersion!==checkedPolicy.resourceSelectionRules.catalogVersion)throw new RoadmapError("INVALID_SCORING");
  return {scoring,scoringContext,policy:checkedPolicy,catalog:checkedCatalog};
}
export type RoadmapContext=ReturnType<typeof prepareRoadmapContext>;
