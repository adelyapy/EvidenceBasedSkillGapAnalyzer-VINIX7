import Image from "next/image";
import type { ChangeEvent, RefObject } from "react";
import type { ProfileData } from "@/types/profile";

type ProfileOverviewCardProps = {
  profile: ProfileData;
  avatarSrc: string;
  avatarInputRef: RefObject<HTMLInputElement | null>;
  onAvatarChange: (event: ChangeEvent<HTMLInputElement>) => void;
};

export default function ProfileOverviewCard({
  profile,
  avatarSrc,
  avatarInputRef,
  onAvatarChange,
}: ProfileOverviewCardProps) {
  return (
    <section className="bkpfl-card bkpfl-overview" aria-labelledby="bkpfl-overview-title">
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
      <input
        ref={avatarInputRef}
        className="bkpfl-avatarInput"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={onAvatarChange}
        aria-label="Pilih foto profil"
      />
      <button
        className="bkpfl-avatarUploadButton"
        type="button"
        onClick={() => avatarInputRef.current?.click()}
      >
        <span aria-hidden="true">↥</span>
        Unggah foto
      </button>
      <p className="bkpfl-avatarHint">
        JPG, PNG, atau WebP · maksimal 5 MB
      </p>
      <div className="bkpfl-identity">
        <p className="bkpfl-eyebrow">Profil pengguna</p>
        <h2 id="bkpfl-overview-title">{profile.fullName}</h2>
        <p className="bkpfl-email">{profile.email}</p>
        <p className="bkpfl-role">{profile.role}</p>
      </div>
    </section>
  );
}
