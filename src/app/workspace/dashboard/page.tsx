import DashboardHero from "@/components/dashboard/sections/DashboardHero";
import DashboardStats from "@/components/dashboard/sections/DashboardStats";
import LatestAnalysis from "@/components/dashboard/sections/LatestAnalysis";
import Recommendations from "@/components/dashboard/sections/Recommendations";
import RecentHistory from "@/components/dashboard/sections/RecentHistory";
import LearningRoadmap from "@/components/dashboard/sections/LearningRoadmap";
import "@/styles/dashboard.css";

export default function DashboardPage() {
  return (
    <div className="bkd-dashboard">
      <DashboardHero />
      <DashboardStats />
      <div className="bkd-contentGrid">
        <LatestAnalysis />
        <Recommendations />
        <RecentHistory />
        <LearningRoadmap />
      </div>
    </div>
  );
}
