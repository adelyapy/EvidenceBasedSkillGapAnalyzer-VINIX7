import Image from "next/image";
import Link from "next/link";
import "./landing.css";

const img = (name: string) => `/images/${name}`;

const benefits = [
  {
    title: "Berbasis Proyek Nyata",
    description: "Analisis kompetensi dari hasil proyek dan pengalamanmu.",
    image: "tentang-proyek-nyata.png",
  },
  {
    title: "Menggunakan AI",
    description: "AI menganalisis teknologi, peran, dan kontribusimu secara mendalam.",
    image: "tentang-ai.png",
  },
  {
    title: "Hasil yang Terstruktur",
    description: "Skill gap dan progres disajikan secara jelas dan mudah dipahami.",
    image: "tentang-hasil-terstruktur.png",
  },
  {
    title: "Cocok untuk Freshgraduate",
    description: "Dirancang khusus untuk mahasiswa dan freshgraduate di berbagai industri.",
    image: "tentang-freshgraduate.png",
  },
];

const steps = [
  {
    title: "Masukkan Proyek Kamu",
    description:
      "Masukkan tautan GitHub, portofolio, deployment, atau dokumen proyek yang pernah kamu kerjakan.",
    image: "cara-kerja-masukkan-proyek.png",
  },
  {
    title: "Validasi dengan AI",
    description:
      "AI mengajukan pertanyaan spesifik terkait proyekmu untuk memastikan pemahaman yang lebih akurat.",
    image: "cara-kerja-validasi-ai.png",
  },
  {
    title: "Lihat Skill Gap",
    description:
      "Bandingkan kompetensimu dengan kebutuhan target pekerjaan dan temukan skill yang perlu dikembangkan.",
    image: "cara-kerja-skill-gap.png",
  },
  {
    title: "Dapatkan Roadmap Belajar",
    description:
      "Terima rekomendasi pembelajaran sesuai skill gap dan target kariermu.",
    image: "cara-kerja-roadmap.png",
  },
];

const members = [
  {
    name: "Adelya Putri Yunita",
    role: "Backend Developer",
    description:
      "Mengembangkan sistem backend dan integrasi API untuk memastikan aplikasi berjalan dengan optimal.",
    image: "adelya-putri-yunita.png",
    linkedin: "https://www.linkedin.com/in/adelya-putri-yunita/",
    github: "https://github.com/adelyapy",
  },
  {
    name: "Septia Amanda Aulia",
    role: "Frontend Developer",
    description:
      "Mengimplementasikan desain dan membangun tampilan utama website secara responsif.",
    image: "septia-amanda-aulia.png",
    linkedin: "https://www.linkedin.com/in/septiaamandaaulia",
    github: "https://github.com/SeptiaAmandaAulia",
  },
  {
    name: "Hendri Muhrozikin",
    role: "Frontend Developer",
    description:
      "Mengembangkan fitur interaktif dan halaman analisis agar mudah digunakan pengguna.",
    image: "hendri-muhrozikin.png",
    linkedin: "https://www.linkedin.com/in/hendri-muhrozikin",
    github: "https://github.com/hendrik659",
  },
  {
    name: "Ulyatul Ula Khilmi",
    role: "AI Engineer",
    description:
      "Mengolah data pengguna dan mengembangkan proses ekstraksi serta identifikasi skill.",
    image: "ulyatul-ula-khilmi.png",
    linkedin: "https://www.linkedin.com/in/ulyatul-ula-khilmi",
    github: "https://github.com/UlyatulUlaa",
  },
  {
    name: "Widodo Nur Rahman",
    role: "AI Engineer",
    description:
      "Mengembangkan analisis skill gap dan rekomendasi berbasis teknologi AI.",
    image: "widodo-nur-rahman.png",
    linkedin: "https://www.linkedin.com/in/widodo-nur-rahman-1ab587369",
    github: "https://github.com/widodoNR",
  },
];

const navigation = [
  { label: "BERANDA", id: "beranda" },
  { label: "TENTANG", id: "tentang" },
  { label: "CARA KERJA", id: "cara-kerja" },
  { label: "TEAM KAMI", id: "team-kami" },
];

function Brand() {
  return (
    <a className="bk-brand" href="#beranda" aria-label="BUKTIVA, ke beranda">
      <Image src={img("logo-icon.svg")} alt="" width={40} height={40} />
      <span>BUKTIVA</span>
    </a>
  );
}

function Navbar() {
  return (
    <header className="bk-header">
      <nav className="bk-navbar" aria-label="Navigasi utama">
        <Brand />
        <div className="bk-navLinks">
          {navigation.map((item, index) => (
            <a
              key={item.id}
              className={index === 0 ? "bk-activeNav" : "bk-navLink"}
              href={`#${item.id}`}
            >
              {item.label}
            </a>
          ))}
        </div>
        <div className="bk-navActions">
          <Link className="bk-loginButton" href="/login">MASUK</Link>
          <Link className="bk-registerButton" href="/register">DAFTAR</Link>
        </div>
      </nav>
    </header>
  );
}

function Hero() {
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

function About() {
  return (
    <section className="bk-section bk-about" id="tentang" aria-labelledby="about-title">
      <div className="bk-aboutTop">
        <div className="bk-aboutVisual">
          <Image
            src={img("tentang-illustration-crop.png")}
            alt="Ilustrasi analisis kompetensi, skill gap, dan roadmap pembelajaran"
            width={470}
            height={340}
          />
        </div>
        <div className="bk-aboutCopy">
          <p className="bk-pill">TENTANG BUKTIVA</p>
          <h2 id="about-title">Lebih dari Sekadar<br />Analisis Skill</h2>
          <p>
            Buktiva adalah platform berbasis AI yang membantu kamu menganalisis
            kompetensi dari proyek nyata, menemukan skill gap, dan mendapatkan
            roadmap pembelajaran yang sesuai dengan target kariermu.
          </p>
        </div>
      </div>
      <div className="bk-benefitGrid">
        {benefits.map((benefit) => (
          <article className="bk-benefitCard" key={benefit.title}>
            <div className="bk-benefitTitle">
              <Image src={img(benefit.image)} alt="" width={68} height={68} />
              <h3>{benefit.title}</h3>
            </div>
            <p>{benefit.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section className="bk-section bk-howItWorks" id="cara-kerja" aria-labelledby="how-title">
      <div className="bk-sectionCenterTitle">
        <p className="bk-pill">CARA KERJA BUKTIVA</p>
        <h2 id="how-title">Langkah Mudah Menuju Karier Impian</h2>
        <p>
          Mulai dari proyek nyata sampai rekomendasi belajar yang disesuaikan
          dengan target kariermu.
        </p>
      </div>
      <ol className="bk-stepGrid">
        {steps.map((step, i) => (
          <li className="bk-stepCard" key={step.title}>
            <span className="bk-stepNumber">0{i + 1}</span>
            <div className="bk-stepIllustration">
              <Image src={img(step.image)} alt="" width={250} height={170} />
            </div>
            <h3>{step.title}</h3>
            <p>{step.description}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

function Team() {
  return (
    <section className="bk-section bk-team" id="team-kami" aria-labelledby="team-title">
      <div className="bk-teamIntro">
        <div className="bk-teamVisual">
          <Image
            src={img("team-illustration.png")}
            alt="Ilustrasi anggota tim BUKTIVA bekerja sama"
            width={490}
            height={280}
          />
        </div>
        <div className="bk-teamCopy">
          <p className="bk-pill">TEAM KAMI</p>
          <h2 id="team-title">Bersama Mewujudkan Karier<br />yang Lebih Terarah</h2>
          <p>
            Kami adalah tim yang memiliki semangat yang sama untuk membantu
            mahasiswa dan fresh graduate menemukan potensi diri melalui
            teknologi dan analisis data.
          </p>
        </div>
      </div>
      <div className="bk-teamGrid">
        {members.map((member) => (
          <article className="bk-memberCard" key={member.name}>
            <div className="bk-portrait">
              <Image src={img(member.image)} alt={`Potret ${member.name}`} width={140} height={140} />
            </div>
            <h3>{member.name}</h3>
            <p className="bk-role">{member.role}</p>
            <p className="bk-memberDescription">{member.description}</p>
            <div className="bk-socialLinks">
              <a href={member.linkedin} target="_blank" rel="noopener noreferrer" aria-label={`LinkedIn ${member.name}`}>in</a>
              <a href={member.github} target="_blank" rel="noopener noreferrer" aria-label={`GitHub ${member.name}`}>
                <svg aria-hidden="true" width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 .8a11.2 11.2 0 0 0-3.54 21.82c.56.1.76-.24.76-.54V20c-3.1.67-3.75-1.31-3.75-1.31-.5-1.28-1.23-1.62-1.23-1.62-1.01-.69.08-.68.08-.68 1.12.08 1.72 1.15 1.72 1.15 1 .1 1.64-.76 1.64-.76.09-.73.39-1.23.71-1.51-2.47-.28-5.08-1.24-5.08-5.53 0-1.22.44-2.22 1.16-3.01-.12-.28-.5-1.42.11-2.96 0 0 .95-.3 3.08 1.15A10.7 10.7 0 0 1 12 6.35c.95 0 1.9.13 2.79.37 2.13-1.45 3.07-1.15 3.07-1.15.62 1.54.24 2.68.12 2.96.73.79 1.15 1.79 1.15 3.01 0 4.31-2.62 5.25-5.11 5.53.4.35.75 1.04.75 2.11v2.9c0 .31.2.66.77.54A11.2 11.2 0 0 0 12 .8Z" />
                </svg>
              </a>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bk-footer">
      <div className="bk-footerInner">
        <div className="bk-footerBrand">
          <Brand />
          <p>
            BUKTIVA membantu mahasiswa dan freshgraduate memahami kompetensi,
            skill gap, dan roadmap karier berdasarkan proyek nyata.
          </p>
        </div>
        <div className="bk-footerGroup">
          <h2>Navigasi</h2>
          {navigation.map((item) => (
            <a key={item.id} href={`#${item.id}`}>{item.label}</a>
          ))}
        </div>
        <div className="bk-footerGroup">
          <h2>Kontak &amp; Informasi</h2>
          <a href="mailto:halo@buktiva.id">Bantuan: halo@buktiva.id</a>
          <span>Kebijakan Privasi</span>
          <span>BUKTIVA — VINIX7 Aurum</span>
        </div>
        <div className="bk-footerArt">
          <Image src={img("footer-illustration.png")} alt="Terima kasih telah menjadi bagian dari perjalanan ini" width={320} height={170} />
        </div>
      </div>
      <p className="bk-copyright">© 2026 BUKTIVA. VINIX7 Aurum.</p>
    </footer>
  );
}

export default function Home() {
  return (
    <div className="bk-landing">
      <Navbar />
      <main>
        <Hero />
        <About />
        <HowItWorks />
        <Team />
      </main>
      <Footer />
    </div>
  );
}
