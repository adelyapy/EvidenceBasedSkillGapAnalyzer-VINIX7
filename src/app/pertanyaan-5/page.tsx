import { redirect } from "next/navigation";
import { analysisRoutes } from "@/data/analysis";

export default function LegacyQuestionFiveRoute() {
  redirect(analysisRoutes.question(5));
}
