
import { createClient } from "@/lib/supabase/server";
import type { AnalysisHistoryEntry, HistoryRoleId } from "@/types/history";
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

  if (normalized.includes("data analyst") || normalized.includes("data analyst")) {
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
} {
  if (!value) {
    return { date: "", dateLabel: "Belum tersedia" };
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return { date: "", dateLabel: "Belum tersedia" };
  }

  return {
    date: parsed.toISOString().slice(0, 10),
    dateLabel: new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "Asia/Jakarta",
    }).format(parsed),
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

function getHistoryIcon(
  roleId: HistoryRoleId,
): AnalysisHistoryEntry["icon"] {
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

  const entries: AnalysisHistoryEntry[] = (data ?? []).map((row) => {
    const role = getRoleInfo(row.target_role);
    const formattedDate = formatDate(row.created_at);

    return {
      id: row.id,
      projectName: role.roleLabel === "Belum ditentukan"
        ? "Analisis baru"
        : `Analisis ${role.roleLabel}`,
      roleId: role.roleId,
      roleLabel: role.roleLabel,
      technologies: [],
      date: formattedDate.date,
      dateLabel: formattedDate.dateLabel,
      match: row.readiness_score,
      status: getStatusLabel(row.status),
      icon: getHistoryIcon(role.roleId),
      summary: row.summary,
    };
  });

  return <AnalysisHistoryClient entries={entries} />;
}
