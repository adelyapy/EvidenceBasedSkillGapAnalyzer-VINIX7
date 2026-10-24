"use client";

import Image from "next/image";
import Link, { useLinkStatus } from "next/link";
import { workspaceNavigation } from "@/data/workspace";
import WorkspaceIcon from "./WorkspaceIcon";

type Props = {
  pathname: string;
  collapsed: boolean;
  mobileOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
  isLoggingOut: boolean;
};

function WorkspaceNavPending({ label }: { label: string }) {
  const { pending } = useLinkStatus();

  return (
    <>
      <span
        className={`bkw-navPending${pending ? " bkw-navPending--active" : ""}`}
        aria-hidden="true"
      />
      <span className="bkw-srOnly" role="status" aria-live="polite">
        {pending ? `Membuka ${label}...` : ""}
      </span>
    </>
  );
}

export default function WorkspaceSidebar({
  pathname,
  collapsed,
  mobileOpen,
  onClose,
  onLogout,
  isLoggingOut,
}: Props) {
  return (
    <>
      {mobileOpen && (
        <button
          className="bkw-backdrop"
          aria-label="Tutup menu"
          onClick={onClose}
        />
      )}

      <aside
        id="bkw-workspace-sidebar"
        className={`bkw-sidebar${collapsed ? " bkw-sidebar--collapsed" : ""}${mobileOpen ? " bkw-sidebar--open" : ""}`}
        aria-label="Navigasi workspace"
      >
        <div className="bkw-sidebarTop">
          <Link
            className="bkw-brand"
            href="/"
            onClick={onClose}
            aria-label="BUKTIVA, ke beranda"
          >
            <Image
              src="/images/logo-icon.svg"
              alt=""
              width={44}
              height={41}
              style={{ height: "auto" }}
            />
            <span className="bkw-sidebarLabel">BUKTIVA</span>
          </Link>
        </div>

        <nav className="bkw-nav" aria-label="Navigasi utama BUKTIVA">
          {workspaceNavigation.map((item) => {
            const active = item.activePrefix
              ? pathname.startsWith(item.activePrefix)
              : item.href === pathname;

            const content = (
              <>
                <WorkspaceIcon name={item.icon} />
                <span className="bkw-sidebarLabel">{item.label}</span>
              </>
            );

            return item.href ? (
              <Link
                key={item.label}
                href={item.href}
                onClick={onClose}
                className={`bkw-navItem${active ? " bkw-navItem--active" : ""}`}
                aria-current={active ? "page" : undefined}
                title={collapsed ? item.label : undefined}
              >
                {content}
                <WorkspaceNavPending label={item.label} />
              </Link>
            ) : (
              <button
                key={item.label}
                type="button"
                className="bkw-navItem"
                disabled
                title={`${item.label} belum tersedia`}
                aria-label={`${item.label} belum tersedia`}
              >
                {content}
              </button>
            );
          })}
        </nav>

        <button
          type="button"
          className="bkw-navItem bkw-logout"
          onClick={onLogout}
          disabled={isLoggingOut}
          aria-label="Keluar dari akun"
          title={collapsed ? "Keluar" : undefined}
        >
          <WorkspaceIcon name="logout" />
          <span className="bkw-sidebarLabel">
            {isLoggingOut ? "Keluar..." : "Keluar"}
          </span>
        </button>
      </aside>
    </>
  );
}
