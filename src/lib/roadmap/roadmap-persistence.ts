import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { RoadmapItemInsert } from "./gap-based-generator";

export async function persistGapBasedRoadmap(
  supabaseAdmin: SupabaseClient,
  items: RoadmapItemInsert[],
  analysisId: string,
  userId: string,
): Promise<{ inserted: number }> {
  if (!analysisId || !userId) throw new Error("Missing identity");

  // 2. Jika hasil generate KOSONG (valid), bersihkan data lama
  if (items.length === 0) {
    const { error: deleteError } = await supabaseAdmin
      .from("roadmap_items")
      .delete()
      .eq("analysis_id", analysisId)
      .eq("user_id", userId);

    if (deleteError)
      console.error("Gagal membersihkan roadmap kosong:", deleteError.message);
    return { inserted: 0 };
  }

  // Validasi kepemilikan data
  const invalidItem = items.find(
    (i) => i.analysis_id !== analysisId || i.user_id !== userId,
  );
  if (invalidItem) throw new Error("Ownership mismatch in roadmap items");

  // 3. Strategi Anti-Duplikat & Race Condition:
  // 1. INSERT data baru terlebih dahulu (jika ini gagal, data lama aman).
  const { data: insertedData, error: insertError } = await supabaseAdmin
    .from("roadmap_items")
    .insert(items)
    .select("id");

  if (insertError) {
    throw new Error(`Gagal insert roadmap: ${insertError.message}`);
  }

  const newIds = (insertedData || []).map((d) => d.id);

  // 2. HAPUS data lama yang ID-nya BUKAN bagian dari newIds.
  if (newIds.length > 0) {
    const { error: deleteError } = await supabaseAdmin
      .from("roadmap_items")
      .delete()
      .eq("analysis_id", analysisId)
      .eq("user_id", userId)
      .not("id", "in", newIds); // Supabase mendukung array langsung di sini

    if (deleteError) {
      // Hanya log, jangan throw. Data baru sudah masuk. Sisa data lama tidak merusak sistem.
      console.error(
        "Peringatan: Gagal membersihkan data lama:",
        deleteError.message,
      );
    }
  }

  return { inserted: newIds.length };
}
