"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { heroSteps, img } from "@/data/landing";

type HeroStepIconName = (typeof heroSteps)[number]["icon"];

function HeroStepIcon({ name }: { name: HeroStepIconName }) {
  if (name === "upload") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5M5 14v5h14v-5" />
      </svg>
    );
  }

  if (name === "analysis") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 19V9m7 10V5m7 14v-7M3 19h18" />
        <circle cx="5" cy="7" r="1.5" />
        <circle cx="12" cy="3" r="1.5" />
        <circle cx="19" cy="10" r="1.5" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="5" cy="6" r="2" />
      <circle cx="19" cy="6" r="2" />
      <circle cx="12" cy="18" r="2" />
      <path d="M7 6h10M6.5 7.5l4.3 8.7m6.7-8.7-4.3 8.7" />
    </svg>
  );
}

export default function Hero() {
  const processRef = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const processPanel = processRef.current;
    if (!processPanel) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reducedMotion.matches) {
      processPanel.classList.add("bk-heroProcess--visible");
      return;
    }

    processPanel.classList.add("bk-heroProcess--motion");
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        processPanel.classList.add("bk-heroProcess--visible");
        observer.disconnect();
      },
      { threshold: 0.18, rootMargin: "0px 0px -8%" },
    );

    observer.observe(processPanel);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      className="bk-section bk-hero"
      id="beranda"
      aria-labelledby="hero-title"
    >
      <div className="bk-heroMain">
        <div className="bk-heroCopy">
          <p className="bk-pill bk-heroBadge">EVIDENCE-BASED SKILL GAP ANALYZER</p>
          <h1 id="hero-title">
            <span>Dari Proyek</span>{" "}
            <span>Nyata ke Karier</span>{" "}
            <span>yang Terarah</span>
          </h1>
          <p className="bk-heroDescription">
            Analisis kompetensi berdasarkan proyekmu dengan AI, temukan skill gap,
            dan dapatkan roadmap pembelajaran yang sesuai dengan target kariermu.
          </p>
          <div className="bk-heroActions">
            <Link className="bk-heroButton bk-primaryButton" href="/login">
              Mulai Analisis Proyekmu <span aria-hidden="true">→</span>
            </Link>
            <a className="bk-heroButton bk-secondaryButton" href="#cara-kerja">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M5 5.5h10.5A2.5 2.5 0 0 1 18 8v10.5H7.5A2.5 2.5 0 0 1 5 16V5.5Zm0 0V16a2.5 2.5 0 0 0 2.5 2.5M9 9h5M9 12.5h5" />
              </svg>
              Lihat Cara Kerja
            </a>
          </div>
        </div>

        <div className="bk-heroVisual">
          <Image
            src={img("hero-illustration.png")}
            alt="Mahasiswa menggunakan laptop dengan alur upload proyek, analisis kompetensi, dan pembuatan roadmap"
            width={690}
            height={460}
            sizes="(max-width: 767px) 94vw, (max-width: 1199px) 48vw, 620px"
            priority
          />
        </div>
      </div>

      <ol className="bk-heroProcess" ref={processRef} aria-label="Ringkasan tiga langkah BUKTIVA">
        {heroSteps.map((step) => (
          <li className="bk-heroStep" key={step.number}>
            <span className="bk-heroStepNumber">{step.number}</span>
            <span className="bk-heroStepIcon"><HeroStepIcon name={step.icon} /></span>
            <span className="bk-heroStepCopy">
              <strong>{step.title}</strong>
              <span>{step.description}</span>
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
