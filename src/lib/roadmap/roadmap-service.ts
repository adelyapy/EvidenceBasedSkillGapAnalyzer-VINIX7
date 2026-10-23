import "server-only";
import { loadScoringPolicy } from "@/lib/scoring/scoring-policy";
import { prepareScoringContext } from "@/lib/scoring/scoring-context";
import { loadRoadmapPolicy } from "./roadmap-policy";
import { loadResourceCatalog } from "./resource-catalog";
import { prepareRoadmapContext } from "./roadmap-context";
import { buildLearningRoadmap } from "./roadmap-calculation";
import { validateRoadmapOutput } from "./roadmap-output-validator";
import { RoadmapError } from "./errors";

export type RoadmapSource={analysisInput:unknown;skillExtraction:unknown;validationEvaluation:unknown;scoringPolicy?:unknown};
/** Internal server function. Authenticate ownership and load trusted snapshots before calling.
 * Requires M6 semantic recomputation, not just client JSON with a valid schema. No external I/O.
 */
export function generateLearningRoadmap(rawScoring:unknown,source:RoadmapSource,options:{roadmapPolicy?:unknown;resourceCatalog?:unknown}={}){
  const scoringPolicy=loadScoringPolicy(source.scoringPolicy);
  const policy=loadRoadmapPolicy(options.roadmapPolicy),catalog=loadResourceCatalog(options.resourceCatalog);
  const scoringContext=prepareScoringContext(source.analysisInput,source.skillExtraction,source.validationEvaluation,scoringPolicy);
  const context=prepareRoadmapContext(rawScoring,scoringContext,policy,catalog);
  if(context.scoring.calculationMetadata.executionMode!=="non_numeric")throw new RoadmapError("SIMULATION_NOT_ALLOWED");
  return validateRoadmapOutput(buildLearningRoadmap(context),context);
}
