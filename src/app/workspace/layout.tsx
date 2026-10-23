
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Suspense } from "react";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import WorkspaceShell from "@/components/workspace/WorkspaceShell";
import { createClient } from "@/lib/supabase/server";
import "@/styles/workspace.css";

export const metadata: Metadata = { title: "Workspace | BUKTIVA" };

async function AuthenticatedWorkspace({
  children,
}: {
  children: ReactNode;
}) {
  await connection();

  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login");
  }

  return <WorkspaceShell>{children}</WorkspaceShell>;
}

export default function WorkspaceLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <Suspense fallback={<div aria-busy="true">Memuat workspace...</div>}>
      <AuthenticatedWorkspace>{children}</AuthenticatedWorkspace>
    </Suspense>
  );
}
