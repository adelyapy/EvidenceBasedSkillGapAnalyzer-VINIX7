import type { AnalysisResultDemo } from "@/types/analysis-result";

export const analysisResultDemo: AnalysisResultDemo = {
  score: 78,
  role: "Frontend Developer",
  summary: "Kemampuan Frontend Developer Anda sudah kuat.",
  skills: [
    { name: "React", level: "Ahli", score: 90 },
    { name: "JavaScript", level: "Mahir", score: 80 },
    { name: "HTML", level: "Mahir", score: 78 },
    { name: "Git", level: "Menengah", score: 66 },
    { name: "UI/UX", level: "Menengah", score: 60 },
  ],
  projects: [
    { name: "Portofolio-web", technologies: "React, CSS", icon: "portfolio" },
    { name: "e-commerce-app", technologies: "North.js", icon: "commerce" },
    { name: "Dashboard penjualan", technologies: "Chart.js", icon: "dashboard" },
  ],
  recommendations: [
    { text: "Pertahankan konsistensi di React.", icon: "consistency" },
    { text: "Tingkatkan kemampuan di TypeScript.", icon: "growth" },
    { text: "Pelajari testing dan CI/CD.", icon: "practice" },
  ],
};
