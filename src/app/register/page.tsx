import type { Metadata } from "next";
import AuthPage from "@/components/auth/AuthPage";

export const metadata: Metadata = { title: "Daftar | BUKTIVA" };

export default function RegisterPage() {
  return <AuthPage mode="register" />;
}
