import Link from "next/link";
import DashboardEmptyState from "@/components/dashboard/DashboardEmptyState";
import RecommendationsRealtimeSync from "@/components/dashboard/RecommendationsRealtimeSync";
import { createClient } from "@/lib/supabase/server";
import WorkspaceIcon from "@/components/workspace/WorkspaceIcon";
import { analysisRoutes } from "@/data/analysis";

type RecommendationAnalysis = {
  id: string;
  target_role: string | null;
  created_at: string;
};

type RecommendationItem = {
  id: string;
  analysis_id: string;
  title: string;
  description: string | null;
  resource_url: string | null;
  priority: string | null;
  status: string | null;
  sort_order: number;
};

export default async function Recommendations() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: analysisRows, error: analysisError } = user
    ? await supabase
        .from("analyses")
        .select("id, target_role, created_at")
        .eq("user_id", user.id)
        .eq("status", "completed")
        .order("created_at", { ascending: false })
        .limit(20)
    : { data: [], error: null };

  const analyses = (analysisRows ?? []) as RecommendationAnalysis[];
  const analysisIds = analyses.map((analysis) => analysis.id);

  const { data: recommendationRows, error: recommendationError } =
    user && analysisIds.length > 0
    ? await supabase
        .from("roadmap_items")
        .select(
          "id, analysis_id, title, description, resource_url, priority, status, sort_order",
        )
        .eq("user_id", user.id)
        .in("analysis_id", analysisIds)
        .order("sort_order", { ascending: true })
    : { data: [], error: null };

  const availableRecommendations = (recommendationRows ?? []) as RecommendationItem[];
  const sourceAnalysis = analyses.find((analysis) =>
    availableRecommendations.some(
      (recommendation) => recommendation.analysis_id === analysis.id,
    ),
  );
  const recommendations = sourceAnalysis
    ? availableRecommendations
        .filter(
          (recommendation) =>
            recommendation.analysis_id === sourceAnalysis.id,
        )
        .slice(0, 3)
    : [];
  const latestCompletedAnalysis = analyses[0];
  const error = analysisError ?? recommendationError;
  const sourceDate = sourceAnalysis
    ? new Intl.DateTimeFormat("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "Asia/Jakarta",
      }).format(new Date(sourceAnalysis.created_at))
    : null;

  return (
    <section
      className="bkd-panel bkd-recommendations"
      aria-labelledby="judul-rekomendasi"
    >
      {user && <RecommendationsRealtimeSync userId={user.id} />}

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
        <>
          {sourceAnalysis && sourceDate && (
            <p className="bkd-recommendationContext">
              Berdasarkan analisis{" "}
              <strong>
                {sourceAnalysis.target_role || "Target role belum ditentukan"}
              </strong>
              <span aria-hidden="true"> · </span>
              <span>{sourceDate}</span>
            </p>
          )}

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

                    {item.priority && <p>Prioritas: {item.priority}</p>}

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
        </>
      ) : (
        <DashboardEmptyState
          icon="book"
          title="Belum ada rekomendasi belajar"
          description={
            latestCompletedAnalysis
              ? "Analisis selesai sudah tersedia, tetapi rekomendasi belajar belum tersimpan untuk hasil tersebut."
              : "Selesaikan analisis untuk mendapatkan rekomendasi belajar yang sesuai dengan skill gap-mu."
          }
          actionLabel={
            latestCompletedAnalysis ? "Lihat hasil analisis" : "Mulai analisis"
          }
          actionHref={
            latestCompletedAnalysis
              ? analysisRoutes.resultFor(latestCompletedAnalysis.id)
              : analysisRoutes.uploadProject
          }
        />
      )}
    </section>
  );
}
