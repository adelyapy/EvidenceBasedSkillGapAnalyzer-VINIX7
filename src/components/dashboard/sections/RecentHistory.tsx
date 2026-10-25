import Link from "next/link";
import type { CSSProperties } from "react";
import DashboardEmptyState from "@/components/dashboard/DashboardEmptyState";
import WorkspaceIcon from "@/components/workspace/WorkspaceIcon";
import { analysisRoutes } from "@/data/analysis";
import { HISTORY_ROUTE } from "@/data/workspace";
import { createClient } from "@/lib/supabase/server";

type RecentScoreStyle = CSSProperties & {
  "--bkd-recent-score": string;
};

function statusLabel(status: string | null) {
  const labels: Record<string, string> = {
    draft: "Draf",
    submitted: "Menunggu proses",
    processing: "Sedang diproses",
    awaiting_answers: "Menunggu jawaban",
    completed: "Selesai",
    failed: "Gagal diproses",
  };

  return labels[status ?? ""] ?? status ?? "Belum diketahui";
}

function formatDate(value: string | null) {
  if (!value) return "Belum tersedia";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Belum tersedia";

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(date);
}

export default async function RecentHistory() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: analyses, error } = user
    ? await supabase
        .from("analyses")
        .select("id, target_role, status, readiness_score, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(2)
    : { data: [], error: null };

  return (
    <section className="bkd-panel bkd-history" aria-labelledby="judul-riwayat">
      <div className="bkd-panelHeading">
        <h2 id="judul-riwayat">
          <WorkspaceIcon name="history" size={18} /> Riwayat Analisis Terbaru
        </h2>
        <Link className="bkd-panelLink" href={HISTORY_ROUTE}>
          Lihat Semua
        </Link>
      </div>

      {error ? (
        <p className="bkd-historyError" role="alert">
          Riwayat analisis belum dapat dimuat. Silakan muat ulang halaman.
        </p>
      ) : analyses && analyses.length > 0 ? (
        <ol className="bkd-recentHistoryList">
          {analyses.map((analysis) => {
            const score = analysis.readiness_score;
            const role =
              analysis.target_role?.trim() || "Target role belum ditentukan";

            return (
              <li key={analysis.id}>
                <span className="bkd-recentHistoryIcon" aria-hidden="true">
                  <WorkspaceIcon name="analysis" size={22} />
                </span>

                <div className="bkd-recentHistoryCopy">
                  <h3>Analisis {role}</h3>
                  <p>{formatDate(analysis.created_at)}</p>
                  <span className="bkd-recentHistoryStatus">
                    {statusLabel(analysis.status)}
                  </span>
                </div>

                <div
                  className={`bkd-recentHistoryScore${
                    score === null ? " bkd-recentHistoryScore--empty" : ""
                  }`}
                  style={
                    { "--bkd-recent-score": `${score ?? 0}%` } as RecentScoreStyle
                  }
                  aria-label={
                    score === null
                      ? "Skor kesiapan belum tersedia"
                      : `Skor kesiapan ${score} persen`
                  }
                >
                  <div className="bkd-recentHistoryScoreRing">
                    <div>
                      <strong>{score === null ? "—" : `${score}%`}</strong>
                    </div>
                  </div>
                  <span>Skor kesiapan</span>
                </div>
              </li>
            );
          })}
        </ol>
      ) : (
        <DashboardEmptyState
          icon="history"
          title="Belum ada riwayat analisis"
          description="Analisis yang telah selesai akan tersimpan dan dapat kamu lihat kembali dari bagian ini."
          actionLabel="Mulai analisis"
          actionHref={analysisRoutes.uploadProject}
        />
      )}
    </section>
  );
}
