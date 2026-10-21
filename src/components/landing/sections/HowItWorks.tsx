"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { img, steps } from "@/data/landing";

export default function HowItWorks() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reducedMotion.matches) {
      section.classList.add("bk-howItWorks--visible");
      return;
    }

    section.classList.add("bk-howItWorks--motion");
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        section.classList.add("bk-howItWorks--visible");
        observer.disconnect();
      },
      { threshold: 0.12, rootMargin: "0px 0px -8%" },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      className="bk-section bk-howItWorks"
      id="cara-kerja"
      aria-labelledby="how-title"
      ref={sectionRef}
    >
      <div className="bk-howHeader">
        <p className="bk-pill bk-howBadge">CARA KERJA BUKTIVA</p>
        <h2 id="how-title">
          <span>Langkah Mudah</span>
          <span>Menuju Karier Impian</span>
        </h2>
        <p className="bk-howDescription">
          Mulai dari proyek nyata sampai rekomendasi belajar yang disesuaikan
          dengan target kariermu.
        </p>
        {/* <p className="bk-howPrototype">
          Tahap AI menggambarkan alur produk dan masih berupa simulasi pada
          prototipe.
        </p> */}
      </div>
      <ol className="bk-stepGrid">
        {steps.map((step, i) => (
          <li className="bk-stepItem" key={step.title}>
            <article className="bk-stepCard">
              <span className="bk-stepNumber" aria-label={`Langkah ${i + 1}`}>
                0{i + 1}
              </span>
              <div className="bk-stepIllustration">
                <Image
                  src={img(step.image)}
                  alt=""
                  width={360}
                  height={240}
                  sizes="(max-width: 767px) 78vw, (max-width: 1023px) 42vw, 23vw"
                />
              </div>
              <div className="bk-stepContent">
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
            </article>
            {i < steps.length - 1 ? (
              <span className="bk-stepConnector" aria-hidden="true">
                <svg viewBox="0 0 40 20">
                  <path d="M2 10h31M26 3l7 7-7 7" />
                </svg>
              </span>
            ) : null}
          </li>
        ))}
      </ol>
    </section>
  );
}
