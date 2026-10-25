import type { Metadata } from "next";
import UnavailableAnalysisFeature from "@/components/analysis/UnavailableAnalysisFeature";
import "@/styles/unavailable-analysis-feature.css";

export const metadata: Metadata = {
  title: "Skill Gap Report Belum Tersedia | BUKTIVA",
};

export default function WorkspaceSkillGapReportPage() {
  return (
    <UnavailableAnalysisFeature
      featureName="Skill Gap Report"
      description="Laporan skill gap terpisah belum tersedia pada alur aplikasi yang sedang digunakan."
    />
  );
}
