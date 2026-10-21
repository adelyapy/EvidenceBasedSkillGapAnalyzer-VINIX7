"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { benefits, img } from "@/data/landing";

export default function About() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reducedMotion.matches) {
      section.classList.add("bk-about--visible");
      return;
    }

    section.classList.add("bk-about--motion");
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        section.classList.add("bk-about--visible");
        observer.disconnect();
      },
      { threshold: 0.14, rootMargin: "0px 0px -10%" },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      className="bk-section bk-about"
      id="tentang"
      aria-labelledby="about-title"
      ref={sectionRef}
    >
      <div className="bk-aboutTop">
        <div className="bk-aboutVisual">
          <Image
            src={img("tentang-illustration-crop.png")}
            alt="Ilustrasi analisis kompetensi, skill gap, dan roadmap pembelajaran"
            width={620}
            height={443}
            sizes="(max-width: 767px) 90vw, (max-width: 980px) 70vw, 44vw"
          />
        </div>
        <div className="bk-aboutCopy">
          <p className="bk-pill bk-aboutBadge">TENTANG BUKTIVA</p>
          <h2 id="about-title">
            <span>Lebih dari Sekadar</span> <span>Analisis Skill</span>
          </h2>
          <p className="bk-aboutDescription">
            Buktiva adalah platform berbasis AI yang membantu kamu menganalisis
            kompetensi dari proyek nyata, menemukan skill gap, dan mendapatkan
            roadmap pembelajaran yang sesuai dengan target kariermu.
          </p>
          {/* <p className="bk-aboutPrototype">
            Fitur analisis AI pada prototipe masih menggunakan simulasi hasil.
          </p> */}
        </div>
      </div>
      <ul className="bk-benefitGrid" aria-label="Keunggulan BUKTIVA">
        {benefits.map((benefit) => (
          <li className="bk-benefitItem" key={benefit.title}>
            <article className="bk-benefitCard">
              <div className="bk-benefitIcon" aria-hidden="true">
                <Image src={img(benefit.image)} alt="" width={72} height={72} />
              </div>
              <div className="bk-benefitContent">
                <h3>{benefit.title}</h3>
                <p>{benefit.description}</p>
              </div>
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}
