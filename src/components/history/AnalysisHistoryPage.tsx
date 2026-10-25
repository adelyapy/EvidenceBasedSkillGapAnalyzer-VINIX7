import { createClient } from "@/lib/supabase/server";
import type {
  AnalysisHistoryEntry,
  HistoryProjectEvidence,
  HistoryRoadmapItem,
  HistoryRoleId,
  HistorySkillGap,
  HistorySkillResult,
} from "@/types/history";
import AnalysisHistoryClient from "./AnalysisHistoryClient";

function getRoleInfo(targetRole: string | null): {
  roleId: HistoryRoleId;
  roleLabel: string;
} {
  const normalized = (targetRole ?? "").trim().toLowerCase();

  if (normalized.includes("frontend")) {
    return { roleId: "frontend", roleLabel: "Frontend Developer" };
  }

  if (normalized.includes("full stack") || normalized.includes("full-stack")) {
    return { roleId: "full-stack", roleLabel: "Full Stack Developer" };
  }

  if (
    normalized.includes("data analyst") ||
    normalized.includes("data analyst")
  ) {
    return { roleId: "data-analyst", roleLabel: "Data Analyst" };
  }

  if (normalized.includes("mobile")) {
    return { roleId: "mobile", roleLabel: "Mobile Developer" };
  }

  return {
    roleId: "other",
    roleLabel: targetRole?.trim() || "Belum ditentukan",
  };
}

function formatDate(value: string | null): {
  date: string;
  dateLabel: string;
  dateTimeLabel: string;
} {
  if (!value) {
    return {
      date: "",
      dateLabel: "Belum tersedia",
      dateTimeLabel: "Belum tersedia",
    };
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return {
      date: "",
      dateLabel: "Belum tersedia",
      dateTimeLabel: "Belum tersedia",
    };
  }

  return {
    date: parsed.toISOString().slice(0, 10),
    dateLabel: new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "Asia/Jakarta",
    }).format(parsed),
    dateTimeLabel: parsed.toLocaleString("id-ID"),
  };
}

function getStatusLabel(status: string | null): string {
  switch ((status ?? "").toLowerCase()) {
    case "completed":
    case "complete":
    case "success":
    case "selesai":
      return "Selesai";
    case "processing":
    case "in_progress":
    case "analyzing":
      return "Sedang diproses";
    case "failed":
    case "error":
      return "Gagal";
    case "draft":
      return "Draft";
    default:
      return status || "Belum diketahui";
  }
}

function getHistoryIcon(roleId: HistoryRoleId): AnalysisHistoryEntry["icon"] {
  switch (roleId) {
    case "frontend":
      return "portfolio";
    case "full-stack":
      return "commerce";
    case "data-analyst":
      return "analytics";
    case "mobile":
      return "mobile";
    default:
      return "portfolio";
  }
}

export default async function AnalysisHistoryPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <AnalysisHistoryClient entries={[]} />;
  }

  const { data, error } = await supabase
    .from("analyses")
    .select("id, status, readiness_score, summary, created_at, target_role")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Gagal mengambil riwayat analisis:", error.message);

    return <AnalysisHistoryClient entries={[]} loadError />;
  }

  const analysisIds = (data ?? []).map((row) => row.id);
  const emptyDetails = {
    evidences: [] as HistoryProjectEvidence[],
    skillResults: [] as HistorySkillResult[],
    skillGaps: [] as HistorySkillGap[],
    roadmapItems: [] as HistoryRoadmapItem[],
  };

  const detailsByAnalysisId = new Map<string, typeof emptyDetails>();

  if (analysisIds.length > 0) {
    const [evidencesResponse, skillsResponse, gapsResponse, roadmapResponse] =
      await Promise.all([
      supabase
        .from("project_evidences")
        .select("id, analysis_id, evidence_type, title, url, description")
        .eq("user_id", user.id)
        .in("analysis_id", analysisIds)
        .order("created_at", { ascending: true }),
      supabase
        .from("analysis_skill_results")
        .select(
          "id, analysis_id, skill_name, estimated_level, confidence_score, evidence_summary",
        )
        .eq("user_id", user.id)
        .in("analysis_id", analysisIds)
        .order("skill_name", { ascending: true }),
      supabase
        .from("skill_gaps")
        .select(
          "id, analysis_id, skill_name, current_level, required_level, gap_score, priority, explanation",
        )
        .eq("user_id", user.id)
        .in("analysis_id", analysisIds)
        .order("gap_score", { ascending: false }),
      supabase
        .from("roadmap_items")
        .select(
          "id, analysis_id, title, description, resource_url, priority, status, sort_order",
        )
        .eq("user_id", user.id)
        .in("analysis_id", analysisIds)
        .order("sort_order", { ascending: true }),
      ]);

    for (const analysisId of analysisIds) {
      detailsByAnalysisId.set(analysisId, {
        evidences: [],
        skillResults: [],
        skillGaps: [],
        roadmapItems: [],
      });
    }

    if (!evidencesResponse.error) {
      for (const evidence of evidencesResponse.data ?? []) {
        const details = detailsByAnalysisId.get(evidence.analysis_id);
        if (!details) continue;

        details.evidences.push({
          id: evidence.id,
          evidenceType: evidence.evidence_type,
          title: evidence.title,
          url: evidence.url,
          description: evidence.description,
        });
      }
    }

    if (!skillsResponse.error) {
      for (const skill of skillsResponse.data ?? []) {
        const details = detailsByAnalysisId.get(skill.analysis_id);
        if (!details) continue;

        details.skillResults.push({
          id: skill.id,
          skillName: skill.skill_name,
          estimatedLevel: skill.estimated_level,
          confidenceScore: skill.confidence_score,
          evidenceSummary: skill.evidence_summary,
        });
      }
    }

    if (!gapsResponse.error) {
      for (const gap of gapsResponse.data ?? []) {
        const details = detailsByAnalysisId.get(gap.analysis_id);
        if (!details) continue;

        details.skillGaps.push({
          id: gap.id,
          skillName: gap.skill_name,
          currentLevel: gap.current_level,
          requiredLevel: gap.required_level,
          gapScore: gap.gap_score,
          priority: gap.priority,
          explanation: gap.explanation,
        });
      }
    }

    if (!roadmapResponse.error) {
      for (const item of roadmapResponse.data ?? []) {
        const details = detailsByAnalysisId.get(item.analysis_id);
        if (!details) continue;

        details.roadmapItems.push({
          id: item.id,
          title: item.title,
          description: item.description,
          resourceUrl: item.resource_url,
          priority: item.priority,
          status: item.status,
          sortOrder: item.sort_order,
        });
      }
    }
  }

  const entries: AnalysisHistoryEntry[] = (data ?? []).map((row) => {
    const role = getRoleInfo(row.target_role);
    const formattedDate = formatDate(row.created_at);

    return {
      id: row.id,
      projectName:
        role.roleLabel === "Belum ditentukan"
          ? "Analisis baru"
          : `Analisis ${role.roleLabel}`,
      roleId: role.roleId,
      roleLabel: role.roleLabel,
      technologies: [],
      date: formattedDate.date,
      dateLabel: formattedDate.dateLabel,
      dateTimeLabel: formattedDate.dateTimeLabel,
      match: row.readiness_score,
      status: getStatusLabel(row.status),
      statusKey: row.status ?? "",
      icon: getHistoryIcon(role.roleId),
      summary: row.summary,
      ...(detailsByAnalysisId.get(row.id) ?? emptyDetails),
    };
  });

  return <AnalysisHistoryClient entries={entries} />;
}
