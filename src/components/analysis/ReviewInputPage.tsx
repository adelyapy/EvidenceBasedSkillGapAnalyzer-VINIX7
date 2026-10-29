"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import AnalysisToast from "./AnalysisToast";
import AnalysisStepper from "./AnalysisStepper";
import { analysisRoutes, analysisStorage } from "@/data/analysis";
import { useAnimatedDismiss } from "@/hooks/useAnimatedDismiss";
import type {
  AnalysisCv,
  AnalysisInput,
  AnalysisProject,
} from "@/types/analysis";
import { createClient } from "@/lib/supabase/client";
import { getProjectPdf } from "@/lib/analysis/project-pdf-storage";

const EMPTY_INPUT: AnalysisInput = {
  projects: [],
  role: "",
  jobDescription: "",
  cv: null,
};

const TOAST_VISIBLE_DURATION = 3500;
const TOAST_EXIT_DURATION = 240;

function formatFileSize(size?: number) {
  if (!size) return "Ukuran tidak tersedia";
  if (size < 1024) return `${size} B`;
  return `${(size / 1024 / 1024).toFixed(2)} MB`;
}

function readInput(): AnalysisInput {
  const readJson = (key: string): unknown => {
    try {
      return JSON.parse(sessionStorage.getItem(key) || "null");
    } catch {
      return null;
    }
  };

  const rawProjects = readJson(analysisStorage.projects);
  const projects = Array.isArray(rawProjects)
    ? rawProjects.filter(
        (project): project is AnalysisProject =>
          typeof project === "object" && project !== null,
      )
    : [];
  const rawCv = readJson(analysisStorage.cv);
  const cv =
    rawCv &&
    typeof rawCv === "object" &&
    "name" in rawCv &&
    typeof rawCv.name === "string"
      ? (rawCv as AnalysisCv)
      : null;

  return {
    projects,
    role: sessionStorage.getItem(analysisStorage.targetRole) || "",
    jobDescription:
      sessionStorage.getItem(analysisStorage.jobDescription) || "",
    cv,
  };
}

function EditButton({ href, label }: { href?: string; label: string }) {
  const content = (
    <>
      <svg
        width="9"
        height="9"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.3"
        aria-hidden="true"
      >
        <path d="m15 5 4 4M4 20l4-.8L20 7a2.8 2.8 0 0 0-4-4L4 15z" />
      </svg>{" "}
      Edit
    </>
  );

  return href ? (
    <Link className="review-edit" href={href} aria-label={`Edit ${label}`}>
      {content}
    </Link>
  ) : (
    <button
      className="review-edit"
      type="button"
      disabled
      title={`${label} belum tersedia di Next.js`}
    >
      {content}
    </button>
  );
}

export default function ReviewInputPage() {
  const router = useRouter();
  const [data, setData] = useState<AnalysisInput>(EMPTY_INPUT);
  const [loaded, setLoaded] = useState(false);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [toast, setToast] = useState<{
    id: number;
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [toastLeaving, setToastLeaving] = useState(false);
  const toastId = useRef(0);
  const [saving, setSaving] = useState(false);
  const {
    isClosing: confirmationClosing,
    requestDismiss: closeConfirmation,
  } = useAnimatedDismiss({
    onDismiss: () => setConfirmationOpen(false),
    disabled: saving,
  });

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setData(readInput());
      setLoaded(true);
    }, 350);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const exitTimer = window.setTimeout(
      () => setToastLeaving(true),
      TOAST_VISIBLE_DURATION,
    );
    const removeTimer = window.setTimeout(
      () => setToast(null),
      TOAST_VISIBLE_DURATION + TOAST_EXIT_DURATION,
    );

    return () => {
      window.clearTimeout(exitTimer);
      window.clearTimeout(removeTimer);
    };
  }, [toast]);

  const hasProjects = data.projects.length > 0;
  const hasRole = Boolean(data.role.trim());
  const canAnalyze = hasProjects && hasRole;

  function showToast(type: "success" | "error", message: string) {
    toastId.current += 1;
    setToastLeaving(false);
    setToast({ id: toastId.current, type, message });
  }

  async function saveAnalysis() {
    if (saving) return;

    if (!hasProjects || !hasRole) {
      showToast(
        "error",
        "Lengkapi proyek dan target role sebelum memulai analisis.",
      );
      return;
    }

    setSaving(true);

    try {
      const supabase = createClient();

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error("Sesi login tidak ditemukan. Silakan login kembali.");
      }

      // Buat record analisis untuk pengguna yang sedang login.
      const { data: analysis, error: analysisError } = await supabase
        .from("analyses")
        .insert({
          user_id: user.id,
          target_role: data.role.trim(),
          status: "draft",
        })
        .select("id")
        .single();

      if (analysisError || !analysis) {
        throw new Error(analysisError?.message || "Gagal menyimpan analisis.");
      }

      const uploadedStoragePaths: string[] = [];

      try {
        const evidences: Array<{
          analysis_id: string;
          user_id: string;
          evidence_type: string;
          title: string;
          url: string | null;
          storage_path: string | null;
          description: string | null;
        }> = [];

        for (const rawProject of data.projects) {
          const project = rawProject as AnalysisProject & {
            id?: string;
            origin?: string;
            evidenceKind?: string;
            fileName?: string;
            fileType?: string;
          };

          if (project.evidenceKind === "pdf") {
            if (!project.id) {
              throw new Error(
                `ID dokumen PDF "${project.fileName || project.name || ""}" tidak ditemukan. Silakan kembali ke halaman upload dan pilih ulang PDF.`,
              );
            }

            const file = await getProjectPdf(project.id);
            if (!file) {
              throw new Error(
                `File PDF "${project.fileName || project.name || "bukti proyek"}" tidak ditemukan di penyimpanan browser. Silakan kembali ke halaman upload, hapus dokumen tersebut, lalu unggah ulang.`,
              );
            }

            if (
              file.type !== "application/pdf" &&
              !file.name.toLowerCase().endsWith(".pdf")
            ) {
              throw new Error(`File "${file.name}" bukan dokumen PDF yang valid.`);
            }

            const storagePath = `${user.id}/${analysis.id}/${project.id}.pdf`;
            const { error: uploadError } = await supabase.storage
              .from("project-evidences")
              .upload(storagePath, file, {
                contentType: "application/pdf",
                upsert: false,
              });

            if (uploadError) {
              throw new Error(
                `Gagal mengunggah PDF "${file.name}": ${uploadError.message}`,
              );
            }

            uploadedStoragePaths.push(storagePath);
            evidences.push({
              analysis_id: analysis.id,
              user_id: user.id,
              evidence_type: "pdf",
              title: project.fileName || project.name || file.name,
              url: null,
              storage_path: storagePath,
              description: project.description || project.deskripsi || null,
            });
            continue;
          }

          const url = (
            project.link ||
            project.url ||
            project.value ||
            ""
          ).trim();

          if (!/^https?:\/\//i.test(url)) continue;

          const source = `${project.type || ""} ${
            project.name || ""
          } ${project.title || ""}`.toLowerCase();

          let evidenceType:
            | "github"
            | "gitlab"
            | "portfolio"
            | "deployment"
            | "other" = "other";

          if (url.toLowerCase().includes("github.com")) {
            evidenceType = "github";
          } else if (url.toLowerCase().includes("gitlab.com")) {
            evidenceType = "gitlab";
          } else if (source.includes("portfolio")) {
            evidenceType = "portfolio";
          } else if (
            source.includes("deployment") ||
            source.includes("deploy")
          ) {
            evidenceType = "deployment";
          }

          evidences.push({
            analysis_id: analysis.id,
            user_id: user.id,
            evidence_type: evidenceType,
            title:
              project.name || project.title || project.type || "Bukti proyek",
            url,
            storage_path: null,
            description: project.description || project.deskripsi || null,
          });
        }

        if (evidences.length > 0) {
          const { error: evidenceError } = await supabase
            .from("project_evidences")
            .insert(evidences);

          if (evidenceError) {
            throw new Error(
              `Gagal menyimpan metadata bukti proyek: ${evidenceError.message}`,
            );
          }
        }

        // Simpan referensi analisis yang akan digunakan halaman berikutnya.
        sessionStorage.setItem(analysisStorage.activeAnalysisId, analysis.id);
      } catch (error) {
        // File Storage tidak otomatis terhapus ketika record analisis dihapus.
        if (uploadedStoragePaths.length > 0) {
          const { error: cleanupError } = await supabase.storage
            .from("project-evidences")
            .remove(uploadedStoragePaths);

          if (cleanupError) {
            console.error("Gagal membersihkan file PDF sementara:", cleanupError);
          }
        }

        await supabase
          .from("analyses")
          .delete()
          .eq("id", analysis.id)
          .eq("user_id", user.id);

        throw error;
      }

      setConfirmationOpen(false);
      router.push(analysisRoutes.process);
    } catch (error) {
      console.error("Gagal menyimpan analisis:", error);

      showToast(
        "error",
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat menyimpan analisis.",
      );
    } finally {
      setSaving(false);
    }
  }

  function startAnalysis() {
    if (!hasProjects || !hasRole) {
      showToast(
        "error",
        "Lengkapi proyek dan target role sebelum memulai analisis.",
      );
      return;
    }

    setConfirmationOpen(true);
  }

  return (
    <div className="review-main">
      <AnalysisStepper current="review" />
      <div className="review-body">
        <h1>Cek Kembali Informasi Anda</h1>
        <p className="review-subtitle">
          Pastikan semua data sudah benar sebelum memulai analisis.
        </p>

        <section
          className="review-box review-project"
          aria-labelledby="project-head"
        >
          <div className="review-box-heading">
            <h2 id="project-head">Informasi Project</h2>
            <EditButton
              href={analysisRoutes.uploadProject}
              label="informasi project"
            />
          </div>
          {!loaded ? (
            <div
              className="review-project-skeleton"
              aria-label="Memuat daftar project"
              aria-busy="true"
            >
              <span />
              <span />
              <span />
            </div>
          ) : hasProjects ? (
            <div className="review-project-list">
              {data.projects.map((project, index) => {
                const isPdf = project.evidenceKind === "pdf";
                const identifier =
                  project.link || project.url || project.value || "";
                const isLink = !isPdf && /^https?:\/\//i.test(identifier);
                const projectName =
                  project.name ||
                  project.title ||
                  (isLink
                    ? `Project ${index + 1}`
                    : project.value || `Project ${index + 1}`);
                return (
                  <div
                    className="review-project-record"
                    key={`${identifier}-${index}`}
                  >
                    {data.projects.length > 1 && (
                      <p className="review-project-count">
                        Project {index + 1}
                      </p>
                    )}
                    <div className="review-field">
                      <b>
                        {isPdf
                          ? "Dokumen PDF"
                          : isLink
                            ? "Link Project"
                            : "Sumber Project"}
                      </b>
                      <div>
                        {isPdf ? (
                          <span className="review-file">
                            {project.fileName || projectName}
                          </span>
                        ) : identifier ? (
                          isLink ? (
                            <a
                              href={identifier}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {identifier}
                            </a>
                          ) : (
                            identifier
                          )
                        ) : (
                          <span className="review-muted">Belum diisi</span>
                        )}
                      </div>
                    </div>
                    <div className="review-field">
                      <b>{isPdf ? "Ukuran File" : "Nama Project"}</b>
                      <div>
                        {isPdf ? formatFileSize(project.fileSize) : projectName}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="review-empty" role="status">
              <span className="review-empty-icon" aria-hidden="true">
                ⌁
              </span>
              <strong>Belum ada project yang ditambahkan</strong>
              <p>
                Tambahkan setidaknya satu project agar analisis dapat dimulai.
              </p>
              <Link href={analysisRoutes.uploadProject}>Tambah project</Link>
            </div>
          )}
        </section>

        <div className="review-bottom-grid">
          <section className="review-box" aria-labelledby="role-head">
            <div className="review-box-heading">
              <h2 id="role-head">Role Target</h2>
              <EditButton
                href={analysisRoutes.targetRole}
                label="target role"
              />
            </div>
            <div className="review-role-content">
              <Image
                src="/images/role-review.png"
                alt=""
                width={88}
                height={88}
                unoptimized
              />
              <div>
                {hasRole ? (
                  <>
                    <strong>{data.role}</strong>
                    <p>
                      {data.jobDescription ||
                        "Job description belum ditambahkan (opsional)."}
                    </p>
                  </>
                ) : (
                  <>
                    <strong>Belum dipilih</strong>
                    <p>Silakan pilih target role terlebih dahulu.</p>
                  </>
                )}
              </div>
            </div>
          </section>
          <section className="review-box" aria-labelledby="cv-head">
            <div className="review-box-heading">
              <h2 id="cv-head">Upload CV</h2>
              <EditButton href={analysisRoutes.uploadCv} label="CV" />
            </div>
            <div className="review-cv-content">
              <svg
                width="58"
                height="65"
                viewBox="0 0 58 65"
                aria-hidden="true"
              >
                <path
                  d="M11 2h26l15 15v42a4 4 0 0 1-4 4H11a4 4 0 0 1-4-4V6a4 4 0 0 1 4-4"
                  fill="#dcebf6"
                />
                <path d="M37 2v15h15" fill="#315a7f" />
                <path
                  d="M17 32h26M17 40h24M17 48h17"
                  stroke="#315a7f"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
              <p title={data.cv?.name}>
                {data.cv?.name || "Tidak ada CV (opsional)"}
              </p>
            </div>
          </section>
        </div>

        <div className="review-actions">
          <Link className="review-back" href={analysisRoutes.uploadCv}>
            ← Kembali
          </Link>
          <button
            type="button"
            className="review-start"
            disabled={!loaded || !canAnalyze}
            onClick={startAnalysis}
          >
            Mulai Analisis →
          </button>
        </div>
        {loaded && (!hasProjects || !hasRole) && (
          <p className="review-help">
            Tombol Mulai Analisis tersedia setelah minimal satu project dan
            target role ada. CV bersifat opsional.
          </p>
        )}
      </div>
      {toast && (
        <AnalysisToast
          key={toast.id}
          type={toast.type}
          message={toast.message}
          leaving={toastLeaving}
        />
      )}
      {confirmationOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className={`review-confirmBackdrop${
              confirmationClosing ? " review-confirmBackdrop--closing" : ""
            }`}
            role="presentation"
            onMouseDown={closeConfirmation}
          >
            <section
              className="review-confirmDialog"
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="review-confirm-title"
              aria-describedby="review-confirm-description"
              onMouseDown={(event) => event.stopPropagation()}
            >
              <span className="review-confirmIcon" aria-hidden="true">
                ✓
              </span>
              <h2 id="review-confirm-title">Mulai analisis?</h2>
              <p id="review-confirm-description">
                Pastikan informasi project dan role target sudah benar. Setelah
                dilanjutkan, AI akan mulai menganalisis data Anda.
              </p>
              <div className="review-confirmActions">
                <button
                  type="button"
                  className="review-confirmCancel"
                  onClick={closeConfirmation}
                >
                  Periksa kembali
                </button>
                <button
                  type="button"
                  className="review-confirmAccept"
                  disabled={saving}
                  onClick={saveAnalysis}
                >
                  {saving ? "Menyimpan..." : "Ya, mulai analisis"}
                </button>
              </div>
            </section>
          </div>,
          document.body,
        )}
    </div>
  );
}
