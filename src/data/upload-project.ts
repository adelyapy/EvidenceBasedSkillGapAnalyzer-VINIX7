import type { UploadProjectSourceOption } from "@/types/upload-project";

export const UPLOAD_PROJECT_LINKS_STORAGE_KEY = "buktiva:upload-project:links:v1";

export const uploadProjectSources: UploadProjectSourceOption[] = [
  {
    id: "github",
    label: "GitHub URL",
    description: "Hubungkan repository dari GitHub",
    inputLabel: "Link Repository GitHub",
    placeholder: "https://github.com/username/repository.git",
  },
  {
    id: "portfolio",
    label: "Portfolio URL",
    description: "Masukkan link portfolio pribadi kamu",
    inputLabel: "Link Portfolio",
    placeholder: "https://portfolio-kamu.com",
  },
  {
    id: "deployment",
    label: "Deployment URL",
    description: "Link situs yang sudah di-deploy",
    inputLabel: "Link Deployment",
    placeholder: "https://project-kamu.com",
  },
  {
    id: "linkedin",
    label: "LinkedIn URL",
    description: "Opsional untuk portofolio dan pengalaman profesional",
    inputLabel: "Link Profil LinkedIn",
    placeholder: "https://www.linkedin.com/in/namamu",
  },
  {
    id: "pdf",
    label: "Upload PDF",
    description: "Unggah file laporan atau dokumentasi",
    inputLabel: "Pilih Dokumen PDF",
  },
];

export const uploadProjectTips = [
  "Pilih bukti yang paling relevan dengan target pekerjaan yang kamu pilih.",
  "Gunakan LinkedIn untuk menampilkan pengalaman, organisasi, atau sertifikat profesional.",
  "Sertakan dokumentasi, laporan, atau portofolio yang menunjukkan kontribusi terbaik kamu.",
];
