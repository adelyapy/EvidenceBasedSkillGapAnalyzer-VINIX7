import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { RoadmapItemInsert } from "./gap-based-generator";

export async function persistGapBasedRoadmap(
  supabaseAdmin: SupabaseClient,
  items: RoadmapItemInsert[],
  analysisId: string,
  userId: string,
): Promise<{ inserted: number }> {
  // Validasi keamanan (defense in depth)
  if (!analysisId || !userId) throw new Error("Missing identity");
  if (items.length === 0) return { inserted: 0 };

  // Pastikan semua item milik analisis & user yang benar
  const invalidItem = items.find(
    (i) => i.analysis_id !== analysisId || i.user_id !== userId,
  );
  if (invalidItem) throw new Error("Ownership mismatch in roadmap items");

  // 1. INSERT data baru terlebih dahulu
  const { data: insertedData, error: insertError } = await supabaseAdmin
    .from("roadmap_items")
    .insert(items)
    .select("id");

  if (insertError) {
    throw new Error(`Gagal insert roadmap: ${insertError.message}`);
  }

  const newIds = (insertedData || []).map((d) => d.id);
  if (newIds.length === 0) throw new Error("No items inserted");

  // 2. HAPUS data lama HANYA JIKA insert baru sukses
  // (Mencegah kehilangan data valid jika insert gagal)
  const { error: deleteError } = await supabaseAdmin
    .from("roadmap_items")
    .delete()
    .eq("analysis_id", analysisId)
    .eq("user_id", userId)
    .not("id", "in", `(${newIds.join(",")})`);

  if (deleteError) {
    console.error(
      "Peringatan: Gagal menghapus roadmap lama:",
      deleteError.message,
    );
    // Tidak throw error, karena data baru sudah aman di DB
  }

  return { inserted: newIds.length };
}
