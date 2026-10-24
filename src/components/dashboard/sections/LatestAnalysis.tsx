import Link from "next/link";
import DashboardEmptyState from "@/components/dashboard/DashboardEmptyState";
import { createClient } from "@/lib/supabase/server";
import { analysisRoutes } from "@/data/analysis";
import { HISTORY_ROUTE } from "@/data/workspace";

export default async function LatestAnalysis() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: analysis, error } = user
    ? await supabase
        .from("analyses")
        .select("id, status, readiness_score, summary, created_at, target_role")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle()
    : { data: null, error: null };

  const score = analysis?.readiness_score ?? null;
  const role = analysis?.target_role?.trim() || "Target role belum ditentukan";
  const dateLabel = analysis?.created_at
    ? new Intl.DateTimeFormat("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "Asia/Jakarta",
      }).format(new Date(analysis.created_at))
    : null;

  return (
    <section
      className="bkd-panel bkd-analysis"
      aria-labelledby="judul-ringkasan-analisis"
    >
      <div className="bkd-panelHeading">
        <h2 id="judul-ringkasan-analisis">Ringkasan Analisis Terbaru</h2>
        <Link className="bkd-panelLink" href={HISTORY_ROUTE}>
          Lihat Semua
        </Link>
      </div>

      {error ? (
        <p role="alert">
          Ringkasan analisis belum dapat dimuat. Silakan muat ulang halaman.
        </p>
      ) : !analysis ? (
        <DashboardEmptyState
          icon="analysis"
          title="Belum ada analisis"
          description="Mulai analisis pertamamu untuk melihat ringkasan kompetensi dan kesiapan karier di sini."
          actionLabel="Mulai analisis"
          actionHref={analysisRoutes.uploadProject}
        />
      ) : (
        <div className="bkd-analysisBody">
          <div className="bkd-scoreCard">
            <div
              className="bkd-scoreRing"
              style={{ "--bkd-score": `${score ?? 0}%` } as React.CSSProperties}
              role={score === null ? "img" : "progressbar"}
              aria-label={
                score === null
                  ? "Skor kesiapan belum tersedia"
                  : `Skor kesiapan ${score} persen`
              }
              aria-valuemin={score === null ? undefined : 0}
              aria-valuemax={score === null ? undefined : 100}
              aria-valuenow={score ?? undefined}
            >
              <div>
                <strong>{score === null ? "—" : `${score}%`}</strong>
                <small>Skor Kesiapan</small>
              </div>
            </div>

            <h3>{role}</h3>
            <p>{analysis.summary || "Ringkasan analisis belum tersedia."}</p>

            {dateLabel && <p>Terakhir dianalisis: {dateLabel}</p>}
            <p>Status: {analysis.status || "Belum diketahui"}</p>
          </div>

          <div className="bkd-skillsCard">
            <h3>Kemampuan unggul</h3>
            <p>
              Data kemampuan unggul belum tersedia pada ringkasan analisis ini.
            </p>

            <h3>Pengembangan Kemampuan</h3>
            <p>
              Data kemampuan yang perlu dikembangkan belum tersedia pada
              ringkasan analisis ini.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
