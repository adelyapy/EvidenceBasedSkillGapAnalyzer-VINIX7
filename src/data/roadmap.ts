import type { RoadmapStep, SavedRoadmap } from "@/types/roadmap";

export const ROADMAP_STORAGE_KEY = "buktiva:roadmap:saved:v1";
export const ROADMAP_CAREER_ID = "frontend-developer" as const;
export const ROADMAP_CAREER_LABEL = "Frontend Developer" as const;

// Data contoh dari HTML legacy. Data ini bukan hasil kalkulasi AI atau data pasar aktual.
export const roadmapSteps: RoadmapStep[] = [
  {
    id: "typescript",
    title: "Kuasai TypeScript",
    duration: "2–4 minggu",
    checklist: [
      "Pahami tipe data dasar",
      "Implementasi di project kecil",
      "Latihan konversi project",
    ],
  },
  {
    id: "testing",
    title: "Tingkatkan Testing",
    duration: "2–4 minggu",
    checklist: [
      "Unit testing dengan Jest",
      "Testing React component",
      "Studi kasus project kamu",
    ],
  },
  {
    id: "ci-cd",
    title: "Pelajari CI/CD",
    duration: "3–4 minggu",
    checklist: [
      "Setup GitHub Actions",
      "Deployment ke Vercel",
      "Monitoring dan maintenance",
    ],
  },
  {
    id: "advanced-project",
    title: "Bangun Project Lanjutan",
    duration: "4+ minggu",
    checklist: [
      "Buat project dengan tech baru",
      "Terapkan testing & CI/CD",
      "Tambahkan ke portofolio",
    ],
  },
];

export function createSavedRoadmap(savedAt = new Date().toISOString()): SavedRoadmap {
  return {
    version: 1,
    careerId: ROADMAP_CAREER_ID,
    careerLabel: ROADMAP_CAREER_LABEL,
    stepIds: roadmapSteps.map((step) => step.id),
    savedAt,
    source: "prototype",
  };
}

export function isSavedRoadmap(value: unknown): value is SavedRoadmap {
  if (!value || typeof value !== "object") return false;

  const candidate = value as Record<string, unknown>;
  const knownStepIds = new Set(roadmapSteps.map((step) => step.id));

  return (
    candidate.version === 1 &&
    candidate.careerId === ROADMAP_CAREER_ID &&
    candidate.careerLabel === ROADMAP_CAREER_LABEL &&
    candidate.source === "prototype" &&
    typeof candidate.savedAt === "string" &&
    Array.isArray(candidate.stepIds) &&
    candidate.stepIds.length > 0 &&
    candidate.stepIds.every((id) => typeof id === "string" && knownStepIds.has(id))
  );
}
