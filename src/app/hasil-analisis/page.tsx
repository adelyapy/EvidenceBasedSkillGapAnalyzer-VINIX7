import { redirect } from "next/navigation";
import { analysisRoutes } from "@/data/analysis";

export default function LegacyAnalysisResultRoute() {
  redirect(analysisRoutes.result);
}
