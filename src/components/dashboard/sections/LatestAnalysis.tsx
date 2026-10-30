import Link from "next/link";
import DashboardEmptyState from "@/components/dashboard/DashboardEmptyState";
import { createClient } from "@/lib/supabase/server";
import { analysisRoutes } from "@/data/analysis";
import { HISTORY_ROUTE } from "@/data/workspace";

type LatestSkillGap = {
  skill_name: string | null;
  current_level: number | null;
  required_level: number | null;
  gap_score: number | null;
};

function uniqueSkillNames(rows: LatestSkillGap[]) {
  const seen = new Set<string>();

  return rows.reduce<string[]>((names, row) => {
    const name = row.skill_name?.trim();
    const key = name?.toLocaleLowerCase("id-ID");

    if (name && key && !seen.has(key)) {
      seen.add(key);
      names.push(name);
    }

    return names;
  }, []);
}

export default async function LatestAnalysis() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: analysis, error: analysisError } = user
    ? await supabase
        .from("analyses")
        .select("id, status, readiness_score, summary, created_at, target_role")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle()
    : { data: null, error: null };

  const { data: skillGapRows, error: skillGapError } =
    user && analysis?.status === "completed"
      ? await supabase
          .from("skill_gaps")
          .select("skill_name, current_level, required_level, gap_score")
          .eq("user_id", user.id)
          .eq("analysis_id", analysis.id)
      : { data: [], error: null };

  const skillGaps = (skillGapRows ?? []) as LatestSkillGap[];
  const strengths = uniqueSkillNames(
    [...skillGaps]
      .filter((skill) => {
        const currentLevel = Number(skill.current_level);
        const requiredLevel = Number(skill.required_level);

        return (
          Number.isFinite(currentLevel) &&
          Number.isFinite(requiredLevel) &&
          requiredLevel > 0 &&
          currentLevel >= requiredLevel
        );
      })
      .sort(
        (first, second) =>
          Number(second.current_level) - Number(first.current_level),
      ),
  ).slice(0, 5);
  const developmentAreas = uniqueSkillNames(
    [...skillGaps]
      .filter((skill) => Number(skill.gap_score) > 0)
      .sort(
        (first, second) =>
          Number(second.gap_score) - Number(first.gap_score),
      ),
  ).slice(0, 5);

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

      {analysisError ? (
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
            <p className="bkd-analysisSummaryLabel">Ringkasan penilaian</p>
            <p className="bkd-analysisSummary">
              {analysis.summary || "Ringkasan analisis belum tersedia."}
            </p>

            <div className="bkd-analysisMeta">
              {dateLabel && <span>Terakhir dianalisis: {dateLabel}</span>}
              <span>Status: {analysis.status || "Belum diketahui"}</span>
            </div>

            <Link
              className="bkd-analysisDetailLink"
              href={analysisRoutes.resultFor(analysis.id)}
            >
              Lihat hasil lengkap
            </Link>
          </div>

          <div className="bkd-skillsCard">
            <div className="bkd-skillStatus">
              <h3>Kemampuan unggul</h3>
              {skillGapError ? (
                <p role="alert">Data kemampuan belum dapat dimuat.</p>
              ) : strengths.length > 0 ? (
                <ul className="bkd-skillPointList">
                  {strengths.map((skill) => (
                    <li key={skill}>{skill}</li>
                  ))}
                </ul>
              ) : (
                <p>Belum ada kemampuan yang memenuhi level target.</p>
              )}
            </div>

            <div className="bkd-skillStatus">
              <h3>Area pengembangan</h3>
              {skillGapError ? (
                <p role="alert">Data area pengembangan belum dapat dimuat.</p>
              ) : developmentAreas.length > 0 ? (
                <ul className="bkd-skillPointList">
                  {developmentAreas.map((skill) => (
                    <li key={skill}>{skill}</li>
                  ))}
                </ul>
              ) : (
                <p>Belum ada skill gap yang perlu dikembangkan.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
