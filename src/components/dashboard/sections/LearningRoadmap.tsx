"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LearningRoadmap() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();

    const fetchData = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        // 5. Selaraskan: hanya ambil analisis dengan status tertentu (sama seperti Recommendations)
        const { data: latest, error: latestErr } = await supabase
          .from("analyses")
          .select("id")
          .eq("user_id", user.id)
          .eq("status", "completed") // Pastikan hanya yang completed
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (latestErr) throw latestErr;
        if (!latest) return;

        const { data, error: roadmapErr } = await supabase
          .from("roadmap_items")
          .select("*")
          .eq("user_id", user.id)
          .eq("analysis_id", latest.id)
          .order("sort_order", { ascending: true });

        if (roadmapErr) throw roadmapErr;
        setItems(data ?? []);
      } catch (err: any) {
        console.error("Gagal load roadmap:", err);
        setError(err.message || "Terjadi kesalahan saat memuat roadmap.");
      } finally {
        setLoading(false); // 5. Pastikan loading berhenti dalam kondisi apapun
      }
    };

    fetchData();
  }, []);

  if (loading) return <div>Memuat roadmap...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (items.length === 0) return null;

  return (
    <div>
      {items.map((item) => (
        <div key={item.id}>
          <h3>{item.title}</h3>
          <p>{item.description}</p>
          <span>Priority: {item.priority}</span>
        </div>
      ))}
    </div>
  );
}
