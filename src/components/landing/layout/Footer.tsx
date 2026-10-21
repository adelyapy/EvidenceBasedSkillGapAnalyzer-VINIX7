"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { footerContent, img, navigation } from "@/data/landing";
import Brand from "./Brand";

function formatNavigationLabel(label: string) {
  return label
    .toLocaleLowerCase("id-ID")
    .replace(/(^|\s)\S/g, (character) => character.toLocaleUpperCase("id-ID"));
}

function GithubIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M12 .8a11.2 11.2 0 0 0-3.54 21.82c.56.1.76-.24.76-.54V20c-3.1.67-3.75-1.31-3.75-1.31-.5-1.28-1.23-1.62-1.23-1.62-1.01-.69.08-.68.08-.68 1.12.08 1.72 1.15 1.72 1.15 1 .1 1.64-.76 1.64-.76.09-.73.39-1.23.71-1.51-2.47-.28-5.08-1.24-5.08-5.53 0-1.22.44-2.22 1.16-3.01-.12-.28-.5-1.42.11-2.96 0 0 .95-.3 3.08 1.15A10.7 10.7 0 0 1 12 6.35c.95 0 1.9.13 2.79.37 2.13-1.45 3.07-1.15 3.07-1.15.62 1.54.24 2.68.12 2.96.73.79 1.15 1.79 1.15 3.01 0 4.31-2.62 5.25-5.11 5.53.4.35.75 1.04.75 2.11v2.9c0 .31.2.66.77.54A11.2 11.2 0 0 0 12 .8Z" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m4 7 8 6 8-6" />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

export default function Footer() {
  const footerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const footer = footerRef.current;
    if (!footer) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reducedMotion.matches) {
      footer.classList.add("bk-footer--visible");
      return;
    }

    footer.classList.add("bk-footer--motion");
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        footer.classList.add("bk-footer--visible");
        observer.disconnect();
      },
      { threshold: 0.08, rootMargin: "0px 0px -4%" },
    );

    observer.observe(footer);
    return () => observer.disconnect();
  }, []);

  return (
    <footer className="bk-footer" ref={footerRef}>
      <span
        className="bk-footerDecoration bk-footerDecoration--blob"
        aria-hidden="true"
      />
      <span
        className="bk-footerDecoration bk-footerDecoration--dots"
        aria-hidden="true"
      />

      <div className="bk-footerInner">
        <section className="bk-footerBrand" aria-label="Tentang BUKTIVA">
          <div className="bk-footerBrandMark">
            <Brand />
          </div>
          <p>{footerContent.description}</p>
          <div className="bk-footerSocials" aria-label="Media sosial BUKTIVA">
            {footerContent.socialLinks.map((social) => (
              <a
                className="bk-footerSocialLink"
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
                key={social.service}
              >
                <GithubIcon />
              </a>
            ))}
          </div>
        </section>

        <nav
          className="bk-footerColumn bk-footerNavigation"
          aria-labelledby="footer-navigation-title"
        >
          <h2 id="footer-navigation-title">Navigasi</h2>
          <ul>
            {navigation.map((item) => (
              <li key={item.id}>
                <a className="bk-footerLink" href={`#${item.id}`}>
                  {formatNavigationLabel(item.label)}
                </a>
              </li>
            ))}
            <li>
              <Link className="bk-footerLink" href="/login">
                Masuk
              </Link>
            </li>
            <li>
              <Link className="bk-footerLink" href="/register">
                Daftar
              </Link>
            </li>
          </ul>
        </nav>

        <section
          className="bk-footerColumn bk-footerContact"
          aria-labelledby="footer-contact-title"
        >
          <h2 id="footer-contact-title">Hubungi Kami</h2>
          <ul>
            <li>
              <a
                className="bk-footerContactItem bk-footerContactLink"
                href={`mailto:${footerContent.email}`}
              >
                <span className="bk-footerContactIcon">
                  <MailIcon />
                </span>
                <span>{footerContent.email}</span>
              </a>
            </li>
            <li>
              <span className="bk-footerContactItem">
                <span className="bk-footerContactIcon">
                  <LocationIcon />
                </span>
                <span>{footerContent.region}</span>
              </span>
            </li>
          </ul>
        </section>

        <div className="bk-footerArt">
          <Image
            src={img("footer-illustration.png")}
            alt="Robot BUKTIVA membawa pesan terima kasih telah menjadi bagian dari perjalanan ini"
            width={600}
            height={249}
            sizes="(max-width: 767px) 92vw, (max-width: 1150px) 46vw, 30vw"
          />
        </div>
      </div>

      <div className="bk-footerBottom">
        <div className="bk-footerBottomInner">
          <p>© 2026 BUKTIVA — VINIX7 Aurum. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
