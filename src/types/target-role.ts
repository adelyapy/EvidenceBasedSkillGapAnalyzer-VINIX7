export type TargetRoleId =
  | "frontend"
  | "backend"
  | "mobile"
  | "data-analyst"
  | "ui-ux"
  | "devops"
  | "product-manager" | "business-analyst" | "management-trainee" | "sales" | "customer-success"
  | "accountant" | "auditor" | "financial-analyst" | "tax-specialist" | "investment-analyst"
  | "digital-marketer" | "content-specialist" | "social-media" | "public-relations" | "market-researcher"
  | "human-resources" | "recruiter" | "operations" | "supply-chain" | "project-manager"
  | "graphic-designer" | "video-editor" | "interior-designer" | "architect"
  | "civil-engineer" | "mechanical-engineer" | "electrical-engineer" | "research-assistant" | "laboratory-analyst"
  | "nurse" | "pharmacist" | "nutritionist" | "psychologist"
  | "teacher" | "trainer" | "legal-officer" | "paralegal";

export type TargetRoleIconName =
  | "code"
  | "server"
  | "mobile"
  | "chart"
  | "design"
  | "cloud"
  | "briefcase" | "megaphone" | "calculator" | "people" | "palette" | "flask" | "heart" | "book" | "scale";

export type TargetRoleCategory =
  | "Teknologi" | "Bisnis & Manajemen" | "Keuangan & Akuntansi"
  | "Marketing & Komunikasi" | "Operasional & SDM" | "Desain & Kreatif"
  | "Teknik & Sains" | "Kesehatan & Sosial" | "Pendidikan & Hukum";

export type TargetRoleOption = {
  id: TargetRoleId;
  label: string;
  icon: TargetRoleIconName;
  category: TargetRoleCategory;
};

export type TargetRoleDraft = {
  role: string;
  jobDescription: string;
};
