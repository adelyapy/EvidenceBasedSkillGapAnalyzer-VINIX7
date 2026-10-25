"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { WORKSPACE_PROFILE_UPDATED_EVENT } from "@/data/workspace";
import type {
  WorkspaceProfileUpdatedDetail,
  WorkspaceUser,
} from "@/types/workspace";
import WorkspaceHeader from "./WorkspaceHeader";
import WorkspaceSidebar from "./WorkspaceSidebar";

export default function WorkspaceShell({
  children,
  user,
}: {
  children: ReactNode;
  user: WorkspaceUser;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [profileOverrides, setProfileOverrides] = useState<
    Partial<Pick<WorkspaceUser, "name" | "avatar">>
  >({});
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!mobileOpen) return;

    const previousOverflow = document.body.style.overflow;
    const mobileQuery = window.matchMedia("(max-width: 760px)");
    document.body.style.overflow = "hidden";

    const closeWhenLeavingMobile = (event: MediaQueryListEvent) => {
      if (!event.matches) setMobileOpen(false);
    };

    mobileQuery.addEventListener("change", closeWhenLeavingMobile);

    return () => {
      document.body.style.overflow = previousOverflow;
      mobileQuery.removeEventListener("change", closeWhenLeavingMobile);
    };
  }, [mobileOpen]);

  useEffect(() => {
    const updateWorkspaceProfile = (event: Event) => {
      const detail = (event as CustomEvent<WorkspaceProfileUpdatedDetail>)
        .detail;
      const nextName =
        typeof detail?.name === "string" ? detail.name.trim() : "";
      const nextAvatar =
        typeof detail?.avatar === "string" ? detail.avatar.trim() : "";

      if (!nextName && !nextAvatar) return;

      setProfileOverrides((current) => ({
        ...current,
        ...(nextName ? { name: nextName } : {}),
        ...(nextAvatar ? { avatar: nextAvatar } : {}),
      }));
    };

    window.addEventListener(
      WORKSPACE_PROFILE_UPDATED_EVENT,
      updateWorkspaceProfile,
    );

    return () =>
      window.removeEventListener(
        WORKSPACE_PROFILE_UPDATED_EVENT,
        updateWorkspaceProfile,
      );
  }, []);

  const handleLogout = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error("Gagal logout:", error.message);
        window.alert("Logout gagal. Silakan coba lagi.");
        setIsLoggingOut(false);
        return;
      }

      router.replace("/login");
      router.refresh();
    } catch (error) {
      console.error("Terjadi kesalahan saat logout:", error);
      window.alert("Terjadi kesalahan saat logout. Silakan coba lagi.");
      setIsLoggingOut(false);
    }
  };

  return (
    <div
      className={`bkw-shell${collapsed ? " bkw-shell--collapsed" : ""}${mobileOpen ? " bkw-shell--mobile-open" : ""}`}
    >
      <WorkspaceSidebar
        pathname={pathname}
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        onLogout={handleLogout}
        isLoggingOut={isLoggingOut}
      />

      <div className="bkw-mainColumn">
        <WorkspaceHeader
          user={{ ...user, ...profileOverrides }}
          collapsed={collapsed}
          mobileOpen={mobileOpen}
          onLogout={handleLogout}
          onToggleSidebar={() => setCollapsed((value) => !value)}
          onToggleMenu={() => setMobileOpen((value) => !value)}
          onCloseMenu={() => setMobileOpen(false)}
          isLoggingOut={isLoggingOut}
        />
        <main id="konten-utama" className="bkw-main">
          {children}
        </main>
      </div>
    </div>
  );
}
