
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";

const statDefinitions = [
  { label: "Total Analisa", icon: "/images/ikon-total-analisa.svg" },
  { label: "Total Proyek", icon: "/images/ikon-total-proyek.svg" },
  { label: "Skill Dikuasai", icon: "/images/ikon-skill-dikuasai.svg" },
  { label: "Target Role", icon: "/images/ikon-target-role.svg" },
];

export default async function DashboardStats() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  let totalAnalyses = 0;
  let totalProjects = 0;
  let masteredSkills = 0;
  let totalTargetRoles = 0;

  if (user && !authError) {
    const [analysesResponse, projectsResponse, skillsResponse] =
      await Promise.all([
        supabase
          .from("analyses")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id),

        supabase
          .from("project_evidences")
          .select("id, url, storage_path, title")
          .eq("user_id", user.id),

        supabase
          .from("analysis_skill_results")
          .select("analysis_id, skill_name, estimated_level")
          .eq("user_id", user.id),
      ]);

    if (analysesResponse.error) {
      console.error(
        "Gagal mengambil total analisis:",
        analysesResponse.error.message,
      );
    } else {
      totalAnalyses = analysesResponse.count ?? 0;
    }

    if (projectsResponse.error) {
      console.error(
        "Gagal mengambil proyek:",
        projectsResponse.error.message,
      );
    } else {
      const uniqueProjects = new Set(
        (projectsResponse.data ?? []).map((project) => {
          const identity =
            project.url?.trim().toLowerCase() ||
            project.storage_path?.trim() ||
            project.title.trim().toLowerCase();

          return identity;
        }),
      );

      totalProjects = uniqueProjects.size;
    }

    if (skillsResponse.error) {
      console.error(
        "Gagal mengambil hasil skill:",
        skillsResponse.error.message,
      );
    } else {
      const skillRows = skillsResponse.data ?? [];
      const analysisIds = [...new Set(skillRows.map((row) => row.analysis_id))];

      let completedAnalysisIds = new Set<string>();

      if (analysisIds.length > 0) {
        const { data: completedAnalyses, error: completedError } =
          await supabase
            .from("analyses")
            .select("id")
            .eq("user_id", user.id)
            .eq("status", "completed")
            .in("id", analysisIds);

        if (completedError) {
          console.error(
            "Gagal memverifikasi analisis selesai:",
            completedError.message,
          );
        } else {
          completedAnalysisIds = new Set(
            (completedAnalyses ?? []).map((analysis) => analysis.id),
          );
        }
      }

      const uniqueSkills = new Set(
        skillRows
          .filter(
            (row) =>
              completedAnalysisIds.has(row.analysis_id) &&
              row.skill_name?.trim() &&
              row.estimated_level !== null,
          )
          .map((row) => row.skill_name!.trim().toLowerCase()),
      );

      masteredSkills = uniqueSkills.size;
    }

    const { data: targetRoles, error: rolesError } = await supabase
      .from("analyses")
      .select("target_role")
      .eq("user_id", user.id)
      .eq("status", "completed");

    if (rolesError) {
      console.error(
        "Gagal mengambil target role:",
        rolesError.message,
      );
    } else {
      totalTargetRoles = new Set(
        (targetRoles ?? [])
          .map((row) => row.target_role?.trim().toLowerCase())
          .filter((role): role is string => Boolean(role)),
      ).size;
    }
  }

  const stats = [
    totalAnalyses,
    totalProjects,
    masteredSkills,
    totalTargetRoles,
  ];

  return (
    <section
      className="bkd-stats"
      aria-label="Statistik aktivitas pengguna"
    >
      {statDefinitions.map((stat, index) => (
        <article className="bkd-statCard" key={stat.label}>
          <Image src={stat.icon} alt="" width={44} height={44} />
          <div>
            <h2>{stat.label}</h2>
            <p>{stats[index]}</p>
          </div>
        </article>
      ))}
    </section>
  );
}
