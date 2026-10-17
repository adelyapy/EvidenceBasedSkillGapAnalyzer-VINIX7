import type { Metadata } from "next";
import SkillGapReportPage from "@/components/analysis/SkillGapReportPage";
import "@/styles/skill-gap.css";

export const metadata: Metadata = { title: "Skill Gap Report | BUKTIVA" };

export default function WorkspaceSkillGapReportPage() {
  return <SkillGapReportPage />;
}
