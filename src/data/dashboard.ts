import type {
  DashboardAnalysis,
  DashboardRecommendation,
  DashboardRoadmapStep,
  DashboardStat,
} from "@/types/dashboard";
import type { WorkspaceUser } from "@/types/workspace";

// Demo content based on the legacy dashboard. Replace when the backend is ready.
export const dashboardUser: WorkspaceUser = {
  name: "Adelya",
  role: "Mahasiswa",
  avatar: "/images/adelya-putri-yunita.png",
};

export const dashboardStats: DashboardStat[] = [
  { label: "Total Analisa", value: 12, icon: "/images/ikon-total-analisa.svg" },
  { label: "Total Proyek", value: 7, icon: "/images/ikon-total-proyek.svg" },
  { label: "Skill Dikuasai", value: 15, icon: "/images/ikon-skill-dikuasai.svg" },
  { label: "Target Role", value: 2, icon: "/images/ikon-target-role.svg" },
];

export const latestAnalysis: DashboardAnalysis = {
  score: 78,
  role: "Frontend Developer",
  description: "Kamu mempunyai kemampuan yang kuat di bidang frontend developer.",
  strengths: ["HTML", "JavaScript", "Git", "React", "UI/UX"],
  improvements: ["TypeScript", "Next.js", "Testing", "System Design", "State Mange"],
};

export const dashboardRecommendations: DashboardRecommendation[] = [
  {
    title: "Pelajari TypeScript",
    description: "Tingkatkan pemahaman TypeScript untuk memperkuat dasar frontend.",
    icon: "/images/ikon-rekomendasi-typescript.svg",
  },
  {
    title: "Ikuti Project Next.js",
    description: "Bangun project nyata menggunakan Next.js untuk pengalaman hands-on.",
    icon: "/images/ikon-rekomendasi-nextjs.svg",
  },
  {
    title: "Latih Technical Interview",
    description: "Kerjakan latihan soal dan simulasi interview frontend developer.",
    icon: "/images/ikon-rekomendasi-interview.svg",
  },
];

export const dashboardRoadmap: DashboardRoadmapStep[] = [
  { label: "Perkuat Frontend" },
  { label: "Praktik TypeScript" },
  { label: "Praktik Testing" },
  { label: "Membuat Proyek" },
];
