import type { Metadata } from "next";
import type { ReactNode } from "react";
import WorkspaceShell from "@/components/workspace/WorkspaceShell";
import "@/styles/workspace.css";

export const metadata: Metadata = { title: "Workspace | BUKTIVA" };

export default function WorkspaceLayout({ children }: { children: ReactNode }) {
  return <WorkspaceShell>{children}</WorkspaceShell>;
}
