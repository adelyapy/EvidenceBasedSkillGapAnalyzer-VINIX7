"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import "./review-input.css";

type Project = { type?: string; value?: string; name?: string; title?: string; description?: string; deskripsi?: string; link?: string; url?: string };
type CvData = { name: string; size?: number };
type InputData = { projects: Project[]; role: string; jobDescription: string; cv: CvData | null };
const EMPTY: InputData = { projects: [], role: "", jobDescription: "", cv: null };
const URLS = { project: "/analisa-baru.html?next=1", role: "/target-role.html?next=1", cv: "/upload-cv", review: "/review-input" };

function readInput(): InputData {
  const readJson = (key: string): unknown => { try { return JSON.parse(sessionStorage.getItem(key) || "null"); } catch { return null; } };
  const rawProjects = readJson("buktiva.analysis.projects");
  const projects = Array.isArray(rawProjects) ? rawProjects.filter((p): p is Project => typeof p === "object" && p !== null) : [];
  const rawCv = readJson("buktiva.analysis.cv");
  const cv = rawCv && typeof rawCv === "object" && "name" in rawCv && typeof rawCv.name === "string" ? rawCv as CvData : null;
  return { projects, role: sessionStorage.getItem("buktiva.analysis.targetRole") || "", jobDescription: sessionStorage.getItem("buktiva.analysis.jobDescription") || "", cv };
}

function NavIcon({ name }: { name: "home" | "chart" | "history" | "user" | "logout" }) {
  const common = { width: 19, height: 19, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2.4, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  if (name === "home") return <svg {...common}><path d="m3 10 9-7 9 7M5 9v11h14V9M9 20v-7h6v7"/></svg>;
  if (name === "chart") return <svg {...common}><rect x="3" y="13" width="4" height="8" rx="2" fill="currentColor" stroke="none"/><rect x="10" y="8" width="4" height="13" rx="2" fill="currentColor" stroke="none"/><rect x="17" y="3" width="4" height="18" rx="2" fill="currentColor" stroke="none"/></svg>;
  if (name === "history") return <svg {...common}><path d="M3 12a9 9 0 1 0 3-6.7M3 4v5h5M12 7v6l4 2"/></svg>;
  if (name === "user") return <svg {...common}><circle cx="12" cy="7" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2z"/></svg>;
  return <svg {...common}><path d="M14 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8M15 8l4 4-4 4M9 12h10"/></svg>;
}

function EditButton({ href }: { href: string }) { return <Link className="review-edit" href={href} aria-label={`Edit informasi, kembali ke ${href}`}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3"><path d="m15 5 4 4M4 20l4-.8L20 7a2.8 2.8 0 0 0-4-4L4 15z"/></svg> Edit</Link>; }

export default function ReviewInputPage() {
  const [data, setData] = useState<InputData>(EMPTY);
  const [loaded, setLoaded] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [message, setMessage] = useState("");
  const [collapsed, setCollapsed] = useState(false);
  useEffect(() => { const raf = requestAnimationFrame(() => { setData(readInput()); setLoaded(true); }); return () => cancelAnimationFrame(raf); }, []);
  const hasProjects = data.projects.length > 0;
  const hasRole = Boolean(data.role.trim());
  const canAnalyze = hasProjects && hasRole && accepted;
  function startAnalysis() {
  // Validasi project dan target role
  if (!hasProjects || !hasRole) {
    setMessage(
      "Tambahkan minimal satu proyek dan pilih target role sebelum memulai analisis."
    );
    return;
  }

  // Validasi checkbox konfirmasi
  if (!accepted) {
    setMessage(
      "Centang konfirmasi kebenaran data terlebih dahulu."
    );
    return;
  }

  // Navigasi ke halaman proses analisis
  window.location.href = "/proses-analisis";
}
  return <div className={`review-shell ${collapsed ? "review-shell--collapsed" : ""}`}>
    <aside className="review-sidebar" aria-label="Sidebar BUKTIVA">
      <div className="review-brand">
        <Link href="/" className="review-brand-link" aria-label="BUKTIVA - Beranda"><Image src="/images/logo-icon.svg" width={58} height={58} alt="" unoptimized/><span>BUKTIVA</span></Link>
        <button className="review-collapse" type="button" onClick={() => setCollapsed(!collapsed)} aria-label={collapsed ? "Perluas sidebar" : "Ciutkan sidebar"} aria-expanded={!collapsed}>«</button>
      </div>
      <nav className="review-nav" aria-label="Navigasi utama">
        <Link href="/dashboard.html"><NavIcon name="home"/><span>Dashboard</span></Link>
        <Link href={URLS.project} className="selected" aria-current="page"><NavIcon name="chart"/><span>Analisa Baru</span></Link>
        <Link href="/riwayat-analis-dummy.html"><NavIcon name="history"/><span>Riwayat Analisis</span></Link>
        <Link href="/index_profile.html"><NavIcon name="user"/><span>Profile</span></Link>
      </nav>
      <Link className="review-logout" href="/login"><NavIcon name="logout"/><span>Keluar</span></Link>
    </aside>
    <main className="review-main">
      <nav className="review-steps" aria-label="Tahapan analisis">
        {[{label:"Upload Project",url:URLS.project},{label:"Target Role",url:URLS.role},{label:"CV",url:URLS.cv},{label:"Analisis",url:URLS.review}].map((step,i) => (
          <div className="review-step-wrap" key={step.label}>
            {i>0 && <span className="review-step-connector" aria-hidden="true"/>}
            <Link href={step.url} className={`review-step ${i===3?"active":""}`} aria-current={i===3?"step":undefined}>
              <span className="review-step-circle">{i+1}</span><span className="review-step-label">{step.label}</span>
            </Link>
          </div>
        ))}
      </nav>
      <div className="review-body">
        <h1>Cek Kembali Informasi Anda</h1><p className="review-subtitle">Pastikan semua data sudah benar sebelum memulai analisis.</p>
        <section className="review-box review-project" aria-labelledby="project-head"><div className="review-box-heading"><h2 id="project-head">Informasi Project</h2><EditButton href={URLS.project}/></div>
          {hasProjects ? <div className="review-project-list">{data.projects.map((project,idx) => {
            const identifier = project.link || project.url || project.value || "";
            const isLink = /^https?:\/\//i.test(identifier);
            const projectName = project.name || project.title || (isLink ? `Project ${idx+1}` : project.value || `Project ${idx+1}`);
            const description = project.description || project.deskripsi || "";
            return <div className="review-project-record" key={`${identifier}-${idx}`}>
              {data.projects.length > 1 && <p className="review-project-count">Project {idx+1}</p>}
              <div className="review-field"><b>{isLink ? "Link Project" : "Sumber Project"}</b><div>{identifier ? isLink ? <a href={identifier} target="_blank" rel="noopener noreferrer">{identifier}</a> : identifier : <span className="review-muted">Belum diisi</span>}</div></div>
              <div className="review-field"><b>Nama Project</b><div>{projectName}</div></div>
              <div className="review-field"><b>Deskripsi</b><div>{description || <span className="review-muted">Belum diisi</span>}</div></div>
            </div>;
          })}</div> : <div className="review-empty">{loaded ? "Belum ada project yang ditambahkan." : "Memuat data project..."} <Link href={URLS.project}>Tambah project</Link></div>}
        </section>
        <div className="review-bottom-grid">
          <section className="review-box" aria-labelledby="role-head"><div className="review-box-heading"><h2 id="role-head">Role Target</h2><EditButton href={URLS.role}/></div><div className="review-role-content"><Image src="/asset/images/role-review.png" alt="" width={88} height={88} unoptimized onError={e => { e.currentTarget.style.visibility="hidden"; }}/><div>{hasRole ? <><strong>{data.role}</strong><p>{data.jobDescription || "Job description belum ditambahkan (opsional)."}</p></> : <><strong>Belum dipilih</strong><p>Silakan pilih target role terlebih dahulu.</p></>}</div></div></section>
          <section className="review-box" aria-labelledby="cv-head"><div className="review-box-heading"><h2 id="cv-head">Upload CV</h2><EditButton href={URLS.cv}/></div><div className="review-cv-content"><svg width="58" height="65" viewBox="0 0 58 65" aria-hidden="true"><path d="M11 2h26l15 15v42a4 4 0 0 1-4 4H11a4 4 0 0 1-4-4V6a4 4 0 0 1 4-4" fill="#dcebf6"/><path d="M37 2v15h15" fill="#315a7f"/><path d="M17 32h26M17 40h24M17 48h17" stroke="#315a7f" strokeWidth="3" strokeLinecap="round"/></svg><p title={data.cv?.name}>{data.cv?.name || "Tidak ada CV (opsional)"}</p></div></section>
        </div>
        <label className="review-accept"><input type="checkbox" checked={accepted} onChange={e=>{setAccepted(e.target.checked);setMessage("");}}/>Saya yakin data sudah benar dan siap dianalisis oleh AI.</label>
        {message && <p className="review-notice" role="status">{message}</p>}
        <div className="review-actions"><Link className="review-back" href={URLS.cv}>← Kembali</Link><button type="button" className="review-start" disabled={!loaded || !canAnalyze} onClick={startAnalysis}>Mulai Analisis →</button></div>
        {loaded && (!hasProjects || !hasRole) && <p className="review-help">Tombol Mulai Analisis aktif setelah minimal satu project dan target role tersedia, serta konfirmasi dicentang. CV tetap opsional.</p>}
      </div>
    </main>
  </div>;
}
