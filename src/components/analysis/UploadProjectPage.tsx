"use client";

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
} from "react";
import AnalysisStepper from "./AnalysisStepper";
import { analysisRoutes, analysisStorage } from "@/data/analysis";
import {
  UPLOAD_PROJECT_LINKS_STORAGE_KEY,
  uploadProjectSources,
  uploadProjectTips,
} from "@/data/upload-project";
import type {
  UploadProjectEvidence,
  UploadProjectLinkEvidence,
  UploadProjectPdfEvidence,
  UploadProjectSource,
  UploadProjectUrlSource,
} from "@/types/upload-project";
import type { AnalysisProject } from "@/types/analysis";

type ValidationResult = { ok: true; value: string } | { ok: false; error: string };

const sourceLabels = Object.fromEntries(uploadProjectSources.map((source) => [source.id, source.label])) as Record<UploadProjectSource, string>;
const UPLOAD_PROJECT_ORIGIN = "upload-project-v1";
const UPLOAD_PROJECT_SYNC_EVENT = "buktiva:upload-project:updated";

type SharedUploadProject = AnalysisProject & {
  id: string;
  origin: typeof UPLOAD_PROJECT_ORIGIN;
};

function ProjectSourceIcon({ source }: { source: UploadProjectSource }) {
  const common = { width: 24, height: 24, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true as const };

  switch (source) {
    case "github":
      return <svg {...common}><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3.3-.4 6.8-1.6 6.8-7A5.4 5.4 0 0 0 19.4 4 5 5 0 0 0 19.3.5S18.2.1 15.5 1.8a12.2 12.2 0 0 0-7 0C5.8.1 4.7.5 4.7.5A5 5 0 0 0 4.6 4a5.4 5.4 0 0 0-1.4 3.7c0 5.4 3.5 6.6 6.8 7A4.8 4.8 0 0 0 9 18v4" /><path d="M9 19c-3 .9-3-1.5-4-2" /></svg>;
    case "portfolio":
      return <svg {...common}><path d="M10 13a5 5 0 0 0 7.1 0l2-2a5 5 0 0 0-7.1-7.1l-1.1 1.1" /><path d="M14 11a5 5 0 0 0-7.1 0l-2 2A5 5 0 0 0 12 20.1l1.1-1.1" /></svg>;
    case "deployment":
      return <svg {...common}><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" /></svg>;
    case "linkedin":
      return <svg {...common}><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M8 10v6M8 7v.01M12 16v-3.5a2.5 2.5 0 0 1 5 0V16M12 12v4" /></svg>;
    case "pdf":
      return <svg {...common}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6M8 15h8M8 18h6" /></svg>;
  }
}

function CloudUploadIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M15 36H11a8 8 0 0 1-1.4-15.9A14 14 0 0 1 36.4 17 9.5 9.5 0 0 1 37 36h-5" />
      <path d="m18 28 6-6 6 6M24 22v18" />
    </svg>
  );
}

function isUrlSource(value: unknown): value is UploadProjectUrlSource {
  return value === "github" || value === "portfolio" || value === "deployment" || value === "linkedin";
}

function validateUrl(rawValue: string, source: UploadProjectUrlSource): ValidationResult {
  const trimmed = rawValue.trim();
  if (!trimmed) return { ok: false, error: "Masukkan URL terlebih dahulu." };

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return { ok: false, error: "URL tidak valid. Gunakan alamat lengkap yang diawali http:// atau https://." };
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return { ok: false, error: "URL hanya boleh menggunakan protokol http atau https." };
  }

  if (parsed.username || parsed.password) {
    return { ok: false, error: "URL tidak boleh berisi username atau password." };
  }

  if (source === "github") {
    const hostname = parsed.hostname.toLowerCase();
    const pathParts = parsed.pathname.split("/").filter(Boolean);
    if ((hostname !== "github.com" && hostname !== "www.github.com") || pathParts.length < 2) {
      return { ok: false, error: "Gunakan URL GitHub dengan format github.com/owner/repository." };
    }
  }

  if (source === "linkedin") {
    const hostname = parsed.hostname.toLowerCase();
    if ((hostname !== "linkedin.com" && hostname !== "www.linkedin.com") || !parsed.pathname.startsWith("/in/")) {
      return { ok: false, error: "Gunakan URL profil LinkedIn dengan format linkedin.com/in/namamu." };
    }
  }

  parsed.hash = "";
  const normalized = parsed.toString();
  return { ok: true, value: parsed.pathname === "/" ? normalized : normalized.replace(/\/$/, "") };
}

function parseStoredLinks(rawValue: string): UploadProjectLinkEvidence[] {
  try {
    const parsed: unknown = JSON.parse(rawValue);
    if (!Array.isArray(parsed)) return [];

    const restored: UploadProjectLinkEvidence[] = [];
    for (const item of parsed) {
      if (!item || typeof item !== "object") continue;
      const candidate = item as Record<string, unknown>;
      if (candidate.kind !== "url" || typeof candidate.id !== "string" || typeof candidate.value !== "string" || !isUrlSource(candidate.source)) continue;
      const validation = validateUrl(candidate.value, candidate.source);
      if (!validation.ok || restored.some((entry) => entry.source === candidate.source && entry.value === validation.value)) continue;
      restored.push({ id: candidate.id, kind: "url", source: candidate.source, value: validation.value });
    }
    return restored;
  } catch {
    return [];
  }
}

function parseStoredPdfs(): UploadProjectPdfEvidence[] {
  if (typeof window === "undefined") return [];

  try {
    const rawProjects: unknown = JSON.parse(sessionStorage.getItem(analysisStorage.projects) || "[]");
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
      ) return [];

      return [{
        id: candidate.id,
        kind: "pdf" as const,
        source: "pdf" as const,
        file: {
          name: candidate.fileName,
          size: candidate.fileSize,
          type: typeof candidate.fileType === "string" ? candidate.fileType : "application/pdf",
        },
      }];
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
  return () => window.removeEventListener(UPLOAD_PROJECT_SYNC_EVENT, onStoreChange);
}

function persistLinks(items: UploadProjectEvidence[], broadcast = true): boolean {
  try {
    const links = items.filter((item): item is UploadProjectLinkEvidence => item.kind === "url");
    sessionStorage.setItem(UPLOAD_PROJECT_LINKS_STORAGE_KEY, JSON.stringify(links));

    let sharedProjects: unknown = [];
    try {
      sharedProjects = JSON.parse(sessionStorage.getItem(analysisStorage.projects) || "[]");
    } catch {
      // Invalid shared demo data is replaced only for this page's own records.
    }

    const retainedProjects = Array.isArray(sharedProjects)
      ? sharedProjects.filter((project) => {
          if (!project || typeof project !== "object") return false;
          return (project as Record<string, unknown>).origin !== UPLOAD_PROJECT_ORIGIN;
        }) as AnalysisProject[]
      : [];
    const adaptedProjects: SharedUploadProject[] = items.map((item) => (
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
          }
    ));

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
  const storedLinksSnapshot = useSyncExternalStore(
    subscribeToStoredLinks,
    getStoredLinksSnapshot,
    () => "[]",
  );
  const linkEvidence = useMemo(
    () => parseStoredLinks(storedLinksSnapshot),
    [storedLinksSnapshot],
  );
  const [activeSource, setActiveSource] = useState<UploadProjectSource>("github");
  const [urlValue, setUrlValue] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pdfEvidence, setPdfEvidence] = useState<UploadProjectPdfEvidence[]>(() => parseStoredPdfs());
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [storageAvailable, setStorageAvailable] = useState(true);
  const [evidenceToDelete, setEvidenceToDelete] = useState<UploadProjectEvidence | null>(null);
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

  const currentSource = uploadProjectSources.find((source) => source.id === activeSource) ?? uploadProjectSources[0];

  function changeSource(source: UploadProjectSource) {
    setActiveSource(source);
    setError("");
    setFeedback("");
  }

  function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    setSelectedFile(event.target.files?.[0] ?? null);
    setError("");
    setFeedback("");
  }

  function addEvidence(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setFeedback("");

    if (activeSource === "pdf") {
      if (!selectedFile) {
        setError("Pilih dokumen PDF terlebih dahulu.");
        return;
      }

      const isPdfName = /\.pdf$/i.test(selectedFile.name);
      const isPdfType = !selectedFile.type || selectedFile.type === "application/pdf";
      if (!isPdfName || !isPdfType) {
        setError("Format tidak didukung. Pilih dokumen berformat PDF (.pdf).");
        return;
      }

      if (selectedFile.size === 0) {
        setError("Dokumen PDF kosong. Pilih file lain.");
        return;
      }

      const duplicate = evidence.some((item) => item.kind === "pdf" && item.file.name === selectedFile.name && item.file.size === selectedFile.size && item.file.lastModified === selectedFile.lastModified);
      if (duplicate) {
        setError("Dokumen PDF yang sama sudah ditambahkan.");
        return;
      }

      const pdfItem: UploadProjectPdfEvidence = { id: createEvidenceId(), kind: "pdf", source: "pdf", file: selectedFile };
      const nextEvidence = [...evidence, pdfItem];
      setPdfEvidence((items) => [...items, pdfItem]);
      setStorageAvailable(persistLinks(nextEvidence));
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setFeedback("Dokumen PDF ditambahkan dan akan ditampilkan pada halaman review. File belum diunggah ke server.");
      return;
    }

    const validation = validateUrl(urlValue, activeSource);
    if (!validation.ok) {
      setError(validation.error);
      return;
    }

    if (evidence.some((item) => item.kind === "url" && item.value === validation.value)) {
      setError("URL yang sama sudah ditambahkan.");
      return;
    }

    const nextEvidence: UploadProjectEvidence[] = [
      ...evidence,
      { id: createEvidenceId(), kind: "url", source: activeSource, value: validation.value },
    ];
    setStorageAvailable(persistLinks(nextEvidence));
    setUrlValue("");
    setFeedback("URL proyek berhasil ditambahkan ke penyimpanan sesi browser.");
  }

  function removeEvidence(id: string) {
    const removedEvidence = evidence.find((item) => item.id === id);
    const nextEvidence = evidence.filter((item) => item.id !== id);
    if (removedEvidence?.kind === "pdf") {
      setPdfEvidence((items) => items.filter((item) => item.id !== id));
    }
    setStorageAvailable(persistLinks(nextEvidence));
    setError("");
    setFeedback("Bukti proyek dihapus.");
  }

  const hasPdfEvidence = evidence.some((item) => item.kind === "pdf");

  function continueToTargetRole() {
    setError("");
    setFeedback("");

    if (evidence.length === 0) {
      setError("Tambahkan minimal satu URL atau dokumen PDF untuk melanjutkan.");
      return;
    }

    if (!persistLinks(evidence)) {
      setStorageAvailable(false);
      setError("Bukti proyek tidak dapat disimpan. Navigasi dihentikan agar data tidak hilang.");
      return;
    }

    router.push(analysisRoutes.targetRole);
  }

  return (
    <div className="bkp-page">
      <AnalysisStepper current="project" />

      <section className="bkp-hero" aria-labelledby="bkp-title">
        <div className="bkp-heroCopy">
          <h1 id="bkp-title">Upload Proyek Kamu</h1>
          <p>Unggah atau hubungkan proyek yang pernah kamu kerjakan. AI akan menganalisis teknologi, peran, dan kontribusimu untuk memetakan kompetensi kamu.</p>
        </div>
        <Image className="bkp-heroImage" src="/images/analysis/analisis-vector1.png" alt="Ilustrasi folder berisi kode dan dokumen proyek" width={578} height={432} priority />
      </section>

      <section className="bkp-sourceSection" aria-labelledby="bkp-source-title">
        <h2 className="bkp-srOnly" id="bkp-source-title">Pilih Sumber Proyek</h2>
        <div className="bkp-sourceTabs" role="tablist" aria-label="Pilih sumber proyek">
          {uploadProjectSources.map((source) => {
            const active = source.id === activeSource;
            return (
              <button key={source.id} id={`bkp-tab-${source.id}`} className={`bkp-sourceTab${active ? " bkp-sourceTab--active" : ""}`} type="button" role="tab" aria-selected={active} aria-controls="bkp-source-panel" onClick={() => changeSource(source.id)}>
                <span className="bkp-sourceIcon"><ProjectSourceIcon source={source.id} /></span>
                <span><strong>{source.label}</strong><small>{source.description}</small></span>
              </button>
            );
          })}
        </div>

        <form className={`bkp-sourceForm${activeSource === "pdf" ? " bkp-sourceForm--pdf" : ""}`} id="bkp-source-panel" role="tabpanel" aria-labelledby={`bkp-tab-${activeSource}`} onSubmit={addEvidence} noValidate>
          {activeSource === "pdf" ? (
            <div className="bkp-fileField" key="pdf-field">
              <label htmlFor="bkp-project-file">{currentSource.inputLabel}</label>
              <input ref={fileInputRef} id="bkp-project-file" name="project_file" type="file" accept=".pdf,application/pdf" onChange={onFileChange} aria-describedby="bkp-file-note bkp-form-error" />
            <span id="bkp-file-note">Nama dan ukuran PDF akan diteruskan ke halaman review. File belum diunggah ke server.</span>
            </div>
          ) : (
            <div className="bkp-urlField" key="url-field">
              <label className="bkp-srOnly" htmlFor="bkp-project-url">{currentSource.inputLabel}</label>
              <input id="bkp-project-url" name={`${activeSource}_url`} type="url" inputMode="url" autoComplete="url" value={urlValue} placeholder={currentSource.placeholder} onChange={(event) => { setUrlValue(event.target.value); setError(""); setFeedback(""); }} aria-describedby="bkp-form-error" />
            </div>
          )}
          <button className="bkp-addButton" type="submit">Tambahkan</button>
        </form>

        {error && <p className="bkp-formMessage bkp-formError" id="bkp-form-error" role="alert">{error}</p>}
        {feedback && <p className="bkp-formMessage bkp-formSuccess" role="status">{feedback}</p>}
        {!storageAvailable && <p className="bkp-formMessage bkp-storageWarning" role="status">Penyimpanan sesi tidak tersedia. URL tetap tersimpan selama halaman ini tetap terbuka.</p>}
      </section>

      <section className="bkp-evidenceSection" aria-labelledby="bkp-evidence-title">
        <h2 className="bkp-srOnly" id="bkp-evidence-title">Daftar Proyek</h2>
        {evidence.length === 0 ? (
          <div className="bkp-emptyState">
            <CloudUploadIcon />
            <strong>Belum ada proyek yang ditambahkan</strong>
            <span>Tambahkan URL atau dokumen PDF sebagai bukti proyek.</span>
          </div>
        ) : (
          <div className="bkp-evidenceList">
            <div className="bkp-evidenceHeading"><h3>Bukti proyek yang ditambahkan</h3><span>{evidence.length} item</span></div>
            <ul>
              {evidence.map((item) => (
                <li key={item.id}>
                  <span className="bkp-evidenceIcon"><ProjectSourceIcon source={item.source} /></span>
                  <span className="bkp-evidenceContent">
                    <strong>{sourceLabels[item.source]}</strong>
                    {item.kind === "url" ? <a href={item.value} target="_blank" rel="noreferrer">{item.value}</a> : <span>{item.file.name} · {formatFileSize(item.file.size)} · belum diunggah</span>}
                  </span>
                  <button type="button" onClick={() => setEvidenceToDelete(item)} aria-label={`Hapus ${item.kind === "url" ? item.value : item.file.name}`}>Hapus</button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <aside className="bkp-tips" aria-labelledby="bkp-tips-title">
        <div className="bkp-tipsHeading"><span aria-hidden="true">💡</span><h2 id="bkp-tips-title">Tips agar hasil analisis lebih maksimal</h2></div>
        <ol>{uploadProjectTips.map((tip, index) => <li key={tip}><span>{index + 1}</span><p>{tip}</p></li>)}</ol>
      </aside>

      <div className="bkp-nextSection">
        <p id="bkp-target-note">
          {!storageAvailable
            ? "Penyimpanan sesi tidak tersedia. Perjalanan ke tahap berikutnya dihentikan agar data tidak hilang."
            : evidence.length === 0
              ? "Tambahkan minimal satu URL atau dokumen PDF untuk melanjutkan ke Target Role."
                : hasPdfEvidence
                  ? "Bukti proyek siap diteruskan. Nama dan ukuran PDF akan terlihat pada halaman review; file belum diunggah ke server."
                  : "Bukti proyek sudah tersimpan untuk sesi ini dan siap diteruskan ke Target Role."}
        </p>
        <button
          className="bkp-continue"
          type="button"
          disabled={evidence.length === 0 || !storageAvailable}
          aria-describedby="bkp-target-note"
          onClick={continueToTargetRole}
        >
          Lanjutkan <span aria-hidden="true">→</span>
        </button>
      </div>
      {evidenceToDelete && typeof document !== "undefined" && createPortal(
        <div className="bkp-deleteBackdrop" role="presentation" onMouseDown={() => setEvidenceToDelete(null)}>
          <section className="bkp-deleteDialog" role="alertdialog" aria-modal="true" aria-labelledby="bkp-delete-title" aria-describedby="bkp-delete-description" onMouseDown={(event) => event.stopPropagation()}>
            <span className="bkp-deleteIcon" aria-hidden="true">!</span>
            <h2 id="bkp-delete-title">Hapus bukti proyek?</h2>
            <p id="bkp-delete-description">{`Apakah Anda yakin ingin menghapus ${evidenceToDelete.kind === "url" ? "tautan proyek ini" : `dokumen ${evidenceToDelete.file.name}`}?`}</p>
            <div className="bkp-deleteActions">
              <button type="button" className="bkp-deleteCancel" onClick={() => setEvidenceToDelete(null)}>Tidak</button>
              <button
                type="button"
                className="bkp-deleteConfirm"
                onClick={() => {
                  removeEvidence(evidenceToDelete.id);
                  setEvidenceToDelete(null);
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
