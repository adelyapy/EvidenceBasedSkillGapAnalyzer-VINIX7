import type { Metadata } from "next";
import AuthPage from "../../components/auth/AuthPage";

export const metadata: Metadata = { title: "Lupa Kata Sandi | BUKTIVA" };

export default function ResetPasswordPage() {
  return <AuthPage mode="reset" />;
}
