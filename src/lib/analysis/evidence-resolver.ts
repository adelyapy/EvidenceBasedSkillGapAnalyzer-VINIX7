import "server-only";
import { normalizedProjectSchema } from "@/types/ingestion";
import { type AnalysisEvidence, type EvidenceRow, ANALYSIS_PIPELINE_LIMITS } from "@/types/analysis-input";
import { ingestGithubRepository } from "@/lib/ingestion/ingestion-service";
import { parseGithubRepositoryUrl } from "@/lib/ingestion/github-reader";
import { normalizeProject } from "@/lib/ingestion/project-normalizer";
import { IngestionError } from "@/lib/ingestion/errors";

export type EvidenceDependencies = { ingestGithub?: typeof ingestGithubRepository };
export type EvidenceBudget = { bytes: number; files: number };

function sourceType(type: string): AnalysisEvidence["sourceType"] {
  const value = type.trim().toLowerCase();
  const aliases: Record<string,AnalysisEvidence["sourceType"]> = { github_url:"github",zip_file:"zip",pdf_file:"pdf",portfolio_url:"portfolio",deployment_url:"deployment" };
  if (Object.hasOwn(aliases,value)) return aliases[value];
  return (["github","zip","pdf","cv","portfolio","website","deployment","gitlab","folder"] as const).find(item=>item===value) ?? "unknown";
}

export async function resolveEvidence(row: EvidenceRow, dependencies: EvidenceDependencies = {}, budget: EvidenceBudget = {
  bytes:ANALYSIS_PIPELINE_LIMITS.contentBytes,files:ANALYSIS_PIPELINE_LIMITS.files,
}): Promise<AnalysisEvidence> {
  const type = sourceType(row.evidence_type);
  const base = {evidenceId:row.id,sourceType:type,sourceReference:`evidence:${row.id}`};
  if (type === "zip") {
    // ERD provides storage_path but no trusted ZIP byte length/private bucket contract.
    // Do not call download(), createSignedUrl(), or fetch a public storage URL.
    return {...base,status:"blocked",error:"STORAGE_READER_NOT_READY",warnings:[]};
  }
  if (type !== "github") return {...base,status:"unsupported",error:"UNSUPPORTED_SOURCE",warnings:[]};
  let reference: string;
  try { reference = parseGithubRepositoryUrl(row.url ?? "").reference; }
  catch { return {...base,status:"failed",error:"INVALID_GITHUB_URL",warnings:[]}; }
  if (budget.bytes <= 0 || budget.files <= 0) return {...base,status:"blocked",error:"ANALYSIS_CONTENT_LIMIT_REACHED",warnings:[]};
  try {
    const project = await (dependencies.ingestGithub ?? ingestGithubRepository)(reference, {limits:{
      maxContentBytes:Math.min(1024*1024,budget.bytes),maxIncludedFiles:Math.min(40,budget.files),
    }});
    const parsed = normalizedProjectSchema.safeParse(project);
    if (!parsed.success || parsed.data.sourceType !== "github" || parsed.data.sourceReference !== reference) {
      return {...base,status:"failed",error:"EVIDENCE_OUTPUT_REJECTED",warnings:[]};
    }
    // Reapply the current security filter even to a previously normalized/injected result.
    const normalized = normalizeProject({...parsed.data,discoveredFiles:parsed.data.stats.discoveredFiles});
    if (normalized.stats.totalContentBytes > budget.bytes || normalized.files.length > budget.files) {
      return {...base,status:"blocked",error:"ANALYSIS_CONTENT_LIMIT_REACHED",warnings:[]};
    }
    return {...base,sourceReference:reference,status:normalized.status,normalizedProject:normalized,warnings:[]};
  } catch (error) {
    const code = error instanceof IngestionError && error.code === "LIMIT_EXCEEDED" ? "EVIDENCE_LIMIT_EXCEEDED" : "EVIDENCE_FETCH_FAILED";
    return {...base,status:"failed",error:code,warnings:[]};
  }
}
