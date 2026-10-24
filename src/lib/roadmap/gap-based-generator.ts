import "server-only";

type SkillGapRow = {
  skill_name: string;
  current_level: number;
  required_level: number;
  gap_score: number;
  priority: string | null;
  explanation: string | null;
};

type SkillResultRow = {
  skill_name: string;
  estimated_level: number;
  evidence_summary: string | null;
};

export type RoadmapItemInsert = {
  analysis_id: string;
  user_id: string;
  skill_id: number | null;
  title: string;
  description: string | null;
  resource_url: string | null;
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

  // 5. Pencocokan skill_name yang konsisten (case-insensitive & trim)
  const evidenceMap = new Map(
    skillResults.map((s) => [
      s.skill_name.trim().toLowerCase(),
      s.evidence_summary,
    ]),
  );

  const items: RoadmapItemInsert[] = [];
  let sortOrder = 1;

  const sortedGaps = [...gaps].sort((a, b) => b.gap_score - a.gap_score);

  for (const gap of sortedGaps) {
    if (gap.gap_score <= 0) continue;

    // 5. Validasi priority yang tidak dikenal
    let mappedPriority: RoadmapItemInsert["priority"] = "low";
    const rawPriority = (gap.priority || "").trim().toLowerCase();

    if (rawPriority === "tinggi" || rawPriority === "high")
      mappedPriority = "high";
    else if (rawPriority === "sedang" || rawPriority === "medium")
      mappedPriority = "medium";
    else if (rawPriority === "rendah" || rawPriority === "low")
      mappedPriority = "low";
    else {
      // Jika tidak dikenal (null / string aneh), default ke low tapi beri catatan di log
      console.warn(
        `⚠️ Priority tidak dikenal untuk skill "${gap.skill_name}": ${gap.priority}. Default ke "low".`,
      );
    }

    if (gap.gap_score >= 2) mappedPriority = "critical";

    const lookupKey = gap.skill_name.trim().toLowerCase();
    const evidence = evidenceMap.get(lookupKey) || "Belum ada bukti spesifik.";

    const description = [
      gap.explanation ||
        `Tingkatkan kemampuan ${gap.skill_name} dari level ${gap.current_level} ke ${gap.required_level}.`,
      `\nTarget Level: ${gap.required_level} (Saat ini: ${gap.current_level})`,
      `\nBukti Evaluasi: ${evidence}`,
    ].join("");

    items.push({
      analysis_id: analysisId,
      user_id: userId,
      skill_id: null,
      title: `Tingkatkan ${gap.skill_name}`,
      description,
      resource_url: null,
      priority: mappedPriority,
      status: "not_started",
      sort_order: sortOrder++,
    });
  }

  return items;
}
