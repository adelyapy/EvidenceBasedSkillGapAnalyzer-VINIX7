import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { LearningRoadmapResult } from "@/types/learning-roadmap";

// 1. Pemetaan Priority (Generator -> Database)
function mapPriority(
  benchmarkPriority: string,
): "low" | "medium" | "high" | "critical" {
  switch (benchmarkPriority.toLowerCase()) {
    case "critical":
    case "sangat_tinggi":
      return "critical";
    case "high":
    case "tinggi":
      return "high";
    case "medium":
    case "sedang":
      return "medium";
    case "low":
    case "rendah":
    default:
      return "low";
  }
}

// 2. Pemetaan Status (Generator 'proposed' -> Database 'not_started')
function mapStatus(
  status: string,
): "not_started" | "in_progress" | "completed" {
  if (status === "proposed") return "not_started";
  if (["not_started", "in_progress", "completed"].includes(status)) {
    return status as "not_started" | "in_progress" | "completed";
  }
  return "not_started"; // Fallback aman
}

export async function persistRoadmap(
  supabaseAdmin: SupabaseClient,
  roadmap: LearningRoadmapResult,
  userId: string,
): Promise<{ inserted: number }> {
  // Guard: jangan insert jika tidak ada aksi
  if (roadmap.metadata.activityCount === 0) {
    return { inserted: 0 };
  }

  const resourceUrlById = new Map(
    roadmap.resources.map((r) => [r.resourceId, r.url]),
  );

  const rows = [];
  let sortOrder = 0;

  for (const phase of roadmap.phases) {
    for (const activity of phase.activities) {
      sortOrder += 1;
      const resourceId = activity.resourceIds[0];
      rows.push({
        analysis_id: roadmap.analysisId,
        user_id: userId,
        skill_id: activity.skillId ? Number(activity.skillId) : null,
        title: activity.title,
        description: [
          activity.objective,
          ...activity.successCriteria.map((c) => `• ${c}`),
        ].join("\n"),
        resource_url: resourceId
          ? (resourceUrlById.get(resourceId) ?? null)
          : null,
        priority: mapPriority(activity.priority.benchmarkPriority),
        status: mapStatus(activity.status),
        sort_order: sortOrder,
      });
    }
  }

  if (rows.length === 0) return { inserted: 0 };

  // =========================================================================
  // STRATEGI IDEMPOTENT: Hapus lama, lalu Insert baru.
  // Kita bungkus dalam try/catch untuk memastikan integritas data.
  // =========================================================================

  // 1. Hapus data lama untuk analisis ini
  const { error: deleteError } = await supabaseAdmin
    .from("roadmap_items")
    .delete()
    .eq("analysis_id", roadmap.analysisId)
    .eq("user_id", userId);

  if (deleteError) {
    throw new Error(`Gagal menghapus roadmap lama: ${deleteError.message}`);
  }

  // 2. Insert data baru
  const { error: insertError } = await supabaseAdmin
    .from("roadmap_items")
    .insert(rows);

  if (insertError) {
    // Jika insert gagal setelah hapus, kita lempar error agar route menangkapnya
    throw new Error(`Gagal insert roadmap baru: ${insertError.message}`);
  }

  return { inserted: rows.length };
}
