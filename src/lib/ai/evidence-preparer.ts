import "server-only";
import { createHash } from "node:crypto";
import { posix } from "node:path";
import { analysisInputSchema, type AnalysisInput } from "@/types/analysis-input";
import type { EvidenceIndexEntry, EvidenceKind, ExtractionCoverage, ExtractionWarning } from "@/types/skill-extraction";
import { containsPossibleSecret, decodeSafeText, isRelevantPath } from "@/lib/ingestion/file-filter";
import { parseGithubRepositoryUrl } from "@/lib/ingestion/github-reader";
import { ExtractionError } from "./extraction-errors";

export const EVIDENCE_LIMITS=Object.freeze({maxFiles:12,maxFileBytes:12*1024,maxContentBytes:64*1024});
export type EvidenceLimits={-readonly [K in keyof typeof EVIDENCE_LIMITS]:number};
export const normalizeNewlines=(value:string)=>value.replace(/\r\n?/g,"\n");
export const containsPromptInjection=(value:string)=>/ignore\s+(?:all\s+)?(?:previous|system|developer|above)\s+instructions|system\s+prompt|developer\s+message|<\|(?:system|assistant)\|>|exfiltrat|override\s+(?:the\s+)?(?:system|rules)|reveal\s+(?:the\s+)?(?:api\s*key|secret)/i.test(value);
export const containsPersonalData=(value:string)=>/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(value);

export function evidenceKind(path:string):EvidenceKind {
  const name=posix.basename(path).toLowerCase();
  if(["package.json","composer.json","pyproject.toml","requirements.txt","cargo.toml","go.mod","pubspec.yaml","pom.xml"].includes(name))return "manifest";
  if(/\.(?:md|mdx|txt)$/i.test(path))return "documentation";
  if(/\.(test|spec)\.|(^|\/)(__tests__|tests?)\//i.test(path))return "test";
  if(/\.config\.|(^|\/)(tsconfig[^/]*\.json|\.github\/|dockerfile)|\.(json|ya?ml|toml|xml)$/i.test(path))return "config";
  return "source";
}
const priorities:Record<EvidenceKind,number>={source:0,config:1,manifest:2,test:3,documentation:4};

export function initialCoverage(input:AnalysisInput):ExtractionCoverage {
  const projects=input.evidences.flatMap(e=>"normalizedProject" in e?[e.normalizedProject]:[]);
  const discoveredFiles=projects.reduce((n,p)=>n+p.stats.discoveredFiles,0);
  return {sourceCount:input.evidences.length,includedSources:0,discoveredFiles,availableFiles:projects.reduce((n,p)=>n+p.files.length,0),
    sentFiles:0,skippedFiles:discoveredFiles,sentContentBytes:0};
}

export function prepareEvidence(rawInput:unknown,overrides:Partial<EvidenceLimits>={}) {
  const validation=analysisInputSchema.safeParse(rawInput);
  if(!validation.success)throw new ExtractionError("INVALID_ANALYSIS_INPUT");
  const input=validation.data;
  const limits:EvidenceLimits={...EVIDENCE_LIMITS};
  for(const key of Object.keys(overrides)){
    if(!Object.hasOwn(limits,key))throw new ExtractionError("INVALID_EVIDENCE_LIMITS");
    const name=key as keyof EvidenceLimits;const value=overrides[name];
    if(typeof value!=="number"||!Number.isSafeInteger(value)||value<1||value>limits[name])throw new ExtractionError("INVALID_EVIDENCE_LIMITS");
    limits[name]=value;
  }
  const coverage=initialCoverage(input);
  const warnings=new Set<ExtractionWarning>();
  if(input.processingStatus!=="complete")warnings.add("INPUT_PARTIAL");
  const candidates=input.evidences.flatMap(evidence=>{
    if(!("normalizedProject" in evidence)){warnings.add("SOURCE_UNAVAILABLE");return [];}
    if(evidence.status==="partial")warnings.add("INPUT_PARTIAL");
    const project=evidence.normalizedProject;
    return project.files.map(file=>({evidenceId:evidence.evidenceId,filePath:file.path,content:file.content,kind:evidenceKind(file.path),
      sourceType:project.sourceType,origin:project.sourceReference,...(project.revision?{revision:project.revision}:{})}));
  }).sort((a,b)=>priorities[a.kind]-priorities[b.kind]||
    (a.evidenceId<b.evidenceId?-1:a.evidenceId>b.evidenceId?1:0)||(a.filePath<b.filePath?-1:a.filePath>b.filePath?1:0));
  const index:EvidenceIndexEntry[]=[];
  if(["blocked","failed","unsupported"].includes(input.processingStatus)){
    return {index,coverage,warnings:[...warnings].sort(),partial:true};
  }
  for(const candidate of candidates){
    const content=normalizeNewlines(candidate.content);
    const metadata=`${candidate.evidenceId}\n${candidate.filePath}\n${candidate.origin}`;
    if(!content.trim()){warnings.add("EMPTY_FILE_SKIPPED");continue;}
    if(!isRelevantPath(candidate.filePath)||decodeSafeText(Buffer.from(content))===undefined||containsPossibleSecret(metadata)||
      [input.userId,input.analysisId].some(id=>content.includes(id)||metadata.includes(id))){warnings.add("FILE_FILTERED");continue;}
    if(containsPromptInjection(content)||containsPromptInjection(metadata)){warnings.add("PROMPT_INJECTION_FILTERED");continue;}
    if(containsPersonalData(content)||containsPersonalData(metadata)){warnings.add("PERSONAL_DATA_FILTERED");continue;}
    if(candidate.sourceType==="github"){
      try {if(parseGithubRepositoryUrl(candidate.origin).reference!==candidate.origin)throw new Error();}
      catch {warnings.add("FILE_FILTERED");continue;}
    }
    const size=Buffer.byteLength(content);
    if(size>limits.maxFileBytes){warnings.add("FILE_SIZE_LIMIT");continue;}
    if(index.length>=limits.maxFiles){warnings.add("FILE_LIMIT");continue;}
    if(coverage.sentContentBytes+size>limits.maxContentBytes){warnings.add("CONTENT_LIMIT");continue;}
    const fileRef=`file_${createHash("sha256").update(JSON.stringify([candidate.evidenceId,candidate.filePath,candidate.revision??null,content])).digest("hex").slice(0,24)}`;
    if(index.some(entry=>entry.fileRef===fileRef))throw new ExtractionError("INVALID_ANALYSIS_INPUT");
    index.push({...candidate,content,fileRef});
    coverage.sentContentBytes+=size;
  }
  coverage.sentFiles=index.length;coverage.includedSources=new Set(index.map(entry=>entry.evidenceId)).size;
  coverage.skippedFiles=coverage.discoveredFiles-index.length;
  const partial=input.processingStatus!=="complete"||coverage.skippedFiles>0||warnings.size>0;
  if(coverage.skippedFiles>0)warnings.add("INPUT_PARTIAL");
  return {index,coverage,warnings:[...warnings].sort(),partial};
}
export type PreparedEvidence=ReturnType<typeof prepareEvidence>;
