import { redirect } from "next/navigation";
import { analysisRoutes } from "@/data/analysis";

export default function LegacyProcessAnalysisRoute() {
  redirect(analysisRoutes.process);
}
