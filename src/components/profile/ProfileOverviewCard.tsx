
import Image from "next/image";
import type { ProfileData } from "@/types/profile";

type ProfileOverviewCardProps = {
  profile: ProfileData;
  avatarSrc: string;
};

export default function ProfileOverviewCard({
  profile,
  avatarSrc,
}: ProfileOverviewCardProps) {
  return (
    <section
      className="bkpfl-card bkpfl-overview"
      aria-labelledby="bkpfl-overview-title"
    >
      <div className="bkpfl-avatarFrame">
        <Image
          className="bkpfl-avatar"
          src={avatarSrc}
          alt={`Foto profil ${profile.fullName}`}
          width={160}
          height={160}
          priority
          unoptimized={avatarSrc.startsWith("blob:")}
        />
      </div>

      <div className="bkpfl-identity">
        <p className="bkpfl-eyebrow">Profil pengguna</p>
        <h2 id="bkpfl-overview-title">{profile.fullName}</h2>
        <p className="bkpfl-email">{profile.email}</p>
        <p className="bkpfl-role">{profile.role}</p>
      </div>
    </section>
  );
}
