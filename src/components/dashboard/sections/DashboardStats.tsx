
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { dashboardStats } from "@/data/dashboard";

export default async function DashboardStats() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let totalAnalyses = 0;

  if (user) {
    const { count, error } = await supabase
      .from("analyses")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id);

    if (error) {
      console.error("Gagal mengambil total analisis:", error.message);
    } else {
      totalAnalyses = count ?? 0;
    }
  }

  const stats = dashboardStats.map((stat) =>
    stat.label === "Total Analisa"
      ? { ...stat, value: totalAnalyses }
      : stat
  );

  return (
    <section
      className="bkd-stats"
      aria-label="Statistik aktivitas pengguna"
    >
      {stats.map((stat) => (
        <article className="bkd-statCard" key={stat.label}>
          <Image src={stat.icon} alt="" width={44} height={44} />
          <div>
            <h2>{stat.label}</h2>
            <p>{stat.value}</p>
          </div>
        </article>
      ))}
    </section>
  );
}
