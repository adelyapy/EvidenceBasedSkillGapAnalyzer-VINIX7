"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ChangeEvent, type DragEvent } from "react";
import AnalysisStepper from "./AnalysisStepper";
import { analysisRoutes, analysisStorage } from "@/data/analysis";
import type { AnalysisCv } from "@/types/analysis";

const MAX_CV_BYTES = 3 * 1024 * 1024;

type ChecklistItem = { text: string; complete: boolean };
type UploadIconName = "arrow-left" | "arrow-right" | "file" | "close";

function UploadIcon({ name, size = 22 }: { name: UploadIconName; size?: number }) {
  const common = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true as const };

  switch (name) {
    case "arrow-left": return <svg {...common}><path d="m12 19-7-7 7-7M5 12h14" /></svg>;
    case "arrow-right": return <svg {...common}><path d="M5 12h14m-7-7 7 7-7 7" /></svg>;
    case "file": return <svg {...common}><path d="M13 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10z" /><path d="M13 3v7h7M8 14h8M8 18h6" /></svg>;
    case "close": return <svg {...common}><path d="M18 6 6 18M6 6l12 12" /></svg>;
  }
}

function readSavedInputs() {
  let hasProject = false;

  try {
    const projects = JSON.parse(sessionStorage.getItem(analysisStorage.projects) || "[]");
    hasProject = Array.isArray(projects) && projects.length > 0;
  } catch {
    // Invalid transient demo state is treated as missing.
  }

  return {
    hasProject,
    hasRole: Boolean(sessionStorage.getItem(analysisStorage.targetRole)?.trim()),
    hasJobDescription: Boolean(sessionStorage.getItem(analysisStorage.jobDescription)?.trim()),
  };
}

function verifyCv(file: File): string | null {
  if (!/\.pdf$/i.test(file.name) || (file.type && file.type !== "application/pdf")) return "Format tidak didukung. Pilih CV berformat PDF (.pdf).";
  if (file.size > MAX_CV_BYTES) return "Ukuran CV melebihi 3 MB. Pilih file yang lebih kecil.";
  if (file.size === 0) return "File PDF kosong. Pilih file lain.";
  return null;
}

export default function UploadCvPage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [cv, setCv] = useState<AnalysisCv | null>(null);
  const [cvError, setCvError] = useState("");
  const [routeError, setRouteError] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [prerequisites, setPrerequisites] = useState({ hasProject: false, hasRole: false, hasJobDescription: false });
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const params = new URLSearchParams(window.location.search);
      const selectedRole = params.get("target_role");

      if (selectedRole) {
        sessionStorage.setItem(analysisStorage.targetRole, selectedRole);
        sessionStorage.setItem(analysisStorage.jobDescription, params.get("deskripsi_pekerjaan") || "");
      }

      setPrerequisites(readSavedInputs());
      setIsDemo(params.get("demo") === "1");

      try {
        const saved = JSON.parse(sessionStorage.getItem(analysisStorage.cv) || "null") as AnalysisCv | null;
        if (saved && typeof saved.name === "string" && typeof saved.size === "number") setCv(saved);
      } catch {
        // Ignore corrupted demo state.
      }

      setLoaded(true);
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  function acceptFile(file?: File) {
    if (!file) return;
    const error = verifyCv(file);
    setCvError(error || "");

    if (error) {
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    const value: AnalysisCv = { name: file.name, size: file.size, type: "application/pdf" };
    setCv(value);
    sessionStorage.setItem(analysisStorage.cv, JSON.stringify(value));
  }

  function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    acceptFile(event.target.files?.[0]);
  }

  function onDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setDragActive(false);
    acceptFile(event.dataTransfer.files?.[0]);
  }

  function removeCv() {
    setCv(null);
    setCvError("");
    sessionStorage.removeItem(analysisStorage.cv);
    if (inputRef.current) inputRef.current.value = "";
  }

  const hasProject = isDemo || prerequisites.hasProject;
  const hasRole = isDemo || prerequisites.hasRole;
  const hasDescription = isDemo || prerequisites.hasJobDescription;
  const ready = hasProject && hasRole;
  const completedRequiredChecks = Number(hasProject) + Number(hasRole);
  const checks: ChecklistItem[] = [
    { text: "Minimal 1 proyek telah ditambahkan", complete: hasProject },
    { text: "Target role telah dipilih", complete: hasRole },
    { text: hasDescription ? "Job description tersedia" : "Job description (opsional)", complete: true },
    { text: cv ? "CV berhasil dipilih (opsional)" : "CV (opsional)", complete: true },
  ];

  function continueToReview() {
    if (!ready) {
      setRouteError("Lengkapi minimal satu proyek dan target role terlebih dahulu.");
      return;
    }
    sessionStorage.setItem(analysisStorage.flowProgress, "cv");
    router.push(analysisRoutes.reviewInput);
  }

  return (
    <div className="cv-main">
      <AnalysisStepper current="cv" />
      <section className="cv-hero" aria-labelledby="cv-heading">
        <h1 id="cv-heading">Upload CV (Opsional)</h1>
        <p>CV membantu AI memahami latar belakang pendidikan,<br className="cv-desktop-break" /> pengalaman, dan skill tambahan kamu.</p>
        <div className="cv-upload-area">
          <div className="cv-file-column">
            <label htmlFor="cv-file" className={`cv-dropzone ${dragActive ? "cv-dropzone--drag" : ""} ${cvError ? "cv-dropzone--error" : ""}`} onDragOver={(event) => { event.preventDefault(); setDragActive(true); }} onDragLeave={(event) => { event.preventDefault(); setDragActive(false); }} onDrop={onDrop}>
              <input ref={inputRef} id="cv-file" name="cv" type="file" accept=".pdf,application/pdf" onChange={onFileChange} aria-describedby="cv-file-hint cv-file-error" />
              <Image src="/images/upload_cv.png" width={70} height={70} alt="" unoptimized />
              <span className="cv-dropzone-title">Drag &amp; drop file CV di sini<br />atau klik untuk memilih</span>
              <span className="cv-dropzone-hint" id="cv-file-hint">PDF, maks 3 MB</span>
            </label>
            {cvError && <p className="cv-error" role="alert" id="cv-file-error">{cvError}</p>}
            {cv && <div className="cv-selected" role="status"><UploadIcon name="file" size={21} /><span title={cv.name}>{cv.name}<small>{((cv.size || 0) / 1024 / 1024).toFixed(2)} MB • Dipilih untuk simulasi</small></span><button type="button" onClick={removeCv} aria-label="Hapus CV"><UploadIcon name="close" size={18} /></button></div>}
          </div>
          <div className="cv-artwork" aria-hidden="true">
            <Image src="/images/cv_ilustrasion.png" alt="" className="cv-artwork-bubble" width={195} height={130} unoptimized />
            <Image src="/images/document_cv.png" alt="" className="cv-artwork-doc" width={215} height={215} unoptimized />
          </div>
        </div>
      </section>

      <section className={`cv-readiness ${ready ? "cv-readiness--ready" : "cv-readiness--incomplete"}`} aria-labelledby="cv-readiness-heading">
        <div className="cv-check-panel">
          <div className="cv-check-heading">
            <div>
              <h2 id="cv-readiness-heading">Pemeriksaan Kelengkapan Input</h2>
              <p>Lengkapi syarat wajib sebelum melanjutkan ke review.</p>
            </div>
            <span className="cv-check-progress" aria-label={`${completedRequiredChecks} dari 2 syarat wajib terpenuhi`}>{completedRequiredChecks}/2 wajib</span>
          </div>
          <ul>{checks.map((check) => <li key={check.text} className={`cv-check-item ${check.complete ? "cv-check-item--complete" : ""}`}><span className={`cv-check-mark ${check.complete ? "" : "cv-check-mark--empty"}`} aria-label={check.complete ? "Terpenuhi" : "Belum terpenuhi"}>{check.complete ? "✓" : "!"}</span><span>{check.text}</span></li>)}</ul>
        </div>
        <div className="cv-status-panel" role="status" aria-live="polite">
          <Image src="/images/ceklis2.png" alt="" width={77} height={77} unoptimized className={`cv-status-icon ${ready ? "cv-status-icon--ready" : "cv-status-icon--pending"}`} />
          <h3>{!loaded ? "Memeriksa input…" : ready ? "Input sudah lengkap!" : "Input belum lengkap"}</h3>
          <p>{ready ? "Siap untuk memulai analisis." : "Tambahkan proyek dan pilih target role."}</p>
        </div>
      </section>

      {isDemo && <p className="cv-demo-note">Mode pratinjau desain: kelengkapan langkah sebelumnya ditampilkan sebagai simulasi.</p>}
      {routeError && <p className="cv-error cv-route-error" role="alert">{routeError}</p>}

      <div className="cv-actions">
        <Link className="cv-action cv-action-back" href={analysisRoutes.targetRole}><UploadIcon name="arrow-left" size={19} /> Kembali</Link>
        <button className="cv-action cv-action-next" onClick={continueToReview} type="button">Lanjutkan <UploadIcon name="arrow-right" size={20} /></button>
      </div>
    </div>
  );
}
