import type { TargetRoleOption } from "@/types/target-role";

export const TARGET_ROLE_STORAGE_KEY = "buktiva:target-role:v1";
export const TARGET_ROLE_DESCRIPTION_LIMIT = 3000;

export const targetRoleOptions: TargetRoleOption[] = [
  { id: "frontend", label: "Frontend Developer", icon: "code" },
  { id: "backend", label: "Backend Developer", icon: "server" },
  { id: "mobile", label: "Mobile Developer", icon: "mobile" },
  { id: "data-analyst", label: "Data Analyst", icon: "chart" },
  { id: "ui-ux", label: "UI/UX Designer", icon: "design" },
  { id: "devops", label: "DevOps Developer", icon: "cloud" },
];

export const targetRoleInformation = {
  title: "Pilih role yang relevan untuk hasil analisis maksimal",
  description:
    "AI akan memetakan skill dari proyek dan pengalamanmu dengan kebutuhan role yang kamu pilih, sehingga dapat mengidentifikasi skill gap dengan lebih akurat.",
};
