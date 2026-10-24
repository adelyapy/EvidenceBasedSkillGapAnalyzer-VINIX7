import Link from "next/link";
import DashboardEmptyState from "@/components/dashboard/DashboardEmptyState";
import WorkspaceIcon from "@/components/workspace/WorkspaceIcon";
import { analysisRoutes } from "@/data/analysis";
import { HISTORY_ROUTE } from "@/data/workspace";

export default function RecentHistory() {
  return (
    <section className="bkd-panel bkd-history" aria-labelledby="judul-riwayat">
      <div className="bkd-panelHeading">
        <h2 id="judul-riwayat">
          <WorkspaceIcon name="history" size={18} /> Riwayat Analisis Terbaru
        </h2>
        <Link className="bkd-panelLink" href={HISTORY_ROUTE}>
          Lihat Semua
        </Link>
      </div>
      <DashboardEmptyState
        icon="history"
        title="Belum ada riwayat analisis"
        description="Analisis yang telah selesai akan tersimpan dan dapat kamu lihat kembali dari bagian ini."
        actionLabel="Mulai analisis"
        actionHref={analysisRoutes.uploadProject}
      />
    </section>
  );
}
