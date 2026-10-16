import Image from "next/image";
import Link from "next/link";
import { workspaceNavigation } from "@/data/workspace";
import WorkspaceIcon from "./WorkspaceIcon";

type Props = {
  pathname: string;
  collapsed: boolean;
  mobileOpen: boolean;
  onCollapse: () => void;
  onClose: () => void;
};

export default function WorkspaceSidebar({ pathname, collapsed, mobileOpen, onCollapse, onClose }: Props) {
  return (
    <>
      {mobileOpen && <button className="bkw-backdrop" aria-label="Tutup menu" onClick={onClose} />}
      <aside className={`bkw-sidebar${collapsed ? " bkw-sidebar--collapsed" : ""}${mobileOpen ? " bkw-sidebar--open" : ""}`} aria-label="Navigasi workspace">
        <div className="bkw-sidebarTop">
          <Link className="bkw-brand" href="/" onClick={onClose} aria-label="BUKTIVA, ke beranda">
            <Image src="/images/logo-icon.svg" alt="" width={44} height={41} style={{ height: "auto" }} />
            <span className="bkw-sidebarLabel">BUKTIVA</span>
          </Link>
          <button className="bkw-collapseButton" onClick={onCollapse} aria-label={collapsed ? "Perlebar sidebar" : "Perkecil sidebar"} aria-expanded={!collapsed}>
            <span aria-hidden="true">{collapsed ? "»" : "«"}</span>
          </button>
          <button className="bkw-sidebarClose" onClick={onClose} aria-label="Tutup menu"><WorkspaceIcon name="close" /></button>
        </div>
        <nav className="bkw-nav" aria-label="Navigasi utama BUKTIVA">
          {workspaceNavigation.map((item) => {
            const active = item.activePrefix ? pathname.startsWith(item.activePrefix) : item.href === pathname;
            const content = <><WorkspaceIcon name={item.icon} /><span className="bkw-sidebarLabel">{item.label}</span></>;
            return item.href ? (
              <Link key={item.label} href={item.href} onClick={onClose} className={`bkw-navItem${active ? " bkw-navItem--active" : ""}`} aria-current={active ? "page" : undefined} title={collapsed ? item.label : undefined}>{content}</Link>
            ) : (
              <button key={item.label} type="button" className="bkw-navItem" disabled title={`${item.label} belum tersedia`} aria-label={`${item.label} belum tersedia`}>{content}</button>
            );
          })}
        </nav>
        <button className="bkw-navItem bkw-logout" type="button" disabled title="Keluar belum tersedia dalam demo" aria-label="Keluar belum tersedia dalam demo"><WorkspaceIcon name="logout" /><span className="bkw-sidebarLabel">Keluar</span></button>
      </aside>
    </>
  );
}
