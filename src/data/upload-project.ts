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
    id: "pdf",
    label: "Upload PDF",
    description: "Unggah file laporan atau dokumentasi",
    inputLabel: "Pilih Dokumen PDF",
  },
];

export const uploadProjectTips = [
  "Gunakan repository publik agar dapat diakses oleh AI.",
  "Pastikan terdapat README yang menjelaskan tujuan, teknologi, dan peran kamu.",
  "Pilih proyek yang paling relevan dan menunjukkan kemampuan terbaik kamu.",
];
