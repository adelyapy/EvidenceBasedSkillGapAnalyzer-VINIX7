
"use client";

import { useEffect, useState } from "react";

const menuItems = [
  { id: "beranda", label: "BERANDA" },
  { id: "tentang", label: "TENTANG" },
  { id: "cara-kerja", label: "CARA KERJA" },
  { id: "team-kami", label: "TEAM KAMI" },
];

export default function LandingNavbar() {
  const [activeMenu, setActiveMenu] = useState("beranda");

  useEffect(() => {
    function handleScroll() {
      let currentSection = "beranda";

      menuItems.forEach((item) => {
        const section = document.getElementById(item.id);

        if (section) {
          const position = section.getBoundingClientRect();

          if (position.top <= 170) {
            currentSection = item.id;
          }
        }
      });

      setActiveMenu(currentSection);
    }

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <nav className="landing-nav-links">
      {menuItems.map((item) => (
        <a
          key={item.id}
          href={`#${item.id}`}
          onClick={() => setActiveMenu(item.id)}
          className={`landing-nav-link ${
            activeMenu === item.id ? "active" : ""
          }`}
        >
          {item.label}
        </a>
      ))}
    </nav>
  );
}
