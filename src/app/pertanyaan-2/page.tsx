import { redirect } from "next/navigation";
import { analysisRoutes } from "@/data/analysis";

export default function LegacyQuestionTwoRoute() {
  redirect(analysisRoutes.question(2));
}
