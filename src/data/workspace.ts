import type { WorkspaceNavItem } from "@/types/workspace";
import { analysisRoutes } from "@/data/analysis";

export const HISTORY_ROUTE = "/workspace/riwayat-analisis";
export const PROFILE_ROUTE = "/workspace/profile";
export const WORKSPACE_PROFILE_UPDATED_EVENT =
  "buktiva:workspace-profile-updated";

export const workspaceNavigation: WorkspaceNavItem[] = [
  { label: "Dashboard", icon: "dashboard", href: "/workspace/dashboard" },
  { label: "Analisa Baru", icon: "analysis", href: analysisRoutes.uploadProject, activePrefix: "/workspace/analisa-baru" },
  { label: "Riwayat Analisis", icon: "history", href: HISTORY_ROUTE, activePrefix: HISTORY_ROUTE },
  { label: "Profile", icon: "profile", href: PROFILE_ROUTE, activePrefix: PROFILE_ROUTE },
];
