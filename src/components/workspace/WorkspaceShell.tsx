
"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import WorkspaceHeader from "./WorkspaceHeader";
import WorkspaceSidebar from "./WorkspaceSidebar";

export default function WorkspaceShell({
  children,
}: {
  children: ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
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
        onCollapse={() => setCollapsed((value) => !value)}
        onClose={() => setMobileOpen(false)}
        onLogout={handleLogout}
        isLoggingOut={isLoggingOut}
      />

      <div className="bkw-mainColumn">
        <WorkspaceHeader
          mobileOpen={mobileOpen}
          onToggleMenu={() => setMobileOpen((value) => !value)}
          onCloseMenu={() => setMobileOpen(false)}
        />
        <main id="konten-utama" className="bkw-main">
          {children}
        </main>
      </div>
    </div>
  );
}
