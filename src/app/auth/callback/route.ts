
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next");

  // Hanya izinkan redirect relatif agar tidak menjadi open redirect.
  const destination =
    next && next.startsWith("/") && !next.startsWith("//")
      ? next
      : "/workspace/dashboard";

  if (!code) {
    return NextResponse.redirect(
      new URL("/login?error=google_auth_failed", url.origin),
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(
      new URL("/login?error=google_auth_failed", url.origin),
    );
  }

  return NextResponse.redirect(new URL(destination, url.origin));
}
