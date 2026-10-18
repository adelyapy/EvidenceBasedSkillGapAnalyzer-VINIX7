"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { navigation } from "@/data/landing";
import Brand from "./Brand";

const defaultSection = navigation[0]?.id ?? "beranda";

export default function Navbar() {
  const [activeSection, setActiveSection] = useState(defaultSection);

  useEffect(() => {
    const sections = navigation.flatMap((item) => {
      const element = document.getElementById(item.id);
      return element ? [{ id: item.id, element }] : [];
    });

    if (sections.length === 0) return;

    let animationFrame = 0;

    const updateActiveSection = () => {
      animationFrame = 0;

      const pageBottom = window.scrollY + window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      if (pageBottom >= documentHeight - 2) {
        setActiveSection(sections.at(-1)?.id ?? defaultSection);
        return;
      }

      if (window.scrollY <= 2) {
        setActiveSection(defaultSection);
        return;
      }

      const headerBottom =
        document.querySelector<HTMLElement>(".bk-header")?.getBoundingClientRect().bottom ?? 0;
      const visiblePageHeight = Math.max(0, window.innerHeight - headerBottom);
      const activationLine = headerBottom + Math.min(160, Math.max(32, visiblePageHeight * 0.22));

      let currentSection = sections[0].id;

      for (const section of sections) {
        if (section.element.getBoundingClientRect().top > activationLine) break;
        currentSection = section.id;
      }

      setActiveSection(currentSection);
    };

    const scheduleUpdate = () => {
      if (animationFrame) return;
      animationFrame = window.requestAnimationFrame(updateActiveSection);
    };

    const headerHeight = Math.ceil(
      document.querySelector<HTMLElement>(".bk-header")?.getBoundingClientRect().bottom ?? 0,
    );
    const sectionObserver = new IntersectionObserver(scheduleUpdate, {
      rootMargin: `-${headerHeight}px 0px -45% 0px`,
      threshold: [0, 0.01, 0.25, 0.5, 1],
    });

    sections.forEach(({ element }) => sectionObserver.observe(element));

    const header = document.querySelector<HTMLElement>(".bk-header");
    const headerObserver = header ? new ResizeObserver(scheduleUpdate) : null;
    if (header && headerObserver) headerObserver.observe(header);

    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    window.addEventListener("hashchange", scheduleUpdate);
    scheduleUpdate();

    return () => {
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
      sectionObserver.disconnect();
      headerObserver?.disconnect();
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      window.removeEventListener("hashchange", scheduleUpdate);
    };
  }, []);

  return (
    <header className="bk-header">
      <nav className="bk-navbar" aria-label="Navigasi utama">
        <Brand />
        <div className="bk-navLinks">
          {navigation.map((item) => {
            const active = activeSection === item.id;

            return (
              <a
                key={item.id}
                className={`bk-navLink${active ? " bk-activeNav" : ""}`}
                href={`#${item.id}`}
                aria-current={active ? "location" : undefined}
              >
                {item.label}
              </a>
            );
          })}
        </div>
        <div className="bk-navActions">
          <Link className="bk-loginButton" href="/login">MASUK</Link>
          <Link className="bk-registerButton" href="/register">DAFTAR</Link>
        </div>
      </nav>
    </header>
  );
}

