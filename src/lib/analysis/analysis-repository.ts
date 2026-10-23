import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { ANALYSIS_PIPELINE_LIMITS, analysisRowSchema, cvRowSchema, evidenceRowSchema, uuidSchema } from "@/types/analysis-input";
import { AnalysisError } from "./errors";

export async function getAnalysisClient(client?: SupabaseClient): Promise<SupabaseClient> {
  if (client) return client; // Dependency injection is server-internal, never request input.
  try { return await createClient(); } catch { throw new AnalysisError("SERVER_CONFIGURATION_ERROR"); }
}

export async function requireVerifiedUser(client: SupabaseClient): Promise<string> {
  try {
    const { data, error } = await client.auth.getUser();
    const id = uuidSchema.safeParse(data?.user?.id);
    if (!error && id.success) return id.data;
  } catch { /* Do not expose auth/session error details. */ }
  throw new AnalysisError("UNAUTHENTICATED");
}

export async function readDatabase<T>(query: PromiseLike<{ data: unknown; error: unknown }>, schema: z.ZodType<T>): Promise<T> {
  try {
    const { data, error } = await query;
    if (error) throw new AnalysisError("DATABASE_ERROR");
    const parsed = schema.safeParse(data);
    if (!parsed.success) throw new AnalysisError("DATABASE_CONTRACT_ERROR");
    return parsed.data;
  } catch (error) {
    if (error instanceof AnalysisError) throw error;
    throw new AnalysisError("DATABASE_ERROR");
  }
}

/** No cache: ownership is rechecked using the verified request user on every call. */
export async function loadOwnedAnalysis(analysisId: string, injectedClient?: SupabaseClient) {
  const id = uuidSchema.safeParse(analysisId);
  if (!id.success) throw new AnalysisError("INVALID_ANALYSIS_ID");
  const client = await getAnalysisClient(injectedClient);
  const userId = await requireVerifiedUser(client);
  try {
    const analysis = await readDatabase(client.from("analyses")
      .select("id,user_id,status,target_role,created_at,updated_at")
      .eq("id",id.data).eq("user_id",userId).maybeSingle(), analysisRowSchema.nullable());
    if (!analysis || analysis.user_id !== userId || analysis.id !== id.data) throw new AnalysisError("ANALYSIS_NOT_FOUND");
    const evidences = await readDatabase(client.from("project_evidences")
      .select("id,analysis_id,user_id,evidence_type,title,url,storage_path,description")
      .eq("analysis_id",id.data).eq("user_id",userId).order("id").limit(ANALYSIS_PIPELINE_LIMITS.evidences+1), z.array(evidenceRowSchema));
    const cvs = await readDatabase(client.from("cv_files")
      .select("id,analysis_id,user_id,storage_path,original_filename,mime_type,file_size_bytes")
      .eq("analysis_id",id.data).eq("user_id",userId).order("id").limit(2), z.array(cvRowSchema));
    if (evidences.length > ANALYSIS_PIPELINE_LIMITS.evidences || cvs.length > 1) throw new AnalysisError("DATA_LIMIT_EXCEEDED");
    if ([...evidences,...cvs].some(row => row.user_id !== userId || row.analysis_id !== id.data) ||
        new Set(evidences.map(e=>e.id)).size !== evidences.length) throw new AnalysisError("DATABASE_CONTRACT_ERROR");
    return { userId, analysis, evidences, cv: cvs[0] ?? null };
  } catch (error) {
    if (error instanceof AnalysisError) throw error;
    throw new AnalysisError("DATABASE_ERROR");
  }
}
