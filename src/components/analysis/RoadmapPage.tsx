"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { analysisRoutes, analysisStorage } from "@/data/analysis";
import {
  ROADMAP_CAREER_ID,
  ROADMAP_CAREER_LABEL,
  roadmapSteps,
} from "@/data/roadmap";
import RoadmapStepCard from "./RoadmapStepCard";

export default function RoadmapPage() {
  const [targetRole, setTargetRole] = useState<string | null>(null);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      try {
        setTargetRole(sessionStorage.getItem(analysisStorage.targetRole));
      } catch {
        // The demo roadmap remains available when session storage is unavailable.
      }
    });

    return () => cancelAnimationFrame(frame);
  }, []);

  const roleMismatch = Boolean(targetRole && targetRole !== ROADMAP_CAREER_LABEL);

  return (
    <article className="bkrm-page" aria-labelledby="bkrm-title">
      <header className="bkrm-intro">
        <div className="bkrm-introCopy">
          <h1 id="bkrm-title">Road Map Pengembangan Skill</h1>
          <p>Rekomendasi pembelajaran yang disesuaikan dengan skill gap dan target kariermu.</p>
        </div>

        <div className="bkrm-careerForm">
          <label htmlFor="bkrm-career">Target Karier</label>
          <select id="bkrm-career" name="career" defaultValue={ROADMAP_CAREER_ID}>
            <option value={ROADMAP_CAREER_ID}>{ROADMAP_CAREER_LABEL}</option>
          </select>
        </div>
      </header>

      <aside className={`bkrm-demoNotice${roleMismatch ? " bkrm-demoNotice--warning" : ""}`} aria-label="Keterangan roadmap contoh">
        <strong>Roadmap contoh Frontend Developer.</strong>{" "}
        Data ini masih prototipe dan bukan hasil kalkulasi AI.
        {roleMismatch && ` Target role Anda adalah ${targetRole}; penyimpanan dinonaktifkan agar contoh ini tidak dianggap sebagai roadmap personal.`}
      </aside>

      <section className="bkrm-roadmap" aria-labelledby="bkrm-roadmap-title">
        <h2 className="bkrm-srOnly" id="bkrm-roadmap-title">Tahapan Pengembangan Skill</h2>
        <ol className="bkrm-stepGrid">
          {roadmapSteps.map((step, index) => (
            <RoadmapStepCard key={step.id} number={index + 1} step={step} />
          ))}
        </ol>
      </section>

      <nav className="bkrm-bottomNav" aria-label="Navigasi Road Map Pengembangan Skill">
        <Link className="bkrm-backButton" href={analysisRoutes.skillGap}>← Kembali ke Skill Gap Report</Link>
        <Link className="bkrm-dashboardButton" href="/workspace/dashboard">Kembali ke Dashboard</Link>
      </nav>
    </article>
  );
}
