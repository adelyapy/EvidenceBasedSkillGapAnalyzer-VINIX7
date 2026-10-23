"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { dashboardUser } from "@/data/dashboard";
import { PROFILE_ROUTE } from "@/data/workspace";
import WorkspaceIcon from "./WorkspaceIcon";

type Props = {
  collapsed: boolean;
  mobileOpen: boolean;
  onToggleSidebar: () => void;
  onToggleMenu: () => void;
  onCloseMenu: () => void;
};

export default function WorkspaceHeader({ collapsed, mobileOpen, onToggleSidebar, onToggleMenu, onCloseMenu }: Props) {
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!mobileOpen) return;

    const closeWithEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      onCloseMenu();
      menuButtonRef.current?.focus();
    };

    document.addEventListener("keydown", closeWithEscape);
    return () => document.removeEventListener("keydown", closeWithEscape);
  }, [mobileOpen, onCloseMenu]);

  return (
    <>
      <button
        ref={menuButtonRef}
        className={`bkw-menuButton${mobileOpen ? " bkw-menuButton--open" : ""}`}
        type="button"
        onClick={onToggleMenu}
        aria-label={mobileOpen ? "Tutup menu" : "Buka menu"}
        aria-expanded={mobileOpen}
        aria-controls="bkw-workspace-sidebar"
      >
        <span className="bkw-menuIcon" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
      </button>
      <header className="bkw-header">
        <button
          className={`bkw-headerCollapseButton${collapsed ? " bkw-headerCollapseButton--collapsed" : ""}`}
          type="button"
          onClick={onToggleSidebar}
          aria-label={collapsed ? "Perlebar sidebar" : "Perkecil sidebar"}
          aria-expanded={!collapsed}
          aria-controls="bkw-workspace-sidebar"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="m12 6-6 6 6 6" />
            <path d="m18 6-6 6 6 6" />
          </svg>
        </button>
        <div className="bkw-headerActions">
          <button className="bkw-notification" type="button" disabled aria-label="Notifikasi belum tersedia" title="Notifikasi belum tersedia"><Image src="/images/ikon-notifikasi.svg" alt="" width={24} height={24} /></button>
          <details className="bkw-profile">
            <summary aria-label="Buka menu profil">
              <Image src={dashboardUser.avatar} alt="Foto profil Adelya" width={34} height={34} />
              <span className="bkw-profileText"><strong>{dashboardUser.name}</strong><small>{dashboardUser.role}</small></span>
              <WorkspaceIcon name="chevron" size={16} />
            </summary>
            <div className="bkw-profileMenu" role="group" aria-label="Menu profil pengguna">
              <Link href={PROFILE_ROUTE}>Profile Saya</Link>
              <Link
                href="/login"
                aria-label="Keluar dan menuju halaman Login"
                onClick={(event) => event.currentTarget.closest("details")?.removeAttribute("open")}
              >
                Keluar
              </Link>
            </div>
          </details>
        </div>
      </header>
    </>
  );
}
