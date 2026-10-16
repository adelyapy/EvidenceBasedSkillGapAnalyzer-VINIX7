"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { fields, styles } from "@/data/auth";
import type { AuthMode, FieldName, FormErrors, FormValues, Notice } from "@/types/auth";
import { validate } from "./auth.validation";
import AuthIntro from "./AuthIntro";
import AuthForm from "./AuthForm";
import "@/styles/auth.css";

const initialValues: FormValues = {
  fullName: "",
  email: "",
  password: "",
  confirmPassword: "",
};

export default function AuthPage({ mode }: { mode: AuthMode }) {
  const [values, setValues] = useState<FormValues>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touchedSubmit, setTouchedSubmit] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);
  const loadingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (loadingTimer.current) clearTimeout(loadingTimer.current);
    };
  }, []);

  function updateField(name: FieldName, value: string) {
    const next = { ...values, [name]: value };
    setValues(next);
    if (touchedSubmit) setErrors(validate(next, mode));
    setNotice(null);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;
    setTouchedSubmit(true);
    setNotice(null);
    const nextErrors = validate(values, mode);
    setErrors(nextErrors);
    const invalidField = fields[mode].find((field) => nextErrors[field]);
    if (invalidField) {
      setNotice({ type: "error", text: "Periksa kembali kolom yang ditandai merah." });
      // Kesalahan sudah diberi pesan spesifik di bawah kolom terkait.
      document.getElementById(`${mode}-${invalidField}`)?.focus();
      return;
    }

    // DEMO FRONTEND: animasi loading ini bukan permintaan autentikasi ke server.
    // Tim backend nantinya mengganti bagian ini dengan request ke API yang aman.
    setLoading(true);
    loadingTimer.current = setTimeout(() => {
      setLoading(false);
      setNotice({
        type: "info",
        text:
          mode === "login"
            ? "Form valid. Login sebenarnya belum tersedia karena API autentikasi belum terhubung."
            : mode === "register"
              ? "Form valid. Pembuatan akun menunggu integrasi dengan backend."
              : "Email valid. Pengiriman tautan reset menunggu integrasi dengan backend.",
      });
      loadingTimer.current = null;
    }, 1200);
  }

  return (
    <main className={styles.screen}>
      <div className={`${styles.shell} ${styles[mode]}`}>
        <AuthIntro mode={mode} />
        <AuthForm
          mode={mode}
          values={values}
          errors={errors}
          loading={loading}
          notice={notice}
          onFieldChange={updateField}
          onSubmit={handleSubmit}
          onGoogleClick={() => setNotice({ type: "info", text: "Masuk dengan Google belum aktif. OAuth Google perlu dihubungkan ke backend terlebih dahulu." })}
        />
      </div>
    </main>
  );
}
