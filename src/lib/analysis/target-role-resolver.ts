import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import { ANALYSIS_PIPELINE_LIMITS, benchmarkRowSchema, safeTextSchema, skillRowSchema, targetRoleRowSchema, type AnalysisInput } from "@/types/analysis-input";
import { readDatabase } from "./analysis-repository";
import { AnalysisError } from "./errors";

export function normalizeRoleName(value: string): string {
  return value.normalize("NFKC").trim().replace(/\s+/gu," ").toLowerCase();
}

/** Call only after user/analysis authorization; no semantic or benchmark fallback. */
export async function resolveTargetRole(value: string, client: SupabaseClient): Promise<Pick<AnalysisInput,"targetRole"|"benchmarks">> {
  if (!safeTextSchema.safeParse(value).success || value.length > 160) throw new AnalysisError("ROLE_NOT_FOUND");
  const normalized = normalizeRoleName(value);
  const projection = "id::text,name,slug,description,is_active";
  try {
    let matches = await readDatabase(client.from("target_roles").select(projection).eq("slug",normalized).limit(2),z.array(targetRoleRowSchema));
    if (matches.length > 1) throw new AnalysisError("ROLE_AMBIGUOUS");
    if (!matches.length) {
      const catalog = await readDatabase(client.from("target_roles").select(projection).order("id").limit(ANALYSIS_PIPELINE_LIMITS.roleCatalog+1),z.array(targetRoleRowSchema));
      if (catalog.length > ANALYSIS_PIPELINE_LIMITS.roleCatalog) throw new AnalysisError("DATA_LIMIT_EXCEEDED");
      matches = catalog.filter(role => normalizeRoleName(role.name) === normalized);
    } else if (normalizeRoleName(matches[0].slug) !== normalized) throw new AnalysisError("DATABASE_CONTRACT_ERROR");
    if (!matches.length) throw new AnalysisError("ROLE_NOT_FOUND");
    if (matches.length > 1) throw new AnalysisError("ROLE_AMBIGUOUS");
    const role = matches[0];
    if (!role.is_active) throw new AnalysisError("ROLE_INACTIVE");
    const rows = await readDatabase(client.from("role_benchmarks")
      .select("id::text,target_role_id::text,skill_id::text,required_level,priority,source_name,source_url")
      .eq("target_role_id",role.id).order("id").limit(ANALYSIS_PIPELINE_LIMITS.benchmarks+1),z.array(benchmarkRowSchema));
    if (!rows.length) throw new AnalysisError("BENCHMARK_NOT_CONFIGURED");
    if (rows.length > ANALYSIS_PIPELINE_LIMITS.benchmarks) throw new AnalysisError("DATA_LIMIT_EXCEEDED");
    if (rows.some(row => row.target_role_id !== role.id) || new Set(rows.map(row=>row.skill_id)).size !== rows.length) throw new AnalysisError("DATABASE_CONTRACT_ERROR");
    const ids = rows.map(row=>row.skill_id);
    const skills = await readDatabase(client.from("skills").select("id::text,name,category,description").in("id",ids).limit(ANALYSIS_PIPELINE_LIMITS.benchmarks+1),z.array(skillRowSchema));
    if (skills.some(skill => !ids.includes(skill.id)) || new Set(skills.map(s=>s.id)).size !== skills.length) throw new AnalysisError("DATABASE_CONTRACT_ERROR");
    const benchmarks = rows.map(row => {
      const skill = skills.find(skill=>skill.id === row.skill_id);
      if (!skill) throw new AnalysisError("SKILL_NOT_FOUND");
      return { benchmarkId:row.id,skillId:skill.id,skillName:skill.name,category:skill.category,description:skill.description,
        requiredLevel:row.required_level,priority:row.priority,sourceName:row.source_name,sourceUrl:row.source_url };
    }).sort((a,b)=>BigInt(a.skillId)<BigInt(b.skillId)?-1:BigInt(a.skillId)>BigInt(b.skillId)?1:0);
    return {targetRole:{id:role.id,name:role.name,slug:role.slug,description:role.description},benchmarks};
  } catch (error) {
    if (error instanceof AnalysisError) throw error;
    throw new AnalysisError("DATABASE_ERROR");
  }
}
