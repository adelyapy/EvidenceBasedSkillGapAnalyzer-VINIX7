"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import "./proses-analisis.css";

// Durasi DEMO saja. Progres ini bukan hasil analisis AI sungguhan.
const DURATION_MS = 12000;
const NEXT_URL = "/pertanyaan-1";

function Icon({ kind }: { kind: "home" | "chart" | "history" | "profile" | "logout" }) {
  const common = { width: 19, height: 19, viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2.4, fill: "none", strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (kind) {
    case "home": return <svg {...common}><path d="m3 10 9-7 9 7M5 9v11h14V9M9 20v-7h6v7" /></svg>;
    case "chart": return <svg {...common}><rect x="3" y="13" width="4" height="8" rx="2" fill="currentColor" stroke="none"/><rect x="10" y="8" width="4" height="13" rx="2" fill="currentColor" stroke="none"/><rect x="17" y="3" width="4" height="18" rx="2" fill="currentColor" stroke="none"/></svg>;
    case "history": return <svg {...common}><path d="M3 12a9 9 0 1 0 3-6.7M3 4v5h5M12 7v6l4 2" /></svg>;
    case "profile": return <svg {...common}><circle cx="12" cy="7" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2z"/></svg>;
    case "logout": return <svg {...common}><path d="M14 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8M15 8l4 4-4 4M9 12h10"/></svg>;
  }
}

export default function ProsesAnalisisPage() {
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const [collapsed, setCollapsed] = useState(false);
  const rafRef = useRef<number | null>(null);
  const navigatedRef = useRef(false);

useEffect(() => {
  let currentProgress = 0;

  const interval = window.setInterval(() => {
    currentProgress = Math.min(currentProgress + 1, 100);

    setProgress(currentProgress);

    if (currentProgress >= 100) {
      window.clearInterval(interval);

      window.setTimeout(() => {
        window.location.href = "/pertanyaan-1";
      }, 500);
    }
  }, 120);

  return () => {
    window.clearInterval(interval);
  };
}, []);

  return <div className={`process-shell ${collapsed ? "process-shell--collapsed" : ""}`}>
    <aside className="process-sidebar">
      <div className="process-brand"><Link href="/" className="process-brand-link"><Image src="/images/logo-icon.svg" width={37} height={43} alt="" unoptimized/><strong>BUKTIVA</strong></Link><button type="button" className="process-collapse" aria-label="Ciutkan sidebar" onClick={() => setCollapsed(v => !v)}>«</button></div>
      <nav className="process-nav" aria-label="Navigasi utama">
        <Link href="/dashboard.html"><Icon kind="home"/><span>Dashboard</span></Link>
        <Link className="selected" href="/analisa-baru.html"><Icon kind="chart"/><span>Analisa Baru</span></Link>
        <Link href="/riwayat-analis-dummy.html"><Icon kind="history"/><span>Riwayat Analisis</span></Link>
        <Link href="/index_profile.html"><Icon kind="profile"/><span>Profile</span></Link>
      </nav>
      <Link href="/login" className="process-logout"><Icon kind="logout"/><span>Keluar</span></Link>
    </aside>
    <main className="process-main">
      <nav className="process-steps" aria-label="Tahapan analisis">
        {[["Upload Project","/analisa-baru.html"],["Target Role","/target-role.html"],["CV","/upload-cv"],["Analisis","/review-input"]].map(([label,href],index) => <div className="process-step-wrap" key={label}>{index>0 && <span className="process-connector" aria-hidden="true"/>}<Link href={href} className={`process-step ${index===3?"active":""}`} aria-current={index===3 ? "step" : undefined}><span className="process-step-number">{index+1}</span><span className="process-step-label">{label}</span></Link></div>)}
      </nav>
      <section className="process-content" aria-labelledby="process-heading">
        <h1 id="process-heading">AI Sedang Menganalisis<br/>proyek kamu...</h1>
        <p className="process-description">Proses ini biasanya memakan waktu 1–3 menit.<br/>Kami menganalisis teknologi, peran, dan kontribusimu.</p>
        <div className="process-illustration"><Image src="/assets/images/proses-illustrasion.png" alt="Ilustrasi robot sedang menganalisis teknologi, konteks proyek, dan skill" width={703} height={301} unoptimized priority /></div>
        <div className="process-progress-row">
  <div
    className="process-progress-track"
    role="progressbar"
    aria-valuenow={progress}
    aria-valuemin={0}
    aria-valuemax={100}
  >
    <div
      className="process-progress-fill"
      style={{ width: `${progress}%` }}
    />
  </div>

  <span className="process-progress-value">
    {progress}%
  </span>
</div>
        <div className="process-alert"><span className="process-alert-icon" aria-hidden="true">i</span><span>Jangan tutup halaman ini. Kamu akan diarahkan otomatis setelah proses selesai.</span></div>
      </section>
    </main>
  </div>;
}
