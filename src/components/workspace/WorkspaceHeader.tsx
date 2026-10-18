import Image from "next/image";
import Link from "next/link";
import { dashboardUser } from "@/data/dashboard";
import { PROFILE_ROUTE } from "@/data/workspace";
import WorkspaceIcon from "./WorkspaceIcon";

export default function WorkspaceHeader({ onOpenMenu }: { onOpenMenu: () => void }) {
  return (
    <header className="bkw-header">
      <button className="bkw-menuButton" onClick={onOpenMenu} aria-label="Buka menu"><WorkspaceIcon name="menu" /></button>
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
  );
}
