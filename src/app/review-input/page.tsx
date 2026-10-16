import { redirect } from "next/navigation";
import { analysisRoutes } from "@/data/analysis";

export default function LegacyReviewInputRoute() {
  redirect(analysisRoutes.reviewInput);
}
