import "server-only";
import { analysisInputSchema } from "@/types/analysis-input";
import { PROMPT_VERSION, skillExtractionResultSchema, type SkillExtractionResult } from "@/types/skill-extraction";
import { GeminiError } from "./gemini";
import { createGeminiSkillProvider, type SkillProvider } from "./gemini-skill-provider";
import { prepareEvidence, initialCoverage, type EvidenceLimits } from "./evidence-preparer";
import { resolveRubrics, validateRubricDataset } from "./rubric-dataset";
import { buildSkillPrompt } from "./skill-prompt";
import { validateSkillOutput } from "./skill-output-validator";
import { ExtractionError } from "./extraction-errors";

export type ExtractionDependencies={
  provider?:SkillProvider;limits?:Partial<EvidenceLimits>;
  dataset?:ReturnType<typeof validateRubricDataset>;
};

/** Server-internal: caller must authorize the AnalysisInput via M3 first. No database writes. */
export async function extractSkillsFromAnalysisInput(rawInput:unknown,dependencies:ExtractionDependencies={}):Promise<SkillExtractionResult> {
  const parsed=analysisInputSchema.safeParse(rawInput);
  if(!parsed.success)throw new ExtractionError("INVALID_ANALYSIS_INPUT");
  const input=parsed.data;
  // Constructing an adapter does not read an API key or call the network.
  const provider=dependencies.provider??createGeminiSkillProvider();
  const base={analysisId:input.analysisId,model:provider.model,promptVersion:PROMPT_VERSION,
    datasetVersion:"unavailable",skills:[],coverage:initialCoverage(input),warnings:[]} satisfies Omit<SkillExtractionResult,"status">;
  let prepared:ReturnType<typeof prepareEvidence>|undefined;
  let datasetVersion="unavailable";
  try{
    const dataset=dependencies.dataset?validateRubricDataset(dependencies.dataset.rubrics,dependencies.dataset.manifest):validateRubricDataset();
    datasetVersion=dataset.manifest.datasetVersion;
    const rubrics=resolveRubrics(input,dataset);
    prepared=prepareEvidence(input,dependencies.limits);
    if(!["complete","partial"].includes(input.processingStatus)||!prepared.index.length){
      return skillExtractionResultSchema.parse({...base,datasetVersion,status:"blocked",coverage:prepared.coverage,warnings:prepared.warnings,error:{code:"NO_SAFE_EVIDENCE"}});
    }
    const prompt=buildSkillPrompt(input,rubrics,prepared);
    let response:{model:string;text:string};
    try{response=await provider.generate(prompt);}
    catch(error){
      return skillExtractionResultSchema.parse({...base,datasetVersion,status:"failed",coverage:prepared.coverage,warnings:prepared.warnings,
        error:{code:"PROVIDER_FAILURE",...(error instanceof GeminiError?{providerStatus:error.status}:{})}});
    }
    const skills=validateSkillOutput(response.text,input,prepared);
    return skillExtractionResultSchema.parse({...base,datasetVersion,model:response.model,status:prepared.partial?"partial":"completed",skills,coverage:prepared.coverage,warnings:prepared.warnings});
  }catch(error){
    const code=error instanceof ExtractionError?error.code:"INVALID_MODEL_OUTPUT";
    const failed=["INVALID_MODEL_OUTPUT","INVALID_EVIDENCE_REFERENCE","INVALID_SKILL_ID","DUPLICATE_SKILL","UNSUPPORTED_IMPLEMENTATION_CLAIM"].includes(code);
    return skillExtractionResultSchema.parse({...base,datasetVersion,status:failed?"failed":"blocked",coverage:prepared?.coverage??base.coverage,warnings:prepared?.warnings??[],error:{code}});
  }
}
