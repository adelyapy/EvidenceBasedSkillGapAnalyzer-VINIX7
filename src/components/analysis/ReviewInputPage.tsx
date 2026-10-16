"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AnalysisStepper from "./AnalysisStepper";
import { analysisRoutes, analysisStorage } from "@/data/analysis";
import type { AnalysisCv, AnalysisInput, AnalysisProject } from "@/types/analysis";

const EMPTY_INPUT: AnalysisInput = { projects: [], role: "", jobDescription: "", cv: null };

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
    ? rawProjects.filter((project): project is AnalysisProject => typeof project === "object" && project !== null)
    : [];
  const rawCv = readJson(analysisStorage.cv);
  const cv = rawCv && typeof rawCv === "object" && "name" in rawCv && typeof rawCv.name === "string" ? rawCv as AnalysisCv : null;

  return {
    projects,
    role: sessionStorage.getItem(analysisStorage.targetRole) || "",
    jobDescription: sessionStorage.getItem(analysisStorage.jobDescription) || "",
    cv,
  };
}

function EditButton({ href, label }: { href?: string; label: string }) {
  const content = <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" aria-hidden="true"><path d="m15 5 4 4M4 20l4-.8L20 7a2.8 2.8 0 0 0-4-4L4 15z" /></svg> Edit</>;

  return href ? (
    <Link className="review-edit" href={href} aria-label={`Edit ${label}`}>{content}</Link>
  ) : (
    <button className="review-edit" type="button" disabled title={`${label} belum tersedia di Next.js`}>{content}</button>
  );
}

export default function ReviewInputPage() {
  const router = useRouter();
  const [data, setData] = useState<AnalysisInput>(EMPTY_INPUT);
  const [loaded, setLoaded] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setData(readInput());
      setLoaded(true);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  const hasProjects = data.projects.length > 0;
  const hasRole = Boolean(data.role.trim());
  const canAnalyze = hasProjects && hasRole && accepted;

  function startAnalysis() {
    if (!hasProjects || !hasRole) {
      setMessage("Tambahkan minimal satu proyek dan pilih target role sebelum memulai analisis.");
      return;
    }

    if (!accepted) {
      setMessage("Centang konfirmasi kebenaran data terlebih dahulu.");
      return;
    }

    router.push(analysisRoutes.process);
  }

  return (
    <div className="review-main">
      <AnalysisStepper current="review" />
      <div className="review-body">
        <h1>Cek Kembali Informasi Anda</h1>
        <p className="review-subtitle">Pastikan semua data sudah benar sebelum memulai analisis.</p>

        <section className="review-box review-project" aria-labelledby="project-head">
          <div className="review-box-heading"><h2 id="project-head">Informasi Project</h2><EditButton href={analysisRoutes.uploadProject} label="informasi project" /></div>
          {hasProjects ? (
            <div className="review-project-list">
              {data.projects.map((project, index) => {
                const identifier = project.link || project.url || project.value || "";
                const isLink = /^https?:\/\//i.test(identifier);
                const projectName = project.name || project.title || (isLink ? `Project ${index + 1}` : project.value || `Project ${index + 1}`);
                const description = project.description || project.deskripsi || "";

                return (
                  <div className="review-project-record" key={`${identifier}-${index}`}>
                    {data.projects.length > 1 && <p className="review-project-count">Project {index + 1}</p>}
                    <div className="review-field"><b>{isLink ? "Link Project" : "Sumber Project"}</b><div>{identifier ? isLink ? <a href={identifier} target="_blank" rel="noopener noreferrer">{identifier}</a> : identifier : <span className="review-muted">Belum diisi</span>}</div></div>
                    <div className="review-field"><b>Nama Project</b><div>{projectName}</div></div>
                    <div className="review-field"><b>Deskripsi</b><div>{description || <span className="review-muted">Belum diisi</span>}</div></div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="review-empty">{loaded ? "Belum ada project yang ditambahkan." : "Memuat data project..."} <span title="Upload Project belum tersedia di Next.js">Tambah project</span></div>
          )}
        </section>

        <div className="review-bottom-grid">
          <section className="review-box" aria-labelledby="role-head">
            <div className="review-box-heading"><h2 id="role-head">Role Target</h2><EditButton href={analysisRoutes.targetRole} label="target role" /></div>
            <div className="review-role-content"><Image src="/images/role-review.png" alt="" width={88} height={88} unoptimized /><div>{hasRole ? <><strong>{data.role}</strong><p>{data.jobDescription || "Job description belum ditambahkan (opsional)."}</p></> : <><strong>Belum dipilih</strong><p>Silakan pilih target role terlebih dahulu.</p></>}</div></div>
          </section>
          <section className="review-box" aria-labelledby="cv-head">
            <div className="review-box-heading"><h2 id="cv-head">Upload CV</h2><EditButton href={analysisRoutes.uploadCv} label="CV" /></div>
            <div className="review-cv-content"><svg width="58" height="65" viewBox="0 0 58 65" aria-hidden="true"><path d="M11 2h26l15 15v42a4 4 0 0 1-4 4H11a4 4 0 0 1-4-4V6a4 4 0 0 1 4-4" fill="#dcebf6" /><path d="M37 2v15h15" fill="#315a7f" /><path d="M17 32h26M17 40h24M17 48h17" stroke="#315a7f" strokeWidth="3" strokeLinecap="round" /></svg><p title={data.cv?.name}>{data.cv?.name || "Tidak ada CV (opsional)"}</p></div>
          </section>
        </div>

        <label className="review-accept"><input type="checkbox" checked={accepted} onChange={(event) => { setAccepted(event.target.checked); setMessage(""); }} />Saya yakin data sudah benar dan siap dianalisis oleh AI.</label>
        {message && <p className="review-notice" role="status">{message}</p>}
        <div className="review-actions"><Link className="review-back" href={analysisRoutes.uploadCv}>← Kembali</Link><button type="button" className="review-start" disabled={!loaded || !canAnalyze} onClick={startAnalysis}>Mulai Analisis →</button></div>
        {loaded && (!hasProjects || !hasRole) && <p className="review-help">Tombol Mulai Analisis aktif setelah minimal satu project dan target role tersedia, serta konfirmasi dicentang. CV tetap opsional.</p>}
      </div>
    </div>
  );
}
