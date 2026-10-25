"use client";

import Link from "next/link";
import { useEffect, useState, type CSSProperties } from "react";
import { analysisRoutes, analysisStorage } from "@/data/analysis";
import { createClient } from "@/lib/supabase/client";
import PrintAnalysisReportButton from "./PrintAnalysisReportButton";

type AnalysisRecord = {
  id: string;
  target_role: string;
  status: string;
  readiness_score: number | null;
  summary: string | null;
  created_at: string;
};

type ProjectEvidence = {
  id: string;
  evidence_type: string;
  title: string | null;
  url: string | null;
  description: string | null;
  created_at: string;
};

type SkillResult = {
  id: string;
  skill_name: string | null;
  estimated_level: number | null;
  confidence_score: number | null;
  evidence_summary: string | null;
};

type SkillGap = {
  id: string;
  skill_name: string | null;
  current_level: number | null;
  required_level: number;
  gap_score: number;
  priority: string;
  explanation: string | null;
};

function statusLabel(status: string) {
  const labels: Record<string, string> = {
    draft: "Draf",
    submitted: "Menunggu proses analisis",
    processing: "Sedang diproses",
    awaiting_answers: "Menunggu jawaban validasi",
    completed: "Selesai",
    failed: "Gagal diproses",
  };

  return labels[status] ?? status;
}

function priorityLabel(priority: string) {
  const labels: Record<string, string> = {
    low: "Rendah",
    medium: "Sedang",
    high: "Tinggi",
    critical: "Kritis",
  };

  return labels[priority] ?? priority;
}

function formatLevel(level: number | null) {
  if (level === null || !Number.isFinite(Number(level))) {
    return "Belum dapat dinilai";
  }

  return `${Number(level).toLocaleString("id-ID")} / 5`;
}

function formatConfidence(score: number | null) {
  if (score === null || !Number.isFinite(Number(score))) {
    return "Tidak tersedia";
  }

  const value = Number(score);
  const percentage = value <= 1 ? value * 100 : value;

  return `${Math.round(percentage)}%`;
}

export default function AnalysisResultPage() {
  const [analysis, setAnalysis] = useState<AnalysisRecord | null>(null);
  const [evidences, setEvidences] = useState<ProjectEvidence[]>([]);
  const [skillResults, setSkillResults] = useState<SkillResult[]>([]);
  const [skillGaps, setSkillGaps] = useState<SkillGap[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [resultError, setResultError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadAnalysis() {
      try {
        const analysisId = sessionStorage.getItem(
          analysisStorage.activeAnalysisId,
        );

        if (!analysisId) {
          throw new Error(
            "Analisis aktif tidak ditemukan. Silakan mulai analisis baru.",
          );
        }

        const supabase = createClient();

        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          throw new Error(
            "Sesi pengguna tidak ditemukan. Silakan login kembali.",
          );
        }

        const { data, error: analysisError } = await supabase
          .from("analyses")
          .select(
            "id, target_role, status, readiness_score, summary, created_at",
          )
          .eq("id", analysisId)
          .eq("user_id", user.id)
          .maybeSingle();

        if (analysisError) throw analysisError;

        if (!data) {
          throw new Error(
            "Data analisis tidak ditemukan atau Anda tidak memiliki akses.",
          );
        }

        const { data: evidenceData, error: evidenceError } = await supabase
          .from("project_evidences")
          .select("id, evidence_type, title, url, description, created_at")
          .eq("analysis_id", analysisId)
          .eq("user_id", user.id)
          .order("created_at", { ascending: true });

        if (evidenceError) throw evidenceError;

        let skills: SkillResult[] = [];
        let gaps: SkillGap[] = [];
        let resultLoadError = "";

        if (data.status === "completed") {
          const [skillsResponse, gapsResponse] = await Promise.all([
            supabase
              .from("analysis_skill_results")
              .select(
                "id, skill_name, estimated_level, confidence_score, evidence_summary",
              )
              .eq("analysis_id", analysisId)
              .eq("user_id", user.id)
              .order("skill_name", { ascending: true }),

            supabase
              .from("skill_gaps")
              .select(
                "id, skill_name, current_level, required_level, gap_score, priority, explanation",
              )
              .eq("analysis_id", analysisId)
              .eq("user_id", user.id)
              .order("gap_score", { ascending: false }),
          ]);

          if (skillsResponse.error || gapsResponse.error) {
            resultLoadError =
              "Hasil kompetensi atau skill gap gagal diambil dari database. Periksa izin akses tabel dan kolomnya.";
          } else {
            skills = (skillsResponse.data ?? []) as SkillResult[];
            gaps = (gapsResponse.data ?? []) as SkillGap[];
          }
        }

        if (cancelled) return;

        setAnalysis(data as AnalysisRecord);
        setEvidences((evidenceData ?? []) as ProjectEvidence[]);
        setSkillResults(skills);
        setSkillGaps(gaps);
        setResultError(resultLoadError);
      } catch (cause) {
        if (!cancelled) {
          setError(
            cause instanceof Error
              ? cause.message
              : "Terjadi kesalahan saat mengambil data analisis.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadAnalysis();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <article className="bkr-page" aria-labelledby="bkr-title">
      <header className="bkr-intro bkr-resultIntro">
        <div>
          <p className="bkr-eyebrow">Ringkasan personal</p>
          <h1 id="bkr-title">Hasil Analisis Anda</h1>
          <p>
            Pahami kekuatan, area pengembangan, dan bukti proyek Anda dalam satu ringkasan.
          </p>
        </div>
        {analysis && <PrintAnalysisReportButton />}
      </header>

      {loading && (
        <section className="bkr-loading" role="status" aria-live="polite">
          <span /><span /><span />
          <p>Menyiapkan hasil analisis Anda...</p>
        </section>
      )}

      {!loading && error && (
        <section className="bkr-panel bkr-errorPanel" role="alert">
          <h2>Data analisis belum dapat ditampilkan</h2>
          <p>{error}</p>
          <Link className="bkr-actionButton bkr-actionButton--primary" href={analysisRoutes.uploadProject}>Mulai analisis baru</Link>
        </section>
      )}

      {!loading && !error && analysis && (
        <>
          <section className="bkr-overview" aria-labelledby="bkr-overview-title">
            <div className="bkr-overviewCopy">
              <p className="bkr-sectionEyebrow">Gambaran utama</p>
              <h2 id="bkr-overview-title">{analysis.target_role}</h2>
              <p className="bkr-summaryText">
                {analysis.status === "completed" && analysis.summary
                  ? analysis.summary
                  : analysis.status === "failed"
                    ? "Analisis ini gagal diproses. Silakan mulai analisis baru setelah memeriksa data proyek Anda."
                    : "Hasil lengkap akan tersedia setelah proses analisis selesai dan tersimpan."}
              </p>
              <dl className="bkr-metaGrid">
                <div><dt>Dibuat pada</dt><dd>{new Date(analysis.created_at).toLocaleString("id-ID")}</dd></div>
                <div><dt>Status</dt><dd>{statusLabel(analysis.status)}</dd></div>
              </dl>
            </div>
            <div className="bkr-readinessCard">
              <div
                className={`bkr-readinessRing${analysis.status !== "completed" || analysis.readiness_score === null ? " bkr-readinessRing--empty" : ""}`}
                style={{ "--bkr-readiness": `${analysis.status === "completed" && analysis.readiness_score !== null ? Number(analysis.readiness_score) : 0}%` } as CSSProperties}
                aria-label={analysis.status === "completed" && analysis.readiness_score !== null ? `Skor kesiapan ${Number(analysis.readiness_score)} persen` : "Skor kesiapan belum tersedia"}
              >
                <div>
                  <span>Skor kesiapan</span>
                  <strong>{analysis.status === "completed" && analysis.readiness_score !== null ? `${Number(analysis.readiness_score)}%` : "—"}</strong>
                </div>
              </div>
              <small>{analysis.readiness_score === null ? "Belum tersedia" : "Estimasi berdasarkan bukti dan jawaban"}</small>
            </div>
          </section>

          <section className="bkr-section bkr-evidencePanel" aria-labelledby="bkr-evidence-title">
            <div className="bkr-sectionHeading"><div><p className="bkr-sectionEyebrow">Dasar penilaian</p><h2 id="bkr-evidence-title">Bukti Proyek</h2></div><span>{evidences.length} bukti</span></div>

            {evidences.length === 0 ? (
              <p className="bkr-emptyCopy">Belum ada bukti proyek yang tersimpan untuk analisis ini.</p>
            ) : (
              <ul className="bkr-evidenceList">
                {evidences.map((evidence) => (
                  <li key={evidence.id}>
                    <div className="bkr-evidenceIcon" aria-hidden="true">↗</div>
                    <div>
                      <strong>{evidence.title || "Bukti proyek"}</strong>
                      <span>Jenis: {evidence.evidence_type}</span>
                      {evidence.description && <p>{evidence.description}</p>}
                      {evidence.url && (
                        <a href={evidence.url} target="_blank" rel="noopener noreferrer">Buka bukti proyek ↗</a>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {analysis.status === "completed" && (
            <>
              <section className="bkr-section bkr-competencyPanel" aria-labelledby="bkr-skills-title">
                <div className="bkr-sectionHeading"><div><p className="bkr-sectionEyebrow">Kekuatan saat ini</p><h2 id="bkr-skills-title">Evaluasi Kompetensi</h2></div></div>

                {resultError ? (
                  <p className="bkr-emptyCopy" role="alert">{resultError}</p>
                ) : skillResults.length === 0 ? (
                  <p className="bkr-emptyCopy">Belum ada data kompetensi yang tersimpan untuk analisis ini.</p>
                ) : (
                  <ul className="bkr-resultCards">
                    {skillResults.map((skill) => (
                      <li key={skill.id}>
                        <div className="bkr-cardTop"><strong>{skill.skill_name || "Keterampilan tidak bernama"}</strong><span>{formatLevel(skill.estimated_level)}</span></div>
                        <p><b>Keyakinan AI</b> {formatConfidence(skill.confidence_score)}</p>
                        <p className="bkr-cardDescription">{skill.evidence_summary || "Belum ada ringkasan bukti yang tersedia."}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <section className="bkr-section bkr-gapPanel" aria-labelledby="bkr-gaps-title">
                <div className="bkr-sectionHeading"><div><p className="bkr-sectionEyebrow">Fokus pengembangan</p><h2 id="bkr-gaps-title">Kesenjangan Keterampilan</h2></div></div>

                {resultError ? (
                  <p className="bkr-emptyCopy">Data skill gap belum dapat ditampilkan.</p>
                ) : skillGaps.length === 0 ? (
                  <p className="bkr-emptyCopy">Belum ada data skill gap yang tersimpan untuk analisis ini.</p>
                ) : (
                  <ul className="bkr-resultCards">
                    {skillGaps.map((gap) => (
                      <li key={gap.id}>
                        <div className="bkr-cardTop"><strong>{gap.skill_name || "Keterampilan tidak bernama"}</strong><span className={`bkr-priority bkr-priority--${gap.priority}`}>{priorityLabel(gap.priority)}</span></div>
                        <dl className="bkr-gapStats"><div><dt>Saat ini</dt><dd>{formatLevel(gap.current_level)}</dd></div><div><dt>Target</dt><dd>{formatLevel(gap.required_level)}</dd></div><div><dt>Gap</dt><dd>{Number(gap.gap_score).toLocaleString("id-ID")}</dd></div></dl>
                        <p className="bkr-cardDescription">{gap.explanation || "Belum ada penjelasan yang tersedia."}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </>
          )}

          <aside className="bkr-demoNotice">
            {analysis.status === "completed" &&
            !resultError &&
            skillResults.length > 0 ? (
              <>
                <strong>Hasil evaluasi AI tersedia.</strong>
                <p>
                  Data kompetensi dan kesenjangan keterampilan ditampilkan
                  berdasarkan hasil evaluasi yang tersimpan. Tingkat penguasaan
                  merupakan estimasi AI berdasarkan bukti dan jawaban validasi,
                  bukan pengukuran mutlak kemampuan pengguna.
                </p>
              </>
            ) : (
              <>
                <strong>Hasil evaluasi belum lengkap.</strong>
                <p>
                  {resultError ||
                    "Data target role, bukti proyek, ringkasan, dan skor kesiapan dapat tersedia secara terpisah. Jika data kompetensi atau skill gap belum tersimpan, hasil tersebut belum dapat ditampilkan."}{" "}
                  Bukti yang belum dianalisis tidak berarti pengguna tidak
                  memiliki keterampilan tersebut.
                </p>
              </>
            )}
          </aside>
        </>
      )}

      <nav className="bkr-actions bkr-screenOnly" aria-label="Navigasi hasil analisis">
        <Link className="bkr-actionButton bkr-actionButton--secondary" href="/workspace/dashboard">← Kembali ke Dashboard</Link>
        <Link className="bkr-actionButton bkr-actionButton--primary" href={analysisRoutes.uploadProject}>Mulai analisis baru →</Link>
      </nav>
    </article>
  );
}
