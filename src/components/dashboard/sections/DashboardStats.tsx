import Image from "next/image";
import { dashboardStats } from "@/data/dashboard";

export default function DashboardStats() {
  return (
    <section className="bkd-stats" aria-label="Statistik aktivitas pengguna, data demo">
      {dashboardStats.map((stat) => (
        <article className="bkd-statCard" key={stat.label}>
          <Image src={stat.icon} alt="" width={44} height={44} />
          <div><h2>{stat.label}</h2><p>{stat.value}</p></div>
        </article>
      ))}
    </section>
  );
}
