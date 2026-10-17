import Image from "next/image";
import Link from "next/link";
import WorkspaceIcon from "@/components/workspace/WorkspaceIcon";
import { HISTORY_ROUTE } from "@/data/workspace";

export default function RecentHistory() {
  return (
    <section className="bkd-panel bkd-history" aria-labelledby="judul-riwayat">
      <div className="bkd-panelHeading"><h2 id="judul-riwayat"><WorkspaceIcon name="history" size={18} /> Riwayat Analisis Terbaru</h2><Link className="bkd-panelLink" href={HISTORY_ROUTE}>Lihat Semua</Link></div>
      <div className="bkd-historyEmpty"><Image src="/images/riwayat-analisis-vector.png" alt="Ilustrasi folder dokumen dan jam untuk riwayat analisis" width={774} height={432} /><p>Belum ada riwayat analisis terbaru</p></div>
    </section>
  );
}
