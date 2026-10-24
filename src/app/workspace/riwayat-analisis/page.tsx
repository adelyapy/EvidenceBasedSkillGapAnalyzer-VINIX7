import type { Metadata } from "next";
import AnalysisHistoryPage from "@/components/history/AnalysisHistoryPage";
import "@/styles/history.css";

export const metadata: Metadata = {
  title: "Riwayat Analisis | BUKTIVA",
};

export default function WorkspaceAnalysisHistoryPage() {
  return <AnalysisHistoryPage />;
}
