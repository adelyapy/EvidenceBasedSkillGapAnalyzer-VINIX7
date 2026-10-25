import type { Metadata } from "next";
import AnalysisResultPage from "@/components/analysis/AnalysisResultPage";
import "@/styles/analysis-result.css";

export const metadata: Metadata = { title: "Hasil Analisis | BUKTIVA" };

type WorkspaceAnalysisResultPageProps = {
  searchParams: Promise<{
    analysisId?: string | string[];
  }>;
};

export default async function WorkspaceAnalysisResultPage({
  searchParams,
}: WorkspaceAnalysisResultPageProps) {
  const query = await searchParams;
  const analysisId = Array.isArray(query.analysisId)
    ? query.analysisId[0]
    : query.analysisId;

  return <AnalysisResultPage analysisId={analysisId} />;
}
