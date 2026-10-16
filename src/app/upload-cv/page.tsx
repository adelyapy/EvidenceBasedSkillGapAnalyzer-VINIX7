"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type ChangeEvent, type DragEvent } from "react";
import "./upload-cv.css";

const MAX_CV_BYTES = 3 * 1024 * 1024;
const STORAGE = {
  projects: "buktiva.analysis.projects",
  targetRole: "buktiva.analysis.targetRole",
  jobDescription: "buktiva.analysis.jobDescription",
  cv: "buktiva.analysis.cv",
};

type CvInfo = { name: string; size: number; type: string };
type ChecklistItem = { text: string; complete: boolean };

function Icon({ name, size = 22 }: { name: "home" | "chart" | "history" | "user" | "logout" | "menu" | "arrow-left" | "arrow-right" | "file" | "close"; size?: number }) {
  const common = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true as const };
  switch (name) {
    case "home": return <svg {...common}><path d="m3 10 9-7 9 7" /><path d="M5 9v11h14V9M9 20v-7h6v7" /></svg>;
    case "chart": return <svg {...common}><rect x="3" y="13" width="4" height="8" rx="2" fill="currentColor" stroke="none"/><rect x="10" y="8" width="4" height="13" rx="2" fill="currentColor" stroke="none"/><rect x="17" y="3" width="4" height="18" rx="2" fill="currentColor" stroke="none"/></svg>;
    case "history": return <svg {...common}><path d="M3 12a9 9 0 1 0 3-6.7M3 4v5h5"/><path d="M12 7v6l4 2"/></svg>;
    case "user": return <svg {...common}><circle cx="12" cy="7" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2z"/></svg>;
    case "logout": return <svg {...common}><path d="M14 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8"/><path d="m15 8 4 4-4 4M9 12h10"/></svg>;
    case "menu": return <svg {...common}><path d="m9 6-6 6 6 6m5-12-6 6 6 6"/></svg>;
    case "arrow-left": return <svg {...common}><path d="m12 19-7-7 7-7M5 12h14"/></svg>;
    case "arrow-right": return <svg {...common}><path d="M5 12h14m-7-7 7 7-7 7"/></svg>;
    case "file": return <svg {...common}><path d="M13 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10z"/><path d="M13 3v7h7M8 14h8M8 18h6"/></svg>;
    case "close": return <svg {...common}><path d="M18 6 6 18M6 6l12 12"/></svg>;
  }
}

function readSavedInputs() {
  let hasProject = false;
  try {
    const projects = JSON.parse(sessionStorage.getItem(STORAGE.projects) || "[]");
    hasProject = Array.isArray(projects) && projects.length > 0;
  } catch { /* Invalid transient demo state is treated as missing */ }
  return {
    hasProject,
    hasRole: Boolean(sessionStorage.getItem(STORAGE.targetRole)?.trim()),
    hasJobDescription: Boolean(sessionStorage.getItem(STORAGE.jobDescription)?.trim()),
  };
}

function verifyCv(file: File): string | null {
  // Browser MIME type can be empty on some systems, so also check the extension.
  if (!/\.pdf$/i.test(file.name) || (file.type && file.type !== "application/pdf")) {
    return "Format tidak didukung. Pilih CV berformat PDF (.pdf).";
  }
  if (file.size > MAX_CV_BYTES) return "Ukuran CV melebihi 3 MB. Pilih file yang lebih kecil.";
  if (file.size === 0) return "File PDF kosong. Pilih file lain.";
  return null;
}

export default function UploadCvPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [cv, setCv] = useState<CvInfo | null>(null);
  const [cvError, setCvError] = useState("");
  const [routeError, setRouteError] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [prerequisites, setPrerequisites] = useState({ hasProject: false, hasRole: false, hasJobDescription: false });
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    // Read browser-only state after hydration; keep SSR markup deterministic.
    const raf = window.requestAnimationFrame(() => {
      const params = new URLSearchParams(window.location.search);
      const selectedRole = params.get("target_role");
      if (selectedRole) {
        sessionStorage.setItem(STORAGE.targetRole, selectedRole);
        sessionStorage.setItem(STORAGE.jobDescription, params.get("deskripsi_pekerjaan") || "");
      }
      setPrerequisites(readSavedInputs());
      setIsDemo(params.get("demo") === "1");
      try {
        const saved = JSON.parse(sessionStorage.getItem(STORAGE.cv) || "null") as CvInfo | null;
        if (saved && typeof saved.name === "string" && typeof saved.size === "number") setCv(saved);
      } catch { /* ignore corrupted session */ }
      setLoaded(true);
    });
    return () => window.cancelAnimationFrame(raf);
  }, []);

  function acceptFile(file?: File) {
    if (!file) return;
    const error = verifyCv(file);
    setCvError(error || "");
    if (error) { if (inputRef.current) inputRef.current.value = ""; return; }
    const value: CvInfo = { name: file.name, size: file.size, type: "application/pdf" };
    setCv(value);
    sessionStorage.setItem(STORAGE.cv, JSON.stringify(value));
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
    sessionStorage.removeItem(STORAGE.cv);
    if (inputRef.current) inputRef.current.value = "";
  }

  const hasProject = isDemo || prerequisites.hasProject;
  const hasRole = isDemo || prerequisites.hasRole;
  const hasDescription = isDemo || prerequisites.hasJobDescription;
  const ready = hasProject && hasRole;
  const checks: ChecklistItem[] = [
    { text: "Minimal 1 proyek telah ditambahkan", complete: hasProject },
    { text: "Target role telah dipilih", complete: hasRole },
    { text: hasDescription ? "Job description tersedia" : "Job description (opsional)", complete: true },
    { text: cv ? "CV berhasil dipilih (opsional)" : "CV (opsional)", complete: true },
  ];

  function continueToReview() {
  if (!ready) {
    setRouteError(
      "Lengkapi minimal satu proyek dan target role terlebih dahulu."
    );
    return;
  }

  window.location.href = "/review-input";
}

  return (
    <div className={`cv-page ${collapsed ? "cv-page--collapsed" : ""}`}>
      <aside className="cv-sidebar" aria-label="Sidebar BUKTIVA">
        <div className="cv-brand-bar">
          <Link href="/" className="cv-brand" aria-label="BUKTIVA, ke beranda">
            <Image src="/images/logo-icon.svg" alt="" width={58} height={58} unoptimized />
            <span>BUKTIVA</span>
          </Link>
          <button className="cv-collapse" type="button" onClick={() => setCollapsed(!collapsed)} aria-label={collapsed ? "Perluas sidebar" : "Ciutkan sidebar"} aria-expanded={!collapsed}>
            <Icon name="menu" size={20}/>
          </button>
        </div>
        <nav className="cv-side-nav" aria-label="Navigasi utama">
          <Link href="/dashboard.html"><Icon name="home" /><span>Dashboard</span></Link>
          <Link href="/analisa-baru.html?next=1" className="cv-side-active" aria-current="page"><Icon name="chart" size={25}/><span>Analisa Baru</span></Link>
          <Link href="/riwayat-analis-dummy.html"><Icon name="history" /><span>Riwayat Analisis</span></Link>
          <Link href="/index_profile.html"><Icon name="user" /><span>Profile</span></Link>
        </nav>
        <Link href="/login" className="cv-logout"><Icon name="logout" /><span>Keluar</span></Link>
      </aside>

      <main className="cv-main" id="konten-utama">
        <nav className="cv-steps" aria-label="Tahapan analisis">
          {[
            { name: "Upload Project", href: "/analisa-baru.html?next=1" },
            { name: "Target Role", href: "/target-role.html?next=1" },
            { name: "CV", href: "/upload-cv" },
            { name: "Analisis", href: "/index_review_input.html?next=1" },
          ].map((step, index) => (
            <div className="cv-step-with-line" key={step.name}>
              {index > 0 && <span className="cv-step-line" aria-hidden="true" />}
              <Link href={step.href} className={`cv-step ${index === 2 ? "cv-step--current" : ""}`} aria-current={index === 2 ? "step" : undefined}>
                <span className={`cv-step-number ${index === 2 ? "cv-step-number--current" : ""}`}>{index + 1}</span>
                <span className="cv-step-label">{step.name}</span>
              </Link>
            </div>
          ))}
        </nav>

        <section className="cv-hero" aria-labelledby="cv-heading">
          <h1 id="cv-heading">Upload CV (Opsional)</h1>
          <p>CV membantu AI memahami latar belakang pendidikan,<br className="cv-desktop-break" /> pengalaman, dan skill tambahan kamu.</p>
          <div className="cv-upload-area">
            <div className="cv-file-column">
              <label htmlFor="cv-file" className={`cv-dropzone ${dragActive ? "cv-dropzone--drag" : ""} ${cvError ? "cv-dropzone--error" : ""}`} onDragOver={e => { e.preventDefault(); setDragActive(true); }} onDragLeave={e => { e.preventDefault(); setDragActive(false); }} onDrop={onDrop}>
                <input ref={inputRef} id="cv-file" name="cv" type="file" accept=".pdf,application/pdf" onChange={onFileChange} aria-describedby="cv-file-hint cv-file-error" />
                <Image src="/assets/images/upload_cv.png" width={70} height={70} alt="" unoptimized />
                <span className="cv-dropzone-title">Drag &amp; drop file CV di sini<br />atau klik untuk memilih</span>
                <span className="cv-dropzone-hint" id="cv-file-hint">PDF, maks 3 MB</span>
              </label>
              {cvError && <p className="cv-error" role="alert" id="cv-file-error">{cvError}</p>}
              {cv && <div className="cv-selected" role="status"><Icon name="file" size={21}/><span title={cv.name}>{cv.name}<small>{(cv.size / 1024 / 1024).toFixed(2)} MB • Dipilih untuk simulasi</small></span><button type="button" onClick={removeCv} aria-label="Hapus CV"><Icon name="close" size={18}/></button></div>}
            </div>
            <div className="cv-artwork" aria-hidden="true">
              <Image src="/assets/images/cv_ilustrasion.png" alt="" className="cv-artwork-bubble" width={195} height={130} unoptimized />
              <Image src="/assets/images/document_cv.png" alt="" className="cv-artwork-doc" width={215} height={215} unoptimized />
            </div>
          </div>
        </section>

        <section className={`cv-readiness ${ready ? "cv-readiness--ready" : "cv-readiness--incomplete"}`} aria-labelledby="cv-readiness-heading">
          <div className="cv-check-panel">
            <h2 id="cv-readiness-heading">Pemeriksaan Kelengkapan Input</h2>
            <ul>
              {checks.map(check => <li key={check.text}><span className={`cv-check-mark ${check.complete ? "" : "cv-check-mark--empty"}`} aria-label={check.complete ? "Terpenuhi" : "Belum terpenuhi"}>{check.complete ? "✓" : "!"}</span><span>{check.text}</span></li>)}
            </ul>
          </div>
          <div className="cv-status-panel" role="status" aria-live="polite">
            <Image src="/assets/images/ceklis2.png" alt="" width={77} height={77} unoptimized className={ready ? "" : "cv-status-icon--pending"}/>
            <h3>{!loaded ? "Memeriksa input…" : ready ? "Input sudah lengkap!" : "Input belum lengkap"}</h3>
            <p>{ready ? "Siap untuk memulai analisis." : "Tambahkan proyek dan pilih target role."}</p>
          </div>
        </section>
        {isDemo && <p className="cv-demo-note">Mode pratinjau desain: kelengkapan langkah sebelumnya ditampilkan sebagai simulasi.</p>}
        {routeError && <p className="cv-error cv-route-error" role="alert">{routeError}</p>}

        <div className="cv-actions">
          <Link className="cv-action cv-action-back" href="/target-role.html?next=1"><Icon name="arrow-left" size={19}/> Kembali</Link>
          <button className="cv-action cv-action-next" onClick={continueToReview} type="button">Lanjutkan <Icon name="arrow-right" size={20}/></button>
        </div>
      </main>
    </div>
  );
}
