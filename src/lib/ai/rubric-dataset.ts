import "server-only";
import { z } from "zod";
import rubricFile from "@/data/ai/evidence-rubrics.json";
import manifestFile from "@/data/ai/dataset-manifest.json";
import type { AnalysisInput } from "@/types/analysis-input";
import { ExtractionError } from "./extraction-errors";

const rubricSchema=z.object({key:z.string().regex(/^[a-z0-9-]+$/),aliases:z.array(z.string().min(1).max(100)).min(1).max(10),
  indicators:z.array(z.string().min(1).max(300)).min(1).max(10),technologyHints:z.array(z.string().min(1).max(200)).min(1).max(10),caution:z.string().min(1).max(400)}).strict();
export const rubricDatasetSchema=z.object({version:z.string().regex(/^\d+\.\d+\.\d+$/),
  roles:z.array(z.object({slug:z.string().min(1).max(100),rubrics:z.array(rubricSchema).min(1).max(32)}).strict()).min(1).max(5)}).strict();
export const datasetManifestSchema=z.object({
  datasetVersion:z.string().min(1).max(100),rubricVersion:z.string().min(1),createdAt:z.iso.date(),scope:z.literal("local-evidence-rubric"),
  supportedRoles:z.array(z.string()).min(1).max(5),provenance:z.string().min(1).max(300),
  references:z.array(z.object({title:z.string(),url:z.url(),version:z.string(),accessedAt:z.iso.date()}).strict()).max(20),
}).strict();
const normalize=(value:string)=>value.normalize("NFKC").trim().replace(/\s+/g," ").toLowerCase();

export function validateRubricDataset(rubrics:unknown=rubricFile,manifest:unknown=manifestFile){
  const data=rubricDatasetSchema.safeParse(rubrics);const meta=datasetManifestSchema.safeParse(manifest);
  if(!data.success||!meta.success||data.data.version!==meta.data.rubricVersion)throw new ExtractionError("DATASET_INVALID");
  const slugs=data.data.roles.map(role=>role.slug);
  if(new Set(slugs).size!==slugs.length||JSON.stringify([...slugs].sort())!==JSON.stringify([...meta.data.supportedRoles].sort()))throw new ExtractionError("DATASET_INVALID");
  for(const role of data.data.roles){
    const aliases=role.rubrics.flatMap(rubric=>rubric.aliases.map(normalize));
    if(new Set(aliases).size!==aliases.length||new Set(role.rubrics.map(r=>r.key)).size!==role.rubrics.length)throw new ExtractionError("DATASET_INVALID");
  }
  return {rubrics:data.data,manifest:meta.data};
}

export function resolveRubrics(input:AnalysisInput,dataset=validateRubricDataset()){
  if(input.benchmarks.length>32)throw new ExtractionError("BENCHMARK_LIMIT_EXCEEDED");
  const role=dataset.rubrics.roles.find(role=>role.slug===input.targetRole.slug);
  if(!role)throw new ExtractionError("ROLE_NOT_SUPPORTED");
  const skills=input.benchmarks.map(benchmark=>{
    const rubric=role.rubrics.find(r=>r.aliases.some(alias=>normalize(alias)===normalize(benchmark.skillName)));
    if(!rubric)throw new ExtractionError("RUBRIC_NOT_FOUND");
    return {skillId:benchmark.skillId,skillName:benchmark.skillName,rubric};
  });
  return {datasetVersion:dataset.manifest.datasetVersion,skills};
}
export type ResolvedRubrics=ReturnType<typeof resolveRubrics>;
