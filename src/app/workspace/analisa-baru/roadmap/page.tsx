import type { Metadata } from "next";
import UnavailableAnalysisFeature from "@/components/analysis/UnavailableAnalysisFeature";
import "@/styles/unavailable-analysis-feature.css";

export const metadata: Metadata = {
  title: "Roadmap Belum Tersedia | BUKTIVA",
};

export default function WorkspaceRoadmapPage() {
  return (
    <UnavailableAnalysisFeature
      featureName="Roadmap Pengembangan"
      description="Halaman roadmap terpisah belum tersedia pada alur aplikasi yang sedang digunakan."
    />
  );
}
