
"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import "@/styles/auth.css";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<{ type: "error" | "success"; text: string } | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice(null);

    if (password.length < 8) {
      setNotice({ type: "error", text: "Kata sandi harus terdiri dari minimal 8 karakter." });
      return;
    }

    if (password !== confirmPassword) {
      setNotice({ type: "error", text: "Konfirmasi kata sandi tidak cocok." });
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setNotice({ type: "error", text: "Sesi pemulihan tidak ditemukan atau sudah kedaluwarsa. Silakan minta tautan reset baru." });
        return;
      }

      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) throw error;

      setNotice({ type: "success", text: "Kata sandi berhasil diperbarui. Anda akan diarahkan ke halaman masuk." });

      await supabase.auth.signOut();
      setTimeout(() => router.replace("/login"), 1800);
    } catch (error) {
      setNotice({
        type: "error",
        text: error instanceof Error ? error.message : "Terjadi kesalahan saat memperbarui kata sandi.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="bka-screen bka-updateScreen">
      <section className="bka-updateCard" aria-labelledby="update-password-title">
        <p className="bka-updateEyebrow">ATUR ULANG KATA SANDI</p>
        <h1 id="update-password-title">Buat Kata Sandi Baru</h1>
        <p className="bka-updateDescription">Masukkan kata sandi baru untuk akun BUKTIVA Anda.</p>

        <form onSubmit={handleSubmit} className="bka-updateForm">
          <label className="bka-updateField" htmlFor="new-password">
            <span>Kata sandi baru</span>
            <input
              id="new-password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="bka-updateInput"
            />
          </label>

          <label className="bka-updateField" htmlFor="confirm-password">
            <span>Konfirmasi kata sandi baru</span>
            <input
              id="confirm-password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className="bka-updateInput"
            />
          </label>

          {notice && (
            <p role={notice.type === "error" ? "alert" : "status"} aria-live="polite" className={`bka-updateNotice bka-updateNotice--${notice.type}`}>{notice.text}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="bka-primaryButton bka-updateButton"
          >
            {loading ? "Menyimpan..." : "Simpan Kata Sandi Baru"}
          </button>
        </form>
      </section>
    </main>
  );
}
