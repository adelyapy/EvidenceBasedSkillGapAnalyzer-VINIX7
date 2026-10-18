"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import WorkspaceHeader from "./WorkspaceHeader";
import WorkspaceSidebar from "./WorkspaceSidebar";

export default function WorkspaceShell({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

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

  return (
    <div className={`bkw-shell${collapsed ? " bkw-shell--collapsed" : ""}${mobileOpen ? " bkw-shell--mobile-open" : ""}`}>
      <WorkspaceSidebar pathname={pathname} collapsed={collapsed} mobileOpen={mobileOpen} onCollapse={() => setCollapsed((value) => !value)} onClose={() => setMobileOpen(false)} />
      <div className="bkw-mainColumn">
        <WorkspaceHeader mobileOpen={mobileOpen} onToggleMenu={() => setMobileOpen((value) => !value)} onCloseMenu={() => setMobileOpen(false)} />
        <main id="konten-utama" className="bkw-main">{children}</main>
      </div>
    </div>
  );
}
