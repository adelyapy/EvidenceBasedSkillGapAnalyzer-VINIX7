import Image from "next/image";
import Link from "next/link";
import WorkspaceIcon from "@/components/workspace/WorkspaceIcon";
import { dashboardUser } from "@/data/dashboard";

export default function DashboardHero() {
  return (
    <section className="bkd-hero" aria-labelledby="judul-dashboard">
      <div className="bkd-heroCopy">
        <h1 id="judul-dashboard">Halo, {dashboardUser.name}</h1>
        <p>Siap menganalisis project baru hari ini?</p>
        <div className="bkd-heroActions">
          <Link href="/workspace/analisa-baru" className="bkd-primaryButton"><WorkspaceIcon name="plus" size={16} /> Mulai analisa baru</Link>
          <Link href="/#cara-kerja" className="bkd-secondaryButton"><WorkspaceIcon name="book" size={18} /> Lihat panduan</Link>
        </div>
      </div>
      <Image className="bkd-heroImage" src="/images/dashboard-vector.png" width={774} height={432} priority alt="Mahasiswa sedang menggunakan laptop. Pesan motivasi: Analisis skill-mu, bangun karier impianmu; lebih siap untuk dunia kerja; satu langkah lebih dekat ke karier impianmu." />
    </section>
  );
}
