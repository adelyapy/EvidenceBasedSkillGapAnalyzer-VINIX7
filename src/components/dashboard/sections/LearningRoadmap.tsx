"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client"; // pastikan path benar

export default function LearningRoadmap() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // Ambil analysis terbaru
      const { data: latest } = await supabase
        .from("analyses")
        .select("id")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!latest) {
        setLoading(false);
        return;
      }

      // Ambil roadmap
      const { data } = await supabase
        .from("roadmap_items")
        .select("*")
        .eq("user_id", user.id)
        .eq("analysis_id", latest.id)
        .order("sort_order", { ascending: true });

      setItems(data ?? []);
      setLoading(false);
    })();
  }, []);

  if (loading) return <div>Memuat roadmap...</div>;
  if (items.length === 0) return <div>Belum ada rekomendasi belajar.</div>;

  return (
    <div>
      {items.map((item) => (
        <div key={item.id}>
          {/* Silakan sesuaikan dengan UI/Tailwind Anda */}
          <h3>{item.title}</h3>
          <p>{item.description}</p>
          <span>Priority: {item.priority}</span>
        </div>
      ))}
    </div>
  );
}
