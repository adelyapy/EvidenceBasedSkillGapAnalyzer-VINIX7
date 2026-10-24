
"use client";

import { useEffect, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { createClient } from "@/lib/supabase/client";
import type { ProfileData } from "@/types/profile";
import PersonalInformationCard from "./PersonalInformationCard";
import ProfileOverviewCard from "./ProfileOverviewCard";

const defaultAvatar = "/images/profile/profile.png";

function formatJoinedDate(date: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(new Date(date));
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      try {
        const supabase = createClient();

        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError) throw authError;

        if (!user) {
          window.location.href = "/login";
          return;
        }

        const { data: dbProfile, error: profileError } = await supabase
          .from("profiles")
          .select("id, full_name, avatar_url, created_at")
          .eq("id", user.id)
          .maybeSingle();

        if (profileError) throw profileError;

        const fullName =
          dbProfile?.full_name?.trim() ||
          user.user_metadata?.full_name?.trim() ||
          user.email?.split("@")[0] ||
          "Pengguna";

        const joinedDateTime = user.created_at;
        const nextProfile: ProfileData = {
          fullName,
          email: user.email ?? "",
          role: "Mahasiswa",
          avatar: dbProfile?.avatar_url || defaultAvatar,
          joinedLabel: formatJoinedDate(joinedDateTime),
          joinedDateTime,
          passwordMask: "",
        };

        if (!cancelled) setProfile(nextProfile);
      } catch (err) {
        console.error("Gagal memuat profil:", err);
        if (!cancelled) {
          setError("Data profil gagal dimuat. Silakan muat ulang halaman.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadProfile();

    return () => {
      cancelled = true;
    };
  }, []);

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!profile) return;

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const formData = new FormData(event.currentTarget);
      const fullName = String(formData.get("fullName") ?? "").trim();
      const email = String(formData.get("email") ?? "").trim();

      if (!fullName || !email) {
        setError("Nama lengkap dan email wajib diisi.");
        return;
      }

      const supabase = createClient();

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) throw authError;
      if (!user) throw new Error("Sesi pengguna berakhir. Silakan login kembali.");

      const { data: updatedProfile, error: updateError } = await supabase
        .from("profiles")
        .update({ full_name: fullName })
        .eq("id", user.id)
        .select("full_name, avatar_url, created_at")
        .maybeSingle();

      if (updateError) throw updateError;

      if (!updatedProfile) {
        throw new Error("Profil tidak ditemukan atau tidak dapat diperbarui.");
      }

      let emailMessage = "";

      if (email.toLowerCase() !== (user.email ?? "").toLowerCase()) {
        const { error: emailError } = await supabase.auth.updateUser({ email });

        if (emailError) {
          throw new Error(
            `Nama berhasil disimpan, tetapi perubahan email gagal: ${emailError.message}`,
          );
        }

        emailMessage =
          " Permintaan perubahan email dikirim. Ikuti instruksi konfirmasi dari Supabase sebelum email baru berlaku.";
      }

      setProfile((current) =>
        current
          ? {
              ...current,
              fullName: updatedProfile.full_name || fullName,
              avatar: updatedProfile.avatar_url || defaultAvatar,
              joinedDateTime: current.joinedDateTime,
              joinedLabel: current.joinedLabel,
            }
          : current,
      );

      setEditing(false);
      setMessage(`Nama profil berhasil disimpan.${emailMessage}`);
    } catch (err) {
      console.error("Gagal menyimpan profil:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Profil gagal disimpan. Silakan coba kembali.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="bkpfl-page" aria-live="polite">Memuat profil...</div>;
  }

  if (!profile) {
    return (
      <div className="bkpfl-page">
        <h1>Profil Saya</h1>
        <p role="alert">{error || "Data profil belum tersedia."}</p>
        <button type="button" onClick={() => window.location.reload()}>
          Coba lagi
        </button>
      </div>
    );
  }

  return (
    <div className="bkpfl-page">
      <header className="bkpfl-pageHeader">
        <div>
          <p className="bkpfl-kicker">Akun</p>
          <h1>Profil Saya</h1>
          <p>Kelola informasi akun dan lihat ringkasan profilmu.</p>
        </div>

        <button
          className="bkpfl-editButton"
          type="button"
          onClick={() => {
            setError("");
            setMessage("");
            setEditing(true);
          }}
        >
          <span aria-hidden="true">✎</span> Edit profil
        </button>
      </header>

      {error && <p role="alert">{error}</p>}
      {message && <p role="status">{message}</p>}

      <div className="bkpfl-grid">
        <ProfileOverviewCard profile={profile} />
        <PersonalInformationCard profile={profile} />
      </div>

      {editing &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="bkpfl-modalBackdrop"
            role="presentation"
            onMouseDown={() => {
              if (!saving) setEditing(false);
            }}
          >
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

                <button
                  className="bkpfl-dialogClose"
                  type="button"
                  disabled={saving}
                  onClick={() => setEditing(false)}
                  aria-label="Tutup menu edit profil"
                >
                  ×
                </button>
              </div>

              <form className="bkpfl-editForm" onSubmit={saveProfile}>
                <label>
                  Nama lengkap
                  <input
                    name="fullName"
                    defaultValue={profile.fullName}
                    autoComplete="name"
                    maxLength={100}
                    required
                  />
                </label>

                <label>
                  Email
                  <input
                    name="email"
                    type="email"
                    defaultValue={profile.email}
                    autoComplete="email"
                    required
                  />
                </label>

                <p>
                  Peran akun: <strong>{profile.role}</strong>
                </p>
                <p>Peran tidak dapat diubah melalui formulir profil ini.</p>

                {error && <p role="alert">{error}</p>}

                <div className="bkpfl-formActions">
                  <button
                    className="bkpfl-cancelButton"
                    type="button"
                    disabled={saving}
                    onClick={() => setEditing(false)}
                  >
                    Batal
                  </button>
                  <button
                    className="bkpfl-saveButton"
                    type="submit"
                    disabled={saving}
                  >
                    {saving ? "Menyimpan..." : "Simpan perubahan"}
                  </button>
                </div>
              </form>
            </section>
          </div>,
          document.body,
        )}
    </div>
  );
}
