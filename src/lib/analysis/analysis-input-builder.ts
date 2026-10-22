import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { analysisInputSchema, getProcessingStatus, uuidSchema, ANALYSIS_PIPELINE_LIMITS, type AnalysisEvidence, type AnalysisInput } from "@/types/analysis-input";
import { getAnalysisClient, loadOwnedAnalysis } from "./analysis-repository";
import { resolveTargetRole } from "./target-role-resolver";
import { resolveEvidence, type EvidenceDependencies } from "./evidence-resolver";
import { AnalysisError } from "./errors";

export type AnalysisInputDependencies = EvidenceDependencies & { client?: SupabaseClient };

/** Internal server data only. Do not return this object from a browser-facing route. */
export async function buildAnalysisInput(analysisId: string, dependencies: AnalysisInputDependencies = {}): Promise<AnalysisInput> {
  if (!uuidSchema.safeParse(analysisId).success) throw new AnalysisError("INVALID_ANALYSIS_ID");
  const client = await getAnalysisClient(dependencies.client);
  const owned = await loadOwnedAnalysis(analysisId,client);
  const role = await resolveTargetRole(owned.analysis.target_role,client);
  const evidences: AnalysisEvidence[] = [];
  let bytes = 0;
  let files = 0;
  for (const row of owned.evidences) {
    const evidence = await resolveEvidence(row,dependencies,{
      bytes:ANALYSIS_PIPELINE_LIMITS.contentBytes-bytes,files:ANALYSIS_PIPELINE_LIMITS.files-files,
    });
    evidences.push(evidence);
    if ("normalizedProject" in evidence) {
      bytes += evidence.normalizedProject.stats.totalContentBytes;
      files += evidence.normalizedProject.files.length;
    }
  }
  const warnings: AnalysisInput["warnings"] = [];
  const processingStatus = getProcessingStatus(evidences);
  if (!evidences.length) warnings.push("NO_PROJECT_EVIDENCE");
  else if (processingStatus !== "complete") warnings.push("INCOMPLETE_EVIDENCE");
  if (owned.cv) warnings.push("CV_METADATA_ONLY");
  const parsed = analysisInputSchema.safeParse({
    analysisId:owned.analysis.id,userId:owned.userId,...role,evidences,
    cv:owned.cv ? {id:owned.cv.id,sourceReference:`cv:${owned.cv.id}`,originalFilename:owned.cv.original_filename,
      mimeType:owned.cv.mime_type,sizeBytes:owned.cv.file_size_bytes,contentStatus:"unsupported"} : null,
    processingStatus,warnings,
  });
  if (!parsed.success) throw new AnalysisError("INVALID_ANALYSIS_INPUT");
  return parsed.data;
}
