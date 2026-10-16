"use client";

import { useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import WorkspaceHeader from "./WorkspaceHeader";
import WorkspaceSidebar from "./WorkspaceSidebar";

export default function WorkspaceShell({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className={`bkw-shell${collapsed ? " bkw-shell--collapsed" : ""}`}>
      <WorkspaceSidebar pathname={pathname} collapsed={collapsed} mobileOpen={mobileOpen} onCollapse={() => setCollapsed((value) => !value)} onClose={() => setMobileOpen(false)} />
      <div className="bkw-mainColumn">
        <WorkspaceHeader onOpenMenu={() => setMobileOpen(true)} />
        <main id="konten-utama" className="bkw-main">{children}</main>
      </div>
    </div>
  );
}
