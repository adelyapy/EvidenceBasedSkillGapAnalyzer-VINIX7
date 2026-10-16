import Image from "next/image";
import Link from "next/link";
import { img } from "@/data/landing";

export default function Hero() {
  return (
    <section className="bk-section bk-hero" id="beranda" aria-labelledby="hero-title">
      <div className="bk-heroCopy">
        <p className="bk-pill">EVIDENCE-BASED SKILL GAP ANALYZER</p>
        <h1 id="hero-title">Dari Proyek<br />Nyata ke Karier<br />yang Terarah</h1>
        <p className="bk-heroDescription">
          Analisis kompetensi berdasarkan proyekmu dengan AI, temukan skill gap,
          dan dapatkan roadmap pembelajaran yang sesuai dengan target kariermu.
        </p>
        <Link className="bk-primaryButton" href="/login">
          Mulai Analisis Proyekmu <span aria-hidden="true">⟶</span>
        </Link>
      </div>
      <div className="bk-heroVisual">
        <Image
          src={img("hero-illustration.png")}
          alt="Pengguna mengunggah proyek, menganalisis kompetensi, dan membuat roadmap"
          width={690}
          height={460}
          priority
        />
      </div>
    </section>
  );
}
