import { redirect } from "next/navigation";
import { analysisRoutes } from "@/data/analysis";

export default function LegacyQuestionOneRoute() {
  redirect(analysisRoutes.question(1));
}
