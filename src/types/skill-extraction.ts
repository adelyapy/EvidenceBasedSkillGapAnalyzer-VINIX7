import "server-only";
import { z } from "zod";
import { databaseInt8Schema, uuidSchema } from "./analysis-input";
import { isCanonicalProjectPath } from "@/lib/ingestion/project-path";

export const PROMPT_VERSION="buktiva-skill-extraction-1.0.0";
export const extractionWarningSchema=z.enum([
  "INPUT_PARTIAL","SOURCE_UNAVAILABLE","FILE_FILTERED","PROMPT_INJECTION_FILTERED","PERSONAL_DATA_FILTERED",
  "EMPTY_FILE_SKIPPED","FILE_SIZE_LIMIT","CONTENT_LIMIT","FILE_LIMIT",
]);
export type ExtractionWarning=z.infer<typeof extractionWarningSchema>;
export type EvidenceKind="source"|"test"|"config"|"manifest"|"documentation";
export type EvidenceIndexEntry={
  evidenceId:string;fileRef:string;filePath:string;content:string;
  sourceType:"github"|"zip";origin:string;revision?:string;kind:EvidenceKind;
};
export const evidenceRefSchema=z.object({
  evidenceId:uuidSchema,fileRef:z.string().regex(/^file_[a-f0-9]{24}$/),
  filePath:z.string().max(512).refine(isCanonicalProjectPath),
  quote:z.string().min(1).max(400).refine(value=>Boolean(value.trim())),
}).strict();
export const extractedSkillSchema=z.object({
  skillId:databaseInt8Schema,
  evidenceStatus:z.enum(["observed_technology","implementation_evidence","insufficient_evidence"]),
  evidenceRefs:z.array(evidenceRefSchema).max(8),reason:z.string().min(1).max(500).refine(value=>Boolean(value.trim())),
}).strict();
export const modelSkillOutputSchema=z.object({skills:z.array(extractedSkillSchema).min(1).max(32)}).strict();
export const extractionCoverageSchema=z.object({
  sourceCount:z.number().int().nonnegative(),includedSources:z.number().int().nonnegative(),
  discoveredFiles:z.number().int().nonnegative(),availableFiles:z.number().int().nonnegative(),
  sentFiles:z.number().int().nonnegative().max(12),skippedFiles:z.number().int().nonnegative(),
  sentContentBytes:z.number().int().nonnegative().max(64*1024),
}).strict().superRefine((coverage,context)=>{
  if(coverage.sentFiles>coverage.availableFiles||coverage.availableFiles>coverage.discoveredFiles||
      coverage.skippedFiles!==coverage.discoveredFiles-coverage.sentFiles||coverage.includedSources>coverage.sourceCount){
    context.addIssue({code:"custom",message:"Inconsistent coverage"});
  }
});
export const skillExtractionResultSchema=z.object({
  analysisId:uuidSchema,status:z.enum(["completed","partial","blocked","failed"]),
  model:z.string().min(1).max(100),promptVersion:z.literal(PROMPT_VERSION),datasetVersion:z.string().min(1).max(100),
  skills:z.array(extractedSkillSchema).max(32),coverage:extractionCoverageSchema,
  warnings:z.array(extractionWarningSchema).max(12),
  error:z.object({code:z.string().regex(/^[A-Z_]+$/).max(80),providerStatus:z.number().int().min(400).max(599).optional()}).strict().optional(),
}).strict().superRefine((result,context)=>{
  if(((result.status==="blocked"||result.status==="failed")&&(result.skills.length>0||!result.error))||
      ((result.status==="completed"||result.status==="partial")&&(!result.skills.length||result.error))){
    context.addIssue({code:"custom",message:"Inconsistent extraction outcome"});
  }
});
export type ExtractedSkill=z.infer<typeof extractedSkillSchema>;
export type ExtractionCoverage=z.infer<typeof extractionCoverageSchema>;
export type SkillExtractionResult=z.infer<typeof skillExtractionResultSchema>;
