import { redirect } from "next/navigation";
import { analysisRoutes } from "@/data/analysis";

export default function LegacyQuestionFourRoute() {
  redirect(analysisRoutes.question(4));
}
