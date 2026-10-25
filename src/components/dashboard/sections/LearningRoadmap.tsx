
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type RoadmapItem = {
  id: string;
  title: string;
  description: string | null;
  priority: "low" | "medium" | "high" | "critical";
  status: "not_started" | "in_progress" | "completed";
  sort_order: number;
};

function getErrorMessage(error: unknown): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }

  return "Terjadi kesalahan saat memuat roadmap.";
}

export default function LearningRoadmap() {
  const [items, setItems] = useState<RoadmapItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      try {
        const supabase = createClient();
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) throw userError;
        if (!user) return;

        const { data: latest, error: latestError } = await supabase
          .from("analyses")
          .select("id")
          .eq("user_id", user.id)
          .eq("status", "completed")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (latestError) throw latestError;
        if (!latest) return;

        const { data, error: roadmapError } = await supabase
          .from("roadmap_items")
          .select(
            "id, title, description, priority, status, sort_order",
          )
          .eq("user_id", user.id)
          .eq("analysis_id", latest.id)
          .order("sort_order", { ascending: true });

        if (roadmapError) throw roadmapError;

        if (!cancelled) {
          setItems((data ?? []) as RoadmapItem[]);
        }
      } catch (err: unknown) {
        console.error("Gagal memuat roadmap:", err);

        if (!cancelled) {
          setError(getErrorMessage(err));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void fetchData();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return <p>Memuat roadmap...</p>;
  }

  if (error) {
    return (
      <p role="alert" className="text-red-500">
        {error}
      </p>
    );
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby="learning-roadmap-title">
      <h2 id="learning-roadmap-title">Roadmap Pembelajaran</h2>

      <ol>
        {items.map((item) => (
          <li key={item.id}>
            <article>
              <h3>{item.title}</h3>
              <p>{item.description || "Belum ada deskripsi."}</p>
              <p>Prioritas: {item.priority}</p>
              <p>Status: {item.status}</p>
            </article>
          </li>
        ))}
      </ol>
    </section>
  );
}
