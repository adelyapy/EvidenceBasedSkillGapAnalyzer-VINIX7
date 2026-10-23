import type { TargetRoleOption } from "@/types/target-role";

export const TARGET_ROLE_STORAGE_KEY = "buktiva:target-role:v1";
export const TARGET_ROLE_DESCRIPTION_LIMIT = 3000;

export const targetRoleOptions: TargetRoleOption[] = [
  { id: "frontend", label: "Frontend Developer", icon: "code", category: "Teknologi" },
  { id: "backend", label: "Backend Developer", icon: "server", category: "Teknologi" },
  { id: "mobile", label: "Mobile Developer", icon: "mobile", category: "Teknologi" },
  { id: "data-analyst", label: "Data Analyst", icon: "chart", category: "Teknologi" },
  { id: "ui-ux", label: "UI/UX Designer", icon: "design", category: "Teknologi" },
  { id: "devops", label: "DevOps Developer", icon: "cloud", category: "Teknologi" },
  { id: "product-manager", label: "Product Manager", icon: "briefcase", category: "Bisnis & Manajemen" },
  { id: "business-analyst", label: "Business Analyst", icon: "chart", category: "Bisnis & Manajemen" },
  { id: "management-trainee", label: "Management Trainee", icon: "briefcase", category: "Bisnis & Manajemen" },
  { id: "sales", label: "Sales Executive", icon: "people", category: "Bisnis & Manajemen" },
  { id: "customer-success", label: "Customer Success", icon: "people", category: "Bisnis & Manajemen" },
  { id: "accountant", label: "Akuntan", icon: "calculator", category: "Keuangan & Akuntansi" },
  { id: "auditor", label: "Auditor", icon: "calculator", category: "Keuangan & Akuntansi" },
  { id: "financial-analyst", label: "Financial Analyst", icon: "chart", category: "Keuangan & Akuntansi" },
  { id: "tax-specialist", label: "Tax Specialist", icon: "calculator", category: "Keuangan & Akuntansi" },
  { id: "investment-analyst", label: "Investment Analyst", icon: "chart", category: "Keuangan & Akuntansi" },
  { id: "digital-marketer", label: "Digital Marketer", icon: "megaphone", category: "Marketing & Komunikasi" },
  { id: "content-specialist", label: "Content Specialist", icon: "megaphone", category: "Marketing & Komunikasi" },
  { id: "social-media", label: "Social Media Specialist", icon: "megaphone", category: "Marketing & Komunikasi" },
  { id: "public-relations", label: "Public Relations", icon: "people", category: "Marketing & Komunikasi" },
  { id: "market-researcher", label: "Market Researcher", icon: "chart", category: "Marketing & Komunikasi" },
  { id: "human-resources", label: "Human Resources", icon: "people", category: "Operasional & SDM" },
  { id: "recruiter", label: "Recruiter", icon: "people", category: "Operasional & SDM" },
  { id: "operations", label: "Operations Officer", icon: "briefcase", category: "Operasional & SDM" },
  { id: "supply-chain", label: "Supply Chain Officer", icon: "briefcase", category: "Operasional & SDM" },
  { id: "project-manager", label: "Project Manager", icon: "briefcase", category: "Operasional & SDM" },
  { id: "graphic-designer", label: "Graphic Designer", icon: "palette", category: "Desain & Kreatif" },
  { id: "video-editor", label: "Video Editor", icon: "design", category: "Desain & Kreatif" },
  { id: "interior-designer", label: "Interior Designer", icon: "palette", category: "Desain & Kreatif" },
  { id: "architect", label: "Arsitek", icon: "design", category: "Desain & Kreatif" },
  { id: "civil-engineer", label: "Civil Engineer", icon: "briefcase", category: "Teknik & Sains" },
  { id: "mechanical-engineer", label: "Mechanical Engineer", icon: "briefcase", category: "Teknik & Sains" },
  { id: "electrical-engineer", label: "Electrical Engineer", icon: "briefcase", category: "Teknik & Sains" },
  { id: "research-assistant", label: "Research Assistant", icon: "flask", category: "Teknik & Sains" },
  { id: "laboratory-analyst", label: "Laboratory Analyst", icon: "flask", category: "Teknik & Sains" },
  { id: "nurse", label: "Perawat", icon: "heart", category: "Kesehatan & Sosial" },
  { id: "pharmacist", label: "Apoteker", icon: "flask", category: "Kesehatan & Sosial" },
  { id: "nutritionist", label: "Ahli Gizi", icon: "heart", category: "Kesehatan & Sosial" },
  { id: "psychologist", label: "Psikolog", icon: "heart", category: "Kesehatan & Sosial" },
  { id: "teacher", label: "Guru", icon: "book", category: "Pendidikan & Hukum" },
  { id: "trainer", label: "Trainer", icon: "book", category: "Pendidikan & Hukum" },
  { id: "legal-officer", label: "Legal Officer", icon: "scale", category: "Pendidikan & Hukum" },
  { id: "paralegal", label: "Paralegal", icon: "scale", category: "Pendidikan & Hukum" },
];

export const targetRoleInformation = {
  title: "Pilih role yang relevan untuk hasil analisis maksimal",
  description:
    "AI akan memetakan skill dari proyek dan pengalamanmu dengan kebutuhan role yang kamu pilih, sehingga dapat mengidentifikasi skill gap dengan lebih akurat.",
};
