import { Suspense } from "react";
import {
  DashboardHeroSkeleton,
  DashboardPanelSkeleton,
  DashboardStatsSkeleton,
} from "@/components/dashboard/DashboardSkeletons";
import DashboardHero from "@/components/dashboard/sections/DashboardHero";
import DashboardStats from "@/components/dashboard/sections/DashboardStats";
import LatestAnalysis from "@/components/dashboard/sections/LatestAnalysis";
import Recommendations from "@/components/dashboard/sections/Recommendations";
import RecentHistory from "@/components/dashboard/sections/RecentHistory";
import "@/styles/dashboard.css";

export default function DashboardPage() {
  return (
    <div className="bkd-dashboard">
      <Suspense fallback={<DashboardHeroSkeleton />}>
        <DashboardHero />
      </Suspense>
      <Suspense fallback={<DashboardStatsSkeleton />}>
        <DashboardStats />
      </Suspense>
      <div className="bkd-contentGrid bkd-contentGrid--withoutRoadmap">
        <Suspense fallback={<DashboardPanelSkeleton />}>
          <LatestAnalysis />
        </Suspense>
        <Suspense fallback={<DashboardPanelSkeleton />}>
          <Recommendations />
        </Suspense>
        <RecentHistory />
      </div>
    </div>
  );
}
