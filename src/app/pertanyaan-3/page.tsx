import { redirect } from "next/navigation";
import { analysisRoutes } from "@/data/analysis";

export default function LegacyQuestionThreeRoute() {
  redirect(analysisRoutes.question(3));
}
