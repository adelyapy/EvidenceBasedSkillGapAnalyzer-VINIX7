"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type RecommendationsRealtimeSyncProps = {
  userId: string;
};

export default function RecommendationsRealtimeSync({
  userId,
}: RecommendationsRealtimeSyncProps) {
  const router = useRouter();
  const hasRefreshedOnMount = useRef(false);

  useEffect(() => {
    const supabase = createClient();
    let refreshTimer: number | undefined;

    const refreshDashboard = () => {
      window.clearTimeout(refreshTimer);
      refreshTimer = window.setTimeout(() => {
        router.refresh();
      }, 180);
    };

    if (!hasRefreshedOnMount.current) {
      hasRefreshedOnMount.current = true;
      refreshDashboard();
    }

    const channel = supabase
      .channel(`dashboard-recommendations:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "roadmap_items",
          filter: `user_id=eq.${userId}`,
        },
        refreshDashboard,
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "analyses",
          filter: `user_id=eq.${userId}`,
        },
        refreshDashboard,
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "skill_gaps",
          filter: `user_id=eq.${userId}`,
        },
        refreshDashboard,
      )
      .subscribe();

    const refreshWhenVisible = () => {
      if (document.visibilityState === "visible") refreshDashboard();
    };

    window.addEventListener("focus", refreshDashboard);
    document.addEventListener("visibilitychange", refreshWhenVisible);

    return () => {
      window.clearTimeout(refreshTimer);
      window.removeEventListener("focus", refreshDashboard);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
      void supabase.removeChannel(channel);
    };
  }, [router, userId]);

  return null;
}
