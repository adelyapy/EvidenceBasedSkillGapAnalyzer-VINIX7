"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { analysisRoutes, analysisStorage } from "@/data/analysis";
import { createClient } from "@/lib/supabase/client";

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
      <header className="bkr-intro">
        <div>
          <h1 id="bkr-title">Hasil Analisis Anda</h1>
          <p>
            Informasi analisis dan bukti proyek yang tersimpan pada akun Anda.
          </p>
        </div>
      </header>

      {loading && <p role="status">Memuat data analisis...</p>}

      {!loading && error && (
        <section className="bkr-panel" role="alert">
          <h2>Data analisis belum dapat ditampilkan</h2>
          <p>{error}</p>
          <Link href={analysisRoutes.uploadProject}>Mulai analisis baru</Link>
        </section>
      )}

      {!loading && !error && analysis && (
        <>
          <section className="bkr-panel" aria-labelledby="bkr-overview-title">
            <h2 id="bkr-overview-title">Ringkasan Analisis</h2>
            <p>
              <strong>Target role:</strong> {analysis.target_role}
            </p>
            <p>
              <strong>Status:</strong> {statusLabel(analysis.status)}
            </p>
            <p>
              <strong>Tanggal dibuat:</strong>{" "}
              {new Date(analysis.created_at).toLocaleString("id-ID")}
            </p>

            {analysis.status === "completed" &&
            analysis.readiness_score !== null ? (
              <p>
                <strong>Skor kesiapan:</strong>{" "}
                {Number(analysis.readiness_score)}%
              </p>
            ) : (
              <p>
                Skor kesiapan belum tersedia. Skor akan ditampilkan setelah
                proses analisis benar-benar selesai dan hasilnya tersimpan.
              </p>
            )}

            {analysis.status === "completed" && analysis.summary && (
              <p>{analysis.summary}</p>
            )}

            {analysis.status === "failed" && (
              <p>
                Analisis ini berstatus gagal. Periksa proses analisis sebelum
                mencoba kembali.
              </p>
            )}
          </section>

          <section className="bkr-panel bkr-projectPanel">
            <h2>Bukti Proyek</h2>

            {evidences.length === 0 ? (
              <p>Belum ada bukti proyek yang tersimpan untuk analisis ini.</p>
            ) : (
              <ul>
                {evidences.map((evidence) => (
                  <li key={evidence.id}>
                    <div>
                      <strong>{evidence.title || "Bukti proyek"}</strong>
                      <p>Jenis bukti: {evidence.evidence_type}</p>

                      {evidence.description && <p>{evidence.description}</p>}

                      {evidence.url && (
                        <p>
                          <a
                            href={evidence.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Buka bukti proyek
                          </a>
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {analysis.status === "completed" && (
            <>
              <section className="bkr-panel" aria-labelledby="bkr-skills-title">
                <h2 id="bkr-skills-title">Hasil Evaluasi Kompetensi</h2>

                {resultError ? (
                  <p role="alert">{resultError}</p>
                ) : skillResults.length === 0 ? (
                  <p>
                    Belum ada data kompetensi yang tersimpan untuk analisis ini.
                  </p>
                ) : (
                  <ul>
                    {skillResults.map((skill) => (
                      <li key={skill.id}>
                        <div>
                          <strong>
                            {skill.skill_name || "Keterampilan tidak bernama"}
                          </strong>
                          <p>
                            <strong>Estimasi tingkat:</strong>{" "}
                            {formatLevel(skill.estimated_level)}
                          </p>
                          <p>
                            <strong>Keyakinan AI:</strong>{" "}
                            {formatConfidence(skill.confidence_score)}
                          </p>
                          <p>
                            <strong>Bukti pendukung:</strong>{" "}
                            {skill.evidence_summary ||
                              "Belum ada ringkasan bukti yang tersedia."}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <section className="bkr-panel" aria-labelledby="bkr-gaps-title">
                <h2 id="bkr-gaps-title">Kesenjangan Keterampilan</h2>

                {resultError ? (
                  <p>Data skill gap belum dapat ditampilkan.</p>
                ) : skillGaps.length === 0 ? (
                  <p>
                    Belum ada data skill gap yang tersimpan untuk analisis ini.
                  </p>
                ) : (
                  <ul>
                    {skillGaps.map((gap) => (
                      <li key={gap.id}>
                        <div>
                          <strong>
                            {gap.skill_name || "Keterampilan tidak bernama"}
                          </strong>
                          <p>
                            <strong>Tingkat saat ini:</strong>{" "}
                            {formatLevel(gap.current_level)}
                          </p>
                          <p>
                            <strong>Tingkat yang dibutuhkan:</strong>{" "}
                            {formatLevel(gap.required_level)}
                          </p>
                          <p>
                            <strong>Skor kesenjangan:</strong>{" "}
                            {Number(gap.gap_score).toLocaleString("id-ID")}
                          </p>
                          <p>
                            <strong>Prioritas:</strong>{" "}
                            {priorityLabel(gap.priority)}
                          </p>
                          <p>
                            <strong>Penjelasan:</strong>{" "}
                            {gap.explanation ||
                              "Belum ada penjelasan yang tersedia."}
                          </p>
                        </div>
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

      <nav
        className="bkr-actions bkr-screenOnly"
        aria-label="Navigasi hasil analisis"
      >
        <Link href={analysisRoutes.uploadProject}>Mulai analisis baru</Link>
        <Link href="/workspace/dashboard">Kembali ke Dashboard</Link>
      </nav>
    </article>
  );
}
