import Image from "next/image";
import Link from "next/link";
import { img } from "@/data/landing";

export default function Hero() {
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
    </section>
  );
}
