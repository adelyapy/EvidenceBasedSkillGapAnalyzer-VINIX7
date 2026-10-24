import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Suspense } from "react";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import WorkspaceLoading from "@/components/workspace/WorkspaceLoading";
import WorkspaceShell from "@/components/workspace/WorkspaceShell";
import { createClient } from "@/lib/supabase/server";
import "@/styles/workspace-loading.css";
import "@/styles/workspace.css";

export const metadata: Metadata = { title: "Workspace | BUKTIVA" };

async function AuthenticatedWorkspace({ children }: { children: ReactNode }) {
  await connection();

  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .maybeSingle();

  const displayName =
    profile?.full_name?.trim() ||
    user.user_metadata?.full_name?.trim() ||
    user.email?.split("@")[0] ||
    "Pengguna";

  return (
    <WorkspaceShell
      user={{
        name: displayName,
        role: "Mahasiswa",
        avatar: "/images/profile/profile.png",
      }}
    >
      {children}
    </WorkspaceShell>
  );
}

export default function WorkspaceLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<WorkspaceLoading />}>
      <AuthenticatedWorkspace>{children}</AuthenticatedWorkspace>
    </Suspense>
  );
}
