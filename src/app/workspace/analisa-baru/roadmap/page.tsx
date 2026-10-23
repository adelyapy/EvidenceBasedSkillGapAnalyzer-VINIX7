import type { Metadata } from "next";
import RoadmapPage from "@/components/analysis/RoadmapPage";
import "@/styles/roadmap.css";

export const metadata: Metadata = { title: "Road Map Pengembangan Skill | BUKTIVA" };

export default function WorkspaceRoadmapPage() {
  return <RoadmapPage />;
}
