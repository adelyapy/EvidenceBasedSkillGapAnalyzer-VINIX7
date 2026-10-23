"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { PROFILE_ROUTE } from "@/data/workspace";
import type { WorkspaceUser } from "@/types/workspace";
import WorkspaceIcon from "./WorkspaceIcon";

type Props = {
  user: WorkspaceUser;
  collapsed: boolean;
  mobileOpen: boolean;
  onLogout: () => void | Promise<void>;
  onToggleSidebar: () => void;
  onToggleMenu: () => void;
  onCloseMenu: () => void;
  isLoggingOut: boolean;
};

export default function WorkspaceHeader({
  user,
  collapsed,
  mobileOpen,
  onLogout,
  onToggleSidebar,
  onToggleMenu,
  onCloseMenu,
  isLoggingOut,
}: Props) {
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const profileRef = useRef<HTMLDetailsElement>(null);

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

  useEffect(() => {
    const closeWhenClickingOutside = (event: PointerEvent) => {
      const profile = profileRef.current;
      if (!profile?.open || profile.contains(event.target as Node)) return;
      profile.removeAttribute("open");
    };

    const closeProfileWithEscape = (event: KeyboardEvent) => {
      const profile = profileRef.current;
      if (event.key !== "Escape" || !profile?.open) return;

      profile.removeAttribute("open");
      profile.querySelector("summary")?.focus();
    };

    document.addEventListener("pointerdown", closeWhenClickingOutside);
    document.addEventListener("keydown", closeProfileWithEscape);

    return () => {
      document.removeEventListener("pointerdown", closeWhenClickingOutside);
      document.removeEventListener("keydown", closeProfileWithEscape);
    };
  }, []);

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
          <details ref={profileRef} className="bkw-profile">
            <summary aria-label={`Buka menu profil ${user.name}`}>
              <Image
                src={user.avatar}
                alt={`Foto profil default ${user.name}`}
                width={34}
                height={34}
              />
              <span className="bkw-profileText">
                <strong>{user.name}</strong>
                <small>{user.role}</small>
              </span>
              <WorkspaceIcon name="chevron" size={16} />
            </summary>
            <nav className="bkw-profileMenu" aria-label="Menu akun">
              <div className="bkw-profileMenuHeader">
                <strong>Akun Saya</strong>
                <span>{user.name}</span>
              </div>

              <div className="bkw-profileMenuGroup">
                <Link
                  href={PROFILE_ROUTE}
                  onClick={() => profileRef.current?.removeAttribute("open")}
                >
                  <WorkspaceIcon name="profile" size={20} />
                  <span>Profile Saya</span>
                </Link>
              </div>

              <div className="bkw-profileMenuGroup bkw-profileMenuGroup--logout">
                <button
                  type="button"
                  onClick={() => {
                    profileRef.current?.removeAttribute("open");
                    void onLogout();
                  }}
                  disabled={isLoggingOut}
                  aria-label="Keluar dari akun"
                >
                  <WorkspaceIcon name="logout" size={20} />
                  <span>{isLoggingOut ? "Keluar..." : "Keluar"}</span>
                </button>
              </div>
            </nav>
          </details>
        </div>
      </header>
    </>
  );
}
