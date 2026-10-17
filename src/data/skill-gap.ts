import type { SkillComparison, SkillGapPriority } from "@/types/skill-gap";

// Data contoh dari HTML legacy untuk Frontend Developer; bukan hasil analisis pengguna.
export const skillComparisons: SkillComparison[] = [
  { name: "React", skillKamu: 95, kebutuhanIndustri: 95 },
  { name: "Next.js", skillKamu: 85, kebutuhanIndustri: 85 },
  { name: "TypeScript", skillKamu: 50, kebutuhanIndustri: 80 },
  { name: "HTML & CSS", skillKamu: 80, kebutuhanIndustri: 80 },
  { name: "Tailwind CSS", skillKamu: 70, kebutuhanIndustri: 70 },
  { name: "Testing", skillKamu: 40, kebutuhanIndustri: 70 },
  { name: "CI/CD", skillKamu: 30, kebutuhanIndustri: 60 },
];

export const skillGapPriorities: SkillGapPriority[] = [
  { skillName: "TypeScript", level: "Tinggi" },
  { skillName: "Testing", level: "Tinggi" },
  { skillName: "CI/CD", level: "Sedang" },
];
