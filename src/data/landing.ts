export const img = (name: string) => `/images/${name}`;

export const benefits = [
  {
    title: "Berbasis Proyek Nyata",
    description: "Analisis kompetensi dari hasil proyek dan pengalamanmu.",
    image: "tentang-proyek-nyata.png",
  },
  {
    title: "Menggunakan AI",
    description:
      "AI menganalisis teknologi, peran, dan kontribusimu secara mendalam.",
    image: "tentang-ai.png",
  },
  {
    title: "Hasil yang Terstruktur",
    description:
      "Skill gap dan progres disajikan secara jelas dan mudah dipahami.",
    image: "tentang-hasil-terstruktur.png",
  },
  {
    title: "Cocok untuk Freshgraduate",
    description:
      "Dirancang khusus untuk mahasiswa dan fresh graduate di berbagai industri.",
    image: "tentang-freshgraduate.png",
  },
];

export const steps = [
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

export const members = [
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

export const navigation = [
  { label: "BERANDA", id: "beranda" },
  { label: "TENTANG", id: "tentang" },
  { label: "CARA KERJA", id: "cara-kerja" },
  { label: "TEAM KAMI", id: "team-kami" },
];

export const footerContent = {
  description:
    "BUKTIVA membantu mahasiswa dan fresh graduate memahami kompetensi berdasarkan proyek nyata, mengidentifikasi skill gap, dan merencanakan pengembangan karier yang lebih terarah.",
  email: "halo@buktiva.id",
  region: "Indonesia",
  socialLinks: [
    {
      label: "GitHub BUKTIVA",
      href: "https://github.com/adelyapy/EvidenceBasedSkillGapAnalyzer-VINIX7",
      service: "github",
    },
  ],
} as const;
