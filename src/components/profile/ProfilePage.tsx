"use client";

import { useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { profileDemo } from "@/data/profile";
import type { ProfileData } from "@/types/profile";
import PersonalInformationCard from "./PersonalInformationCard";
import ProfileOverviewCard from "./ProfileOverviewCard";

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData>(profileDemo);
  const [editing, setEditing] = useState(false);

  function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    setProfile((currentProfile) => ({
      ...currentProfile,
      fullName: String(formData.get("fullName") ?? "").trim() || currentProfile.fullName,
      email: String(formData.get("email") ?? "").trim() || currentProfile.email,
      role: String(formData.get("role") ?? "").trim() || currentProfile.role,
    }));
    setEditing(false);
  }

  return (
    <div className="bkpfl-page">
      <header className="bkpfl-pageHeader">
        <div>
          <p className="bkpfl-kicker">Akun</p>
          <h1>Profil Saya</h1>
          <p>Kelola informasi akun dan lihat ringkasan profilmu.</p>
        </div>
        <button className="bkpfl-editButton" type="button" onClick={() => setEditing(true)}>
          <span aria-hidden="true">✎</span> Edit profil
        </button>
      </header>

      <aside className="bkpfl-demoNote" aria-label="Keterangan data profil">
        <strong>Data contoh prototipe.</strong>
        <span> Informasi ini masih bersifat demo dan belum terhubung dengan autentikasi atau akun pengguna.</span>
      </aside>

      <div className="bkpfl-grid">
        <ProfileOverviewCard profile={profile} />
        <PersonalInformationCard profile={profile} />
      </div>

      {editing && typeof document !== "undefined" && createPortal(
        <div className="bkpfl-modalBackdrop" role="presentation" onMouseDown={() => setEditing(false)}>
          <section
            className="bkpfl-editDialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="bkpfl-edit-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="bkpfl-dialogHeading">
              <div>
                <p className="bkpfl-eyebrow">Pengaturan akun</p>
                <h2 id="bkpfl-edit-title">Edit profil</h2>
              </div>
              <button className="bkpfl-dialogClose" type="button" onClick={() => setEditing(false)} aria-label="Tutup menu edit profil">×</button>
            </div>

            <form className="bkpfl-editForm" onSubmit={saveProfile}>
              <label>
                Nama lengkap
                <input name="fullName" defaultValue={profile.fullName} autoComplete="name" required />
              </label>
              <label>
                Email
                <input name="email" type="email" defaultValue={profile.email} autoComplete="email" required />
              </label>
              <label>
                Peran
                <input name="role" defaultValue={profile.role} required />
              </label>
              <div className="bkpfl-formActions">
                <button className="bkpfl-cancelButton" type="button" onClick={() => setEditing(false)}>Batal</button>
                <button className="bkpfl-saveButton" type="submit">Simpan perubahan</button>
              </div>
            </form>
          </section>
        </div>
      , document.body)}
    </div>
  );
}
