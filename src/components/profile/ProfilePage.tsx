
"use client";

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { createPortal } from "react-dom";
import { createClient } from "@/lib/supabase/client";
import { WORKSPACE_PROFILE_UPDATED_EVENT } from "@/data/workspace";
import { useAnimatedDismiss } from "@/hooks/useAnimatedDismiss";
import type { ProfileData } from "@/types/profile";
import PersonalInformationCard from "./PersonalInformationCard";
import ProfileOverviewCard from "./ProfileOverviewCard";
import ProfileSkeleton from "./ProfileSkeleton";
import Image from "next/image";

const defaultAvatar = "/images/profile/profile.png";
const SUCCESS_MESSAGE_DURATION = 5000;
const SUCCESS_MESSAGE_EXIT_DURATION = 240;

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
  const [messageLeaving, setMessageLeaving] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [selectedAvatar, setSelectedAvatar] = useState<File | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);  
  const {
    isClosing: editDialogClosing,
    requestDismiss: closeEditDialog,
    forceDismiss: closeEditDialogAfterSave,
  } = useAnimatedDismiss({
    onDismiss: () => setEditing(false),
    disabled: saving,
  });

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

  useEffect(() => {
    if (!message) return;

    const exitTimer = window.setTimeout(
      () => setMessageLeaving(true),
      SUCCESS_MESSAGE_DURATION,
    );
    const removeTimer = window.setTimeout(() => {
      setMessage("");
      setMessageLeaving(false);
    }, SUCCESS_MESSAGE_DURATION + SUCCESS_MESSAGE_EXIT_DURATION);

    return () => {
      window.clearTimeout(exitTimer);
      window.clearTimeout(removeTimer);
    };
  }, [message]);

  useEffect(() => {
    return () => {
      if (avatarPreview?.startsWith("blob:")) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  function selectAvatar(event: ChangeEvent<HTMLInputElement>) {
    const image = event.target.files?.[0];
    event.target.value = "";

    if (!image) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(image.type)) {
      setError("Pilih file gambar dengan format JPG, PNG, atau WebP.");
      return;
    }

    if (image.size > 5 * 1024 * 1024) {
      setError("Ukuran foto maksimal 5 MB.");
      return;
    }

    setError("");
    setMessage("");
    setMessageLeaving(false);

    setSelectedAvatar(image);
    setAvatarPreview(URL.createObjectURL(image));
  }

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!profile) return;

    setSaving(true);
    setError("");
    setMessage("");
    setMessageLeaving(false);

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

      let avatarUrl = profile.avatar;

      if (selectedAvatar) {
        const extensionByType: Record<string, string> = {
          "image/jpeg": "jpg",
          "image/png": "png",
          "image/webp": "webp",
        };

        const extension = extensionByType[selectedAvatar.type];
        const avatarPath = `${user.id}/${crypto.randomUUID()}.${extension}`;

        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(avatarPath, selectedAvatar, {
            contentType: selectedAvatar.type,
            upsert: false,
          });

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from("avatars")
          .getPublicUrl(avatarPath);

        avatarUrl = publicUrlData.publicUrl;
      }

      const { data: updatedProfile, error: updateError } = await supabase
        .from("profiles")
        .update({
          full_name: fullName,
          avatar_url: selectedAvatar ? avatarUrl : profile.avatar,
        })
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

      const savedFullName = updatedProfile.full_name?.trim() || fullName;

      setProfile((current) =>
        current
          ? {
              ...current,
              fullName: savedFullName,
              avatar: updatedProfile.avatar_url || defaultAvatar,
              joinedDateTime: current.joinedDateTime,
              joinedLabel: current.joinedLabel,
            }
          : current,
      );

      window.dispatchEvent(
        new CustomEvent(WORKSPACE_PROFILE_UPDATED_EVENT, {
          detail: { name: savedFullName },
        }),
      );

      closeEditDialogAfterSave();
      setMessageLeaving(false);
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
    return <ProfileSkeleton />;
  }

  if (!profile) {
    return (
      <div className="bkpfl-page">
        <section
          className="bkpfl-errorState"
          aria-labelledby="bkpfl-error-title"
        >
          <span className="bkpfl-errorIcon" aria-hidden="true">
            !
          </span>
          <h1 id="bkpfl-error-title">Profil belum dapat ditampilkan</h1>
          <p role="alert">{error || "Data profil belum tersedia."}</p>
          <button
            className="bkpfl-retryButton"
            type="button"
            onClick={() => window.location.reload()}
          >
            Coba lagi
          </button>
        </section>
      </div>
    );
  }

  return (
    <div className="bkpfl-page bkpfl-page--ready">
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
            setMessageLeaving(false);
            setEditing(true);
          }}
        >
          <svg
            aria-hidden="true"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" />
          </svg>
          Edit profil
        </button>
      </header>

      {error && (
        <p className="bkpfl-feedback bkpfl-feedback--error" role="alert">
          {error}
        </p>
      )}
      {message && (
        <p
          className={`bkpfl-feedback bkpfl-feedback--success${
            messageLeaving ? " bkpfl-feedback--leaving" : ""
          }`}
          role="status"
        >
          {message}
        </p>
      )}

      
      <div className="bkpfl-grid">
        <ProfileOverviewCard
          profile={profile}
          avatarSrc={avatarPreview || profile.avatar}
        />
        <PersonalInformationCard profile={profile} />
      </div>


      {editing &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className={`bkpfl-modalBackdrop${
              editDialogClosing ? " bkpfl-modalBackdrop--closing" : ""
            }`}
            role="presentation"
            onMouseDown={() => {
              closeEditDialog();
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
                  onClick={closeEditDialog}
                  aria-label="Tutup menu edit profil"
                >
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>

              <form className="bkpfl-editForm" onSubmit={saveProfile}>
                <div className="bkpfl-avatarEditField">
                  <span className="bkpfl-avatarEditLabel">Foto profil</span>

                  <div className="bkpfl-avatarEditPreview">
                    <Image
                      src={avatarPreview || profile.avatar}
                      alt={`Pratinjau foto profil ${profile.fullName}`}
                      width={96}
                      height={96}
                      unoptimized={Boolean(avatarPreview?.startsWith("blob:"))}
                    />
                  </div>

                  <input
                    ref={avatarInputRef}
                    className="bkpfl-avatarInput"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={selectAvatar}
                    aria-label="Pilih foto profil"
                  />

                  <button
                    className="bkpfl-avatarUploadButton"
                    type="button"
                    disabled={saving}
                    onClick={() => avatarInputRef.current?.click()}
                  >
                    <span aria-hidden="true">↥</span>
                    {selectedAvatar ? "Ganti foto" : "Unggah foto"}
                  </button>

                  <p className="bkpfl-avatarHint">
                    JPG, PNG, atau WebP · maksimal 5 MB
                  </p>
                </div>
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
                    onClick={closeEditDialog}
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
