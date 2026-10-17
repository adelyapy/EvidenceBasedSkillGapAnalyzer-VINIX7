"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { analysisRoutes, analysisStorage } from "@/data/analysis";
import {
  createSavedRoadmap,
  ROADMAP_CAREER_ID,
  ROADMAP_CAREER_LABEL,
  ROADMAP_STORAGE_KEY,
  roadmapSteps,
} from "@/data/roadmap";
import RoadmapStepCard from "./RoadmapStepCard";

export default function RoadmapPage() {
  const router = useRouter();
  const [loaded, setLoaded] = useState(false);
  const [targetRole, setTargetRole] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      try {
        setTargetRole(sessionStorage.getItem(analysisStorage.targetRole));
      } catch {
        setMessage("Penyimpanan sesi browser tidak tersedia. Roadmap demo tidak dapat disimpan.");
      } finally {
        setLoaded(true);
      }
    });

    return () => cancelAnimationFrame(frame);
  }, []);

  const roleMismatch = Boolean(targetRole && targetRole !== ROADMAP_CAREER_LABEL);
  const canSave = loaded && !roleMismatch && !message;

  function saveRoadmap(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (roleMismatch) {
      setMessage(`Target role tersimpan adalah ${targetRole}. Roadmap contoh Frontend Developer tidak disimpan sebagai roadmap personal Anda.`);
      return;
    }

    try {
      sessionStorage.setItem(ROADMAP_STORAGE_KEY, JSON.stringify(createSavedRoadmap()));
      router.push("/workspace/dashboard");
    } catch {
      setMessage("Roadmap tidak dapat disimpan pada sesi browser. Silakan periksa pengaturan penyimpanan browser dan coba lagi.");
    }
  }

  return (
    <article className="bkrm-page" aria-labelledby="bkrm-title">
      <header className="bkrm-intro">
        <div className="bkrm-introCopy">
          <h1 id="bkrm-title">Road Map Pengembangan Skill</h1>
          <p>Rekomendasi pembelajaran yang disesuaikan dengan skill gap dan target kariermu.</p>
        </div>

        <form className="bkrm-careerForm" onSubmit={saveRoadmap}>
          <label htmlFor="bkrm-career">Target Karier</label>
          <select id="bkrm-career" name="career" defaultValue={ROADMAP_CAREER_ID}>
            <option value={ROADMAP_CAREER_ID}>{ROADMAP_CAREER_LABEL}</option>
          </select>
          <button type="submit" disabled={!canSave} aria-describedby="bkrm-save-help">
            Simpan Ke Dashboard
          </button>
          <p id="bkrm-save-help">Disimpan sementara hanya selama sesi/tab browser ini.</p>
        </form>
      </header>

      <aside className={`bkrm-demoNotice${roleMismatch ? " bkrm-demoNotice--warning" : ""}`} aria-label="Keterangan roadmap contoh">
        <strong>Roadmap contoh Frontend Developer.</strong>{" "}
        Data ini masih prototipe dan bukan hasil kalkulasi AI.
        {roleMismatch && ` Target role Anda adalah ${targetRole}; penyimpanan dinonaktifkan agar contoh ini tidak dianggap sebagai roadmap personal.`}
      </aside>

      {message && <p className="bkrm-message" role="alert">{message}</p>}

      <section className="bkrm-roadmap" aria-labelledby="bkrm-roadmap-title">
        <h2 className="bkrm-srOnly" id="bkrm-roadmap-title">Tahapan Pengembangan Skill</h2>
        <ol className="bkrm-stepGrid">
          {roadmapSteps.map((step, index) => (
            <RoadmapStepCard key={step.id} number={index + 1} step={step} />
          ))}
        </ol>
      </section>

      <nav className="bkrm-bottomNav" aria-label="Navigasi Road Map Pengembangan Skill">
        <Link href={analysisRoutes.skillGap}>← Kembali ke Skill Gap Report</Link>
        <Link href="/workspace/dashboard">Kembali ke Dashboard</Link>
      </nav>
    </article>
  );
}
