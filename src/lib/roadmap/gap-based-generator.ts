import "server-only";

// Definisi tipe lokal untuk hasil query DB
type SkillGapRow = {
  skill_name: string;
  current_level: number;
  required_level: number;
  gap_score: number;
  priority: string | null; // "tinggi" | "sedang" | "rendah" dari DB
  explanation: string | null;
};

type SkillResultRow = {
  skill_name: string;
  estimated_level: number;
  evidence_summary: string | null;
};

// Tipe untuk kontrak roadmap_items
export type RoadmapItemInsert = {
  analysis_id: string;
  user_id: string;
  skill_id: number | null;
  title: string;
  description: string | null;
  resource_url: string | null; // Kita set NULL karena tidak ada katalog resource di Opsi A
  priority: "low" | "medium" | "high" | "critical";
  status: "not_started" | "in_progress" | "completed";
  sort_order: number;
};

export function generateRoadmapFromGaps(
  analysisId: string,
  userId: string,
  gaps: SkillGapRow[],
  skillResults: SkillResultRow[],
): RoadmapItemInsert[] {
  if (!gaps || gaps.length === 0) return [];

  // Buat map untuk lookup evidence dari analysis_skill_results
  const evidenceMap = new Map(
    skillResults.map((s) => [s.skill_name, s.evidence_summary]),
  );

  const items: RoadmapItemInsert[] = [];
  let sortOrder = 1;

  // Urutkan gap berdasarkan besaran gap (descending), lalu prioritas
  const sortedGaps = [...gaps].sort((a, b) => b.gap_score - a.gap_score);

  for (const gap of sortedGaps) {
    // Abaikan jika gap score 0 (sudah memenuhi syarat)
    if (gap.gap_score <= 0) continue;

    // 1. Map Priority (DB: tinggi/sedang/rendah -> Target DB: high/medium/low/critical)
    let mappedPriority: RoadmapItemInsert["priority"] = "low";
    if (gap.priority === "tinggi") mappedPriority = "high";
    else if (gap.priority === "sedang") mappedPriority = "medium";

    // Jika gap sangat besar (misal > 2 level), naikkan ke critical
    if (gap.gap_score >= 2) mappedPriority = "critical";

    // 2. Susun Deskripsi
    const evidence =
      evidenceMap.get(gap.skill_name) || "Belum ada bukti spesifik.";
    const description = [
      gap.explanation ||
        `Tingkatkan kemampuan ${gap.skill_name} dari level ${gap.current_level} ke ${gap.required_level}.`,
      `\nTarget Level: ${gap.required_level} (Saat ini: ${gap.current_level})`,
      `\nBukti Evaluasi: ${evidence}`,
    ].join("");

    items.push({
      analysis_id: analysisId,
      user_id: userId,
      skill_id: null, // Sesuai instruksi: boleh NULL
      title: `Tingkatkan ${gap.skill_name}`,
      description: description,
      resource_url: null, // Sesuai instruksi: boleh NULL
      priority: mappedPriority,
      status: "not_started", // Sesuai instruksi
      sort_order: sortOrder++,
    });
  }

  return items;
}
