import { scoringFixture } from "../scoring/fixtures";
import { loadScoringPolicy } from "@/lib/scoring/scoring-policy";
import { prepareScoringContext } from "@/lib/scoring/scoring-context";
import { buildScoringResult } from "@/lib/scoring/scoring-calculation";
import { loadRoadmapPolicy } from "@/lib/roadmap/roadmap-policy";
import { loadResourceCatalog } from "@/lib/roadmap/resource-catalog";
import { prepareRoadmapContext } from "@/lib/roadmap/roadmap-context";
import type { RoadmapSource } from "@/lib/roadmap/roadmap-service";
export async function roadmapFixture(options:Parameters<typeof scoringFixture>[0]&{simulation?:boolean}={}){
  const f=await scoringFixture(options);
  const scoringPolicy=options.simulation?f.policy:loadScoringPolicy();
  const scoringContext=prepareScoringContext(f.input,f.extraction,f.validation,scoringPolicy);
  const scoring=buildScoringResult(scoringContext);
  const context=prepareRoadmapContext(scoring,scoringContext,loadRoadmapPolicy(),loadResourceCatalog());
  const source:RoadmapSource={analysisInput:f.input,skillExtraction:f.extraction,validationEvaluation:f.validation,scoringPolicy};
  return {...f,source,scoring,scoringContext,context};
}
