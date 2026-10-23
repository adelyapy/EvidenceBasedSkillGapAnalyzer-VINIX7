"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { img, members } from "@/data/landing";

function isTrustedProfileUrl(value: string, service: "github" | "linkedin") {
  try {
    const url = new URL(value);
    const expectedHost = service === "github" ? "github.com" : "linkedin.com";

    return (
      url.protocol === "https:" &&
      (url.hostname === expectedHost || url.hostname === `www.${expectedHost}`)
    );
  } catch {
    return false;
  }
}

function LinkedInIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M6.5 8.25H3.25V20H6.5V8.25ZM4.88 3A1.89 1.89 0 1 0 4.88 6.78 1.89 1.89 0 0 0 4.88 3ZM20.75 13.27c0-3.54-1.89-5.19-4.41-5.19a4.08 4.08 0 0 0-3.68 2.02V8.25H9.4V20h3.26v-5.82c0-1.53.29-3.01 2.18-3.01 1.86 0 1.88 1.74 1.88 3.11V20h3.26l.77-6.73Z" />
    </svg>
  );
}

function GithubIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M12 .8a11.2 11.2 0 0 0-3.54 21.82c.56.1.76-.24.76-.54V20c-3.1.67-3.75-1.31-3.75-1.31-.5-1.28-1.23-1.62-1.23-1.62-1.01-.69.08-.68.08-.68 1.12.08 1.72 1.15 1.72 1.15 1 .1 1.64-.76 1.64-.76.09-.73.39-1.23.71-1.51-2.47-.28-5.08-1.24-5.08-5.53 0-1.22.44-2.22 1.16-3.01-.12-.28-.5-1.42.11-2.96 0 0 .95-.3 3.08 1.15A10.7 10.7 0 0 1 12 6.35c.95 0 1.9.13 2.79.37 2.13-1.45 3.07-1.15 3.07-1.15.62 1.54.24 2.68.12 2.96.73.79 1.15 1.79 1.15 3.01 0 4.31-2.62 5.25-5.11 5.53.4.35.75 1.04.75 2.11v2.9c0 .31.2.66.77.54A11.2 11.2 0 0 0 12 .8Z" />
    </svg>
  );
}

export default function Team() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reducedMotion.matches) {
      section.classList.add("bk-team--visible");
      return;
    }

    section.classList.add("bk-team--motion");
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        section.classList.add("bk-team--visible");
        observer.disconnect();
      },
      { threshold: 0.1, rootMargin: "0px 0px -8%" },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      className="bk-section bk-team"
      id="team-kami"
      aria-labelledby="team-title"
      ref={sectionRef}
    >
      <div className="bk-teamIntro">
        <div className="bk-teamVisual">
          <Image
            src={img("team-illustration.png")}
            alt="Lima anggota tim BUKTIVA bekerja sama untuk satu tujuan"
            width={720}
            height={415}
            sizes="(max-width: 767px) 92vw, (max-width: 1023px) 76vw, 45vw"
          />
        </div>
        <div className="bk-teamCopy">
          <p className="bk-pill bk-teamBadge">TEAM KAMI</p>
          <h2 id="team-title">
            <span>Bersama Mewujudkan</span>{" "}
            <span>Karier yang</span>{" "}
            <span>Lebih Terarah</span>
          </h2>
          <p className="bk-teamDescription">
            Kami adalah tim yang memiliki semangat yang sama untuk membantu
            mahasiswa dan fresh graduate menemukan potensi diri melalui
            teknologi dan analisis data.
          </p>
        </div>
      </div>
      <ul className="bk-teamGrid" aria-label="Anggota tim BUKTIVA">
        {members.map((member) => (
          <li className="bk-memberItem" key={member.name}>
            <article className="bk-memberCard">
              <div className="bk-portrait">
                <Image
                  src={img(member.image)}
                  alt={`Potret ${member.name}`}
                  width={400}
                  height={400}
                  sizes="(max-width: 767px) 82vw, (max-width: 1023px) 40vw, (max-width: 1399px) 29vw, 18vw"
                />
              </div>
              <h3>{member.name}</h3>
              <p className="bk-role">{member.role}</p>
              <p className="bk-memberDescription">{member.description}</p>
              <div className="bk-socialLinks">
                {isTrustedProfileUrl(member.linkedin, "linkedin") ? (
                  <a
                    className="bk-socialLink bk-socialLink--linkedin"
                    href={member.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`LinkedIn ${member.name}`}
                  >
                    <LinkedInIcon />
                  </a>
                ) : null}
                {isTrustedProfileUrl(member.github, "github") ? (
                  <a
                    className="bk-socialLink bk-socialLink--github"
                    href={member.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`GitHub ${member.name}`}
                  >
                    <GithubIcon />
                  </a>
                ) : null}
              </div>
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}
