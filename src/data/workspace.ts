import type { WorkspaceNavItem } from "@/types/workspace";
import { analysisRoutes } from "@/data/analysis";

export const workspaceNavigation: WorkspaceNavItem[] = [
  { label: "Dashboard", icon: "dashboard", href: "/workspace/dashboard" },
  { label: "Analisa Baru", icon: "analysis", href: analysisRoutes.uploadCv, activePrefix: "/workspace/analisa-baru" },
  { label: "Riwayat Analisis", icon: "history" },
  { label: "Profile", icon: "profile" },
];
