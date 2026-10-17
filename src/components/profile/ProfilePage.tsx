import { profileDemo } from "@/data/profile";
import PersonalInformationCard from "./PersonalInformationCard";
import ProfileOverviewCard from "./ProfileOverviewCard";

export default function ProfilePage() {
  return (
    <div className="bkpfl-page">
      <header className="bkpfl-pageHeader">
        <p className="bkpfl-kicker">Akun</p>
        <h1>Profil Saya</h1>
        <p>Kelola informasi akun dan lihat ringkasan profilmu.</p>
      </header>

      <aside className="bkpfl-demoNote" aria-label="Keterangan data profil">
        <strong>Data contoh prototipe.</strong>
        <span> Informasi ini masih bersifat demo dan belum terhubung dengan autentikasi atau akun pengguna.</span>
      </aside>

      <div className="bkpfl-grid">
        <ProfileOverviewCard profile={profileDemo} />
        <PersonalInformationCard profile={profileDemo} />
      </div>
    </div>
  );
}
