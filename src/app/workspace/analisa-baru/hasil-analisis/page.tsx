import type { Metadata } from "next";
import AnalysisResultPage from "@/components/analysis/AnalysisResultPage";
import "@/styles/analysis-result.css";

export const metadata: Metadata = { title: "Hasil Analisis | BUKTIVA" };

export default function WorkspaceAnalysisResultPage() {
  return <AnalysisResultPage />;
}
