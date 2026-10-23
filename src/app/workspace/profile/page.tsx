import type { Metadata } from "next";
import ProfilePage from "@/components/profile/ProfilePage";
import "@/styles/profile.css";

export const metadata: Metadata = {
  title: "Profil Saya | BUKTIVA",
  description: "Profil pengguna contoh pada prototipe BUKTIVA.",
  robots: { index: false, follow: false },
};

export default function ProfileRoute() {
  return <ProfilePage />;
}
