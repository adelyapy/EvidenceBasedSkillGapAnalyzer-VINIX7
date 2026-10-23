
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import WorkspaceIcon from "@/components/workspace/WorkspaceIcon";

export default async function Recommendations() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: analysis } = user
    ? await supabase
        .from("analyses")
        .select("id")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle()
    : { data: null };

  const { data: recommendations, error } = analysis
    ? await supabase
        .from("roadmap_items")
        .select("id, title, description, resource_url, priority, status, sort_order")
        .eq("user_id", user!.id)
        .eq("analysis_id", analysis.id)
        .order("sort_order", { ascending: true })
        .limit(3)
    : { data: [], error: null };

  return (
    <section
      className="bkd-panel bkd-recommendations"
      aria-labelledby="judul-rekomendasi"
    >
      <div className="bkd-panelHeading">
        <h2 id="judul-rekomendasi">
          <WorkspaceIcon name="target" size={20} /> Rekomendasi Selanjutnya
        </h2>
      </div>

      {error ? (
        <p role="alert">
          Rekomendasi belum dapat dimuat. Silakan muat ulang halaman.
        </p>
      ) : recommendations && recommendations.length > 0 ? (
        <ol className="bkd-recommendationList">
          {recommendations.map((item, index) => (
            <li key={item.id}>
              <span className="bkd-recommendationNumber" aria-hidden="true">
                {index + 1}
              </span>

              <div className="bkd-recommendationCard">
                <span aria-hidden="true">
                  <WorkspaceIcon name="book" size={30} />
                </span>

                <div>
                  <h3>{item.title}</h3>
                  <p>{item.description || "Belum ada deskripsi."}</p>

                  {item.priority && (
                    <p>Prioritas: {item.priority}</p>
                  )}

                  {item.status && <p>Status: {item.status}</p>}

                  {item.resource_url && (
                    <Link
                      href={item.resource_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Buka sumber belajar
                    </Link>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <div className="bkd-recommendationEmpty">
          <WorkspaceIcon name="book" size={32} />
          <h3>Belum ada rekomendasi belajar</h3>
          <p>
            Rekomendasi akan muncul setelah roadmap pembelajaran
            tersedia dari hasil analisis.
          </p>
          <Link href="/workspace/analisa-baru">
            Mulai analisis baru
          </Link>
        </div>
      )}
    </section>
  );
}
