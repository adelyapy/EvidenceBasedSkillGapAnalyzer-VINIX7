"use client";

import { saveProjectPdf, deleteProjectPdf } from "@/lib/analysis/project-pdf-storage";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ChangeEvent,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import AnalysisStepper from "./AnalysisStepper";
import AnalysisToast from "./AnalysisToast";
import ProjectSourceIcon from "./ProjectSourceIcon";
import { analysisRoutes, analysisStorage } from "@/data/analysis";
import {
  UPLOAD_PROJECT_LINKS_STORAGE_KEY,
  uploadProjectSources,
  uploadProjectTips,
} from "@/data/upload-project";
import { useAnimatedDismiss } from "@/hooks/useAnimatedDismiss";
import type {
  UploadProjectEvidence,
  UploadProjectLinkEvidence,
  UploadProjectPdfEvidence,
  UploadProjectSource,
  UploadProjectUrlSource,
} from "@/types/upload-project";
import type { AnalysisProject } from "@/types/analysis";

type ValidationResult =
  | { ok: true; value: string }
  | { ok: false; error: string };

const sourceLabels = Object.fromEntries(
  uploadProjectSources.map((source) => [source.id, source.label]),
) as Record<UploadProjectSource, string>;
const UPLOAD_PROJECT_ORIGIN = "upload-project-v1";
const UPLOAD_PROJECT_SYNC_EVENT = "buktiva:upload-project:updated";
const TOAST_VISIBLE_DURATION = 3500;
const TOAST_EXIT_DURATION = 240;

type SharedUploadProject = AnalysisProject & {
  id: string;
  origin: typeof UPLOAD_PROJECT_ORIGIN;
};

function CloudUploadIcon() {
  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M15 36H11a8 8 0 0 1-1.4-15.9A14 14 0 0 1 36.4 17 9.5 9.5 0 0 1 37 36h-5" />
      <path d="m18 28 6-6 6 6M24 22v18" />
    </svg>
  );
}

function isUrlSource(value: unknown): value is UploadProjectUrlSource {
  return (
    value === "github" ||
    value === "portfolio" ||
    value === "deployment" ||
    value === "linkedin"
  );
}

function validateUrl(
  rawValue: string,
  source: UploadProjectUrlSource,
): ValidationResult {
  const trimmed = rawValue.trim();
  if (!trimmed) return { ok: false, error: "Masukkan URL terlebih dahulu." };

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return {
      ok: false,
      error:
        "URL tidak valid. Gunakan alamat lengkap yang diawali http:// atau https://.",
    };
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return {
      ok: false,
      error: "URL hanya boleh menggunakan protokol http atau https.",
    };
  }

  if (parsed.username || parsed.password) {
    return {
      ok: false,
      error: "URL tidak boleh berisi username atau password.",
    };
  }

  if (source === "github") {
    const hostname = parsed.hostname.toLowerCase();
    const pathParts = parsed.pathname.split("/").filter(Boolean);
    if (
      (hostname !== "github.com" && hostname !== "www.github.com") ||
      pathParts.length < 2
    ) {
      return {
        ok: false,
        error: "Gunakan URL GitHub dengan format github.com/owner/repository.",
      };
    }
  }

  if (source === "linkedin") {
    const hostname = parsed.hostname.toLowerCase();
    if (
      (hostname !== "linkedin.com" && hostname !== "www.linkedin.com") ||
      !parsed.pathname.startsWith("/in/")
    ) {
      return {
        ok: false,
        error:
          "Gunakan URL profil LinkedIn dengan format linkedin.com/in/namamu.",
      };
    }
  }

  parsed.hash = "";
  const normalized = parsed.toString();
  return {
    ok: true,
    value: parsed.pathname === "/" ? normalized : normalized.replace(/\/$/, ""),
  };
}

function parseStoredLinks(rawValue: string): UploadProjectLinkEvidence[] {
  try {
    const parsed: unknown = JSON.parse(rawValue);
    if (!Array.isArray(parsed)) return [];

    const restored: UploadProjectLinkEvidence[] = [];
    for (const item of parsed) {
      if (!item || typeof item !== "object") continue;
      const candidate = item as Record<string, unknown>;
      if (
        candidate.kind !== "url" ||
        typeof candidate.id !== "string" ||
        typeof candidate.value !== "string" ||
        !isUrlSource(candidate.source)
      )
        continue;
      const validation = validateUrl(candidate.value, candidate.source);
      if (
        !validation.ok ||
        restored.some(
          (entry) =>
            entry.source === candidate.source &&
            entry.value === validation.value,
        )
      )
        continue;
      restored.push({
        id: candidate.id,
        kind: "url",
        source: candidate.source,
        value: validation.value,
      });
    }
    return restored;
  } catch {
    return [];
  }
}

function parseStoredPdfs(): UploadProjectPdfEvidence[] {
  if (typeof window === "undefined") return [];

  try {
    const rawProjects: unknown = JSON.parse(
      sessionStorage.getItem(analysisStorage.projects) || "[]",
    );
    if (!Array.isArray(rawProjects)) return [];

    return rawProjects.flatMap((project) => {
      if (!project || typeof project !== "object") return [];
      const candidate = project as Record<string, unknown>;
      if (
        candidate.origin !== UPLOAD_PROJECT_ORIGIN ||
        candidate.evidenceKind !== "pdf" ||
        typeof candidate.id !== "string" ||
        typeof candidate.fileName !== "string" ||
        typeof candidate.fileSize !== "number"
      )
        return [];

      return [
        {
          id: candidate.id,
          kind: "pdf" as const,
          source: "pdf" as const,
          file: {
            name: candidate.fileName,
            size: candidate.fileSize,
            type:
              typeof candidate.fileType === "string"
                ? candidate.fileType
                : "application/pdf",
          },
        },
      ];
    });
  } catch {
    return [];
  }
}

function getStoredLinksSnapshot() {
  try {
    return sessionStorage.getItem(UPLOAD_PROJECT_LINKS_STORAGE_KEY) || "[]";
  } catch {
    return "[]";
  }
}

function subscribeToStoredLinks(onStoreChange: () => void) {
  window.addEventListener(UPLOAD_PROJECT_SYNC_EVENT, onStoreChange);
  return () =>
    window.removeEventListener(UPLOAD_PROJECT_SYNC_EVENT, onStoreChange);
}

function persistLinks(
  items: UploadProjectEvidence[],
  broadcast = true,
): boolean {
  try {
    const links = items.filter(
      (item): item is UploadProjectLinkEvidence => item.kind === "url",
    );
    sessionStorage.setItem(
      UPLOAD_PROJECT_LINKS_STORAGE_KEY,
      JSON.stringify(links),
    );

    let sharedProjects: unknown = [];
    try {
      sharedProjects = JSON.parse(
        sessionStorage.getItem(analysisStorage.projects) || "[]",
      );
    } catch {
      // Invalid shared demo data is replaced only for this page's own records.
    }

    const retainedProjects = Array.isArray(sharedProjects)
      ? (sharedProjects.filter((project) => {
          if (!project || typeof project !== "object") return false;
          return (
            (project as Record<string, unknown>).origin !==
            UPLOAD_PROJECT_ORIGIN
          );
        }) as AnalysisProject[])
      : [];
    const adaptedProjects: SharedUploadProject[] = items.map((item) =>
      item.kind === "url"
        ? {
            id: item.id,
            origin: UPLOAD_PROJECT_ORIGIN,
            evidenceKind: "url",
            type: sourceLabels[item.source],
            name: sourceLabels[item.source],
            value: item.value,
            link: item.value,
          }
        : {
            id: item.id,
            origin: UPLOAD_PROJECT_ORIGIN,
            evidenceKind: "pdf",
            type: sourceLabels[item.source],
            name: item.file.name,
            fileName: item.file.name,
            fileSize: item.file.size,
            fileType: item.file.type || "application/pdf",
          },
    );

    sessionStorage.setItem(
      analysisStorage.projects,
      JSON.stringify([...retainedProjects, ...adaptedProjects]),
    );
    if (broadcast) window.dispatchEvent(new Event(UPLOAD_PROJECT_SYNC_EVENT));
    return true;
  } catch {
    return false;
  }
}

function createEvidenceId() {
  return crypto.randomUUID();
}

function formatFileSize(size: number) {
  if (size < 1024) return `${size} B`;
  return `${(size / 1024 / 1024).toFixed(2)} MB`;
}

export default function UploadProjectPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sourceTabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const deleteCancelRef = useRef<HTMLButtonElement>(null);
  const toastId = useRef(0);
  const manualToastTimer = useRef<number | null>(null);
  const storedLinksSnapshot = useSyncExternalStore(
    subscribeToStoredLinks,
    getStoredLinksSnapshot,
    () => "[]",
  );
  const linkEvidence = useMemo(
    () => parseStoredLinks(storedLinksSnapshot),
    [storedLinksSnapshot],
  );
  const [activeSource, setActiveSource] =
    useState<UploadProjectSource>("github");
  const [urlValue, setUrlValue] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pdfEvidence, setPdfEvidence] = useState<UploadProjectPdfEvidence[]>(
    () => parseStoredPdfs(),
  );
  const [toast, setToast] = useState<{
    id: number;
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [toastLeaving, setToastLeaving] = useState(false);
  const [storageAvailable, setStorageAvailable] = useState(true);
  const [evidenceToDelete, setEvidenceToDelete] =
    useState<UploadProjectEvidence | null>(null);
  const {
    isClosing: deleteDialogClosing,
    requestDismiss: closeDeleteDialog,
  } = useAnimatedDismiss({
    onDismiss: () => setEvidenceToDelete(null),
  });
  const evidence = useMemo(
    () => [...linkEvidence, ...pdfEvidence],
    [linkEvidence, pdfEvidence],
  );

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      try {
        sessionStorage.getItem(UPLOAD_PROJECT_LINKS_STORAGE_KEY);
        setStorageAvailable(true);
      } catch {
        setStorageAvailable(false);
      }
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!evidenceToDelete) return;

    const previouslyFocused =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const frame = requestAnimationFrame(() => deleteCancelRef.current?.focus());

    const closeOnEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      closeDeleteDialog();
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("keydown", closeOnEscape);
      previouslyFocused?.focus();
    };
  }, [closeDeleteDialog, evidenceToDelete]);

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

  useEffect(
    () => () => {
      if (manualToastTimer.current !== null) {
        window.clearTimeout(manualToastTimer.current);
      }
    },
    [],
  );

  function showToast(type: "success" | "error", message: string) {
    toastId.current += 1;
    setToastLeaving(false);
    setToast({ id: toastId.current, type, message });
  }

  function clearToast() {
    if (!toast) return;

    const currentToastId = toast.id;
    setToastLeaving(true);

    if (manualToastTimer.current !== null) {
      window.clearTimeout(manualToastTimer.current);
    }

    manualToastTimer.current = window.setTimeout(() => {
      manualToastTimer.current = null;
      setToast((current) =>
        current?.id === currentToastId ? null : current,
      );
    }, TOAST_EXIT_DURATION);
  }

  const currentSource =
    uploadProjectSources.find((source) => source.id === activeSource) ??
    uploadProjectSources[0];

  function changeSource(source: UploadProjectSource) {
    setActiveSource(source);
    clearToast();
  }

  function handleSourceKeyDown(
    event: KeyboardEvent<HTMLButtonElement>,
    currentIndex: number,
  ) {
    let nextIndex = currentIndex;

    if (event.key === "ArrowRight") {
      nextIndex = (currentIndex + 1) % uploadProjectSources.length;
    } else if (event.key === "ArrowLeft") {
      nextIndex =
        (currentIndex - 1 + uploadProjectSources.length) %
        uploadProjectSources.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = uploadProjectSources.length - 1;
    } else {
      return;
    }

    event.preventDefault();
    const nextSource = uploadProjectSources[nextIndex];
    changeSource(nextSource.id);
    sourceTabRefs.current[nextIndex]?.focus();
  }

  function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    setSelectedFile(event.target.files?.[0] ?? null);
    clearToast();
  }

  async function addEvidence(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    clearToast();

    if (activeSource === "pdf") {
      if (!selectedFile) {
        showToast("error", "Pilih dokumen PDF terlebih dahulu.");
        return;
      }

      const isPdfName = /\.pdf$/i.test(selectedFile.name);
      const isPdfType =
        !selectedFile.type || selectedFile.type === "application/pdf";
      if (!isPdfName || !isPdfType) {
        showToast(
          "error",
          "Format tidak didukung. Pilih dokumen berformat PDF (.pdf).",
        );
        return;
      }

      if (selectedFile.size === 0) {
        showToast("error", "Dokumen PDF kosong. Pilih file lain.");
        return;
      }

      const duplicate = evidence.some(
        (item) =>
          item.kind === "pdf" &&
          item.file.name === selectedFile.name &&
          item.file.size === selectedFile.size &&
          item.file.lastModified === selectedFile.lastModified,
      );
      if (duplicate) {
        showToast("error", "Dokumen PDF yang sama sudah ditambahkan.");
        return;
      }

      
      
      const pdfItem: UploadProjectPdfEvidence = {
        id: createEvidenceId(),
        kind: "pdf",
        source: "pdf",
        file: selectedFile,
      };

      // WAJIB: simpan file asli sebelum menyimpan metadata.
      try {
        await saveProjectPdf(pdfItem.id, selectedFile);
      } catch (saveError) {
        console.error("Gagal menyimpan PDF ke IndexedDB:", saveError);
        showToast(
          "error",
          "PDF gagal disimpan di browser. Silakan coba unggah ulang.",
        );
        return;
      }

      const nextEvidence = [...evidence, pdfItem];
      const stored = persistLinks(nextEvidence);

      if (!stored) {
        try {
          await deleteProjectPdf(pdfItem.id);
        } catch (cleanupError) {
          console.error("Gagal membersihkan PDF sementara:", cleanupError);
        }

        showToast(
          "error",
          "Informasi PDF gagal disimpan. Silakan coba unggah ulang.",
        );
        return;
      }

      setPdfEvidence((items) => [...items, pdfItem]);
      setStorageAvailable(true);
      setSelectedFile(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      showToast(
        "success",
        `Dokumen ${selectedFile.name} berhasil ditambahkan.`,
      );
      return;
    }

    const validation = validateUrl(urlValue, activeSource);
    if (!validation.ok) {
      showToast("error", validation.error);
      return;
    }

    if (
      evidence.some(
        (item) => item.kind === "url" && item.value === validation.value,
      )
    ) {
      showToast("error", "URL yang sama sudah ditambahkan.");
      return;
    }

    const nextEvidence: UploadProjectEvidence[] = [
      ...evidence,
      {
        id: createEvidenceId(),
        kind: "url",
        source: activeSource,
        value: validation.value,
      },
    ];
    const stored = persistLinks(nextEvidence);
    setStorageAvailable(stored);
    setUrlValue("");
    showToast(
      stored ? "success" : "error",
      stored
        ? `${sourceLabels[activeSource]} berhasil ditambahkan.`
        : "URL ditambahkan, tetapi penyimpanan sesi tidak tersedia.",
    );
  }

  async function removeEvidence(id: string) {
    const removedEvidence = evidence.find((item) => item.id === id);
    if (!removedEvidence) return;

    if (removedEvidence.kind === "pdf") {
      try {
        await deleteProjectPdf(id);
      } catch (deleteError) {
        console.error("Gagal menghapus PDF sementara:", deleteError);
        showToast("error", "PDF gagal dihapus. Silakan coba lagi.");
        return;
      }
    }

    const nextEvidence = evidence.filter((item) => item.id !== id);

    const stored = persistLinks(nextEvidence);
    setStorageAvailable(stored);

    if (!stored) {
      showToast(
        "error",
        "Bukti proyek dihapus, tetapi perubahan gagal disimpan ke sesi.",
      );
      return;
    }

    if (removedEvidence.kind === "pdf") {
      setPdfEvidence((items) => items.filter((item) => item.id !== id));
    }

    showToast("success", "Bukti proyek berhasil dihapus.");
  }

  function continueToTargetRole() {
    clearToast();

    if (evidence.length === 0) {
      showToast(
        "error",
        "Tambahkan minimal satu URL atau dokumen PDF untuk melanjutkan.",
      );
      return;
    }

    if (!persistLinks(evidence)) {
      setStorageAvailable(false);
      showToast(
        "error",
        "Bukti proyek tidak dapat disimpan. Navigasi dihentikan agar data tidak hilang.",
      );
      return;
    }

    sessionStorage.setItem(analysisStorage.flowProgress, "project");
    router.push(analysisRoutes.targetRole);
  }

  return (
    <div className="bkp-page">
      <AnalysisStepper current="project" />

      <section className="bkp-hero" aria-labelledby="bkp-title">
        <div className="bkp-heroCopy">
          <h1 id="bkp-title">Upload Proyek Kamu</h1>
          <p>
            Unggah atau hubungkan proyek yang pernah kamu kerjakan. AI akan
            menganalisis teknologi, peran, dan kontribusimu untuk memetakan
            kompetensi kamu.
          </p>
        </div>
        <Image
          className="bkp-heroImage"
          src="/images/analysis/analisis-vector1.png"
          alt="Ilustrasi folder berisi kode dan dokumen proyek"
          width={578}
          height={432}
          priority
        />
      </section>

      <section className="bkp-sourceSection" aria-labelledby="bkp-source-title">
        <h2 className="bkp-srOnly" id="bkp-source-title">
          Pilih Sumber Proyek
        </h2>
        <div
          className="bkp-sourceTabs"
          role="tablist"
          aria-label="Pilih sumber proyek"
        >
          {uploadProjectSources.map((source, index) => {
            const active = source.id === activeSource;
            return (
              <button
                key={source.id}
                ref={(element) => {
                  sourceTabRefs.current[index] = element;
                }}
                id={`bkp-tab-${source.id}`}
                className={`bkp-sourceTab${active ? " bkp-sourceTab--active" : ""}`}
                type="button"
                role="tab"
                aria-selected={active}
                aria-controls="bkp-source-panel"
                tabIndex={active ? 0 : -1}
                onClick={() => changeSource(source.id)}
                onKeyDown={(event) => handleSourceKeyDown(event, index)}
              >
                <span className="bkp-sourceIcon">
                  <ProjectSourceIcon source={source.id} />
                </span>
                <span>
                  <strong>{source.label}</strong>
                  <small>{source.description}</small>
                </span>
              </button>
            );
          })}
        </div>

        <form
          className={`bkp-sourceForm${activeSource === "pdf" ? " bkp-sourceForm--pdf" : ""}`}
          id="bkp-source-panel"
          role="tabpanel"
          aria-labelledby={`bkp-tab-${activeSource}`}
          onSubmit={addEvidence}
          noValidate
        >
          {activeSource === "pdf" ? (
            <div className="bkp-fileField" key="pdf-field">
              <label htmlFor="bkp-project-file">
                {currentSource.inputLabel}
              </label>
              <input
                ref={fileInputRef}
                id="bkp-project-file"
                name="project_file"
                type="file"
                accept=".pdf,application/pdf"
                onChange={onFileChange}
                aria-invalid={toast?.type === "error"}
                aria-errormessage={
                  toast?.type === "error" ? "bkp-upload-toast" : undefined
                }
              />
            </div>
          ) : (
            <div className="bkp-urlField" key="url-field">
              <label className="bkp-srOnly" htmlFor="bkp-project-url">
                {currentSource.inputLabel}
              </label>
              <input
                id="bkp-project-url"
                name={`${activeSource}_url`}
                type="url"
                inputMode="url"
                autoComplete="url"
                value={urlValue}
                placeholder={currentSource.placeholder}
                onChange={(event) => {
                  setUrlValue(event.target.value);
                  clearToast();
                }}
                aria-invalid={toast?.type === "error"}
                aria-errormessage={
                  toast?.type === "error" ? "bkp-upload-toast" : undefined
                }
              />
            </div>
          )}
          <button className="bkp-addButton" type="submit">
            Tambahkan
          </button>
        </form>

        {!storageAvailable && (
          <p className="bkp-formMessage bkp-storageWarning" role="status">
            Penyimpanan sesi tidak tersedia. URL tetap tersimpan selama halaman
            ini tetap terbuka.
          </p>
        )}
      </section>

      <section
        className="bkp-evidenceSection"
        aria-labelledby="bkp-evidence-title"
      >
        <h2 className="bkp-srOnly" id="bkp-evidence-title">
          Daftar Proyek
        </h2>
        {evidence.length === 0 ? (
          <div className="bkp-emptyState" role="status">
            <CloudUploadIcon />
            <strong>Belum ada proyek yang ditambahkan</strong>
            <span>Tambahkan URL atau dokumen PDF sebagai bukti proyek.</span>
          </div>
        ) : (
          <div className="bkp-evidenceList">
            <div className="bkp-evidenceHeading">
              <h3>Bukti proyek yang ditambahkan</h3>
              <span aria-live="polite">{evidence.length} item</span>
            </div>
            <ul>
              {evidence.map((item) => (
                <li key={item.id}>
                  <span className="bkp-evidenceIcon">
                    <ProjectSourceIcon source={item.source} />
                  </span>
                  <span className="bkp-evidenceContent">
                    <strong>{sourceLabels[item.source]}</strong>
                    {item.kind === "url" ? (
                      <a href={item.value} target="_blank" rel="noreferrer">
                        {item.value}
                      </a>
                    ) : (
                      <span>
                        {item.file.name} · {formatFileSize(item.file.size)} ·
                        belum diunggah
                      </span>
                    )}
                  </span>
                  <button
                    type="button"
                    onClick={() => setEvidenceToDelete(item)}
                    aria-label={`Hapus ${item.kind === "url" ? item.value : item.file.name}`}
                  >
                    Hapus
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <aside className="bkp-tips" aria-labelledby="bkp-tips-title">
        <div className="bkp-tipsHeading">
          <span aria-hidden="true">💡</span>
          <h2 id="bkp-tips-title">Tips agar hasil analisis lebih maksimal</h2>
        </div>
        <ol>
          {uploadProjectTips.map((tip, index) => (
            <li key={tip}>
              <span>{index + 1}</span>
              <p>{tip}</p>
            </li>
          ))}
        </ol>
      </aside>

      <div className="bkp-nextSection">
        <button
          className="bkp-continue"
          type="button"
          disabled={evidence.length === 0 || !storageAvailable}
          onClick={continueToTargetRole}
        >
          Lanjutkan <span aria-hidden="true">→</span>
        </button>
      </div>
      {toast && (
        <AnalysisToast
          key={toast.id}
          id="bkp-upload-toast"
          type={toast.type}
          message={toast.message}
          leaving={toastLeaving}
        />
      )}
      {evidenceToDelete &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className={`bkp-deleteBackdrop${
              deleteDialogClosing ? " bkp-deleteBackdrop--closing" : ""
            }`}
            role="presentation"
            onMouseDown={closeDeleteDialog}
          >
            <section
              className="bkp-deleteDialog"
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="bkp-delete-title"
              aria-describedby="bkp-delete-description"
              onMouseDown={(event) => event.stopPropagation()}
            >
              <span className="bkp-deleteIcon" aria-hidden="true">
                !
              </span>
              <h2 id="bkp-delete-title">Hapus bukti proyek?</h2>
              <p id="bkp-delete-description">{`Apakah Anda yakin ingin menghapus ${evidenceToDelete.kind === "url" ? "tautan proyek ini" : `dokumen ${evidenceToDelete.file.name}`}?`}</p>
              <div className="bkp-deleteActions">
                <button
                  ref={deleteCancelRef}
                  type="button"
                  className="bkp-deleteCancel"
                  onClick={closeDeleteDialog}
                >
                  Tidak
                </button>
                <button
                  type="button"
                  className="bkp-deleteConfirm"
                  onClick={async () => {
                    await removeEvidence(evidenceToDelete.id);
                    closeDeleteDialog();
                  }}
                >
                  Ya, hapus
                </button>
              </div>
            </section>
          </div>,
          document.body,
        )}
    </div>
  );
}
