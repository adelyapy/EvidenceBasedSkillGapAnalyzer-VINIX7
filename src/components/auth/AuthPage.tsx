"use client";

import { useCallback, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { fields, styles } from "@/data/auth";
import type {
  AuthMode,
  FieldName,
  FormErrors,
  FormValues,
  Notice,
} from "@/types/auth";
import { validate } from "./auth.validation";
import AuthIntro from "./AuthIntro";
import AuthForm from "./AuthForm";
import RegistrationSuccessDialog from "./RegistrationSuccessDialog";
import { createClient } from "@/lib/supabase/client";
import "@/styles/auth.css";

const initialValues: FormValues = {
  fullName: "",
  email: "",
  password: "",
  confirmPassword: "",
};

export default function AuthPage({ mode }: { mode: AuthMode }) {
  const router = useRouter();
  const [values, setValues] = useState<FormValues>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touchedSubmit, setTouchedSubmit] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);
  const [registrationEmail, setRegistrationEmail] = useState<string | null>(
    null,
  );
  const showHomeLink = mode === "login" || mode === "register";

  const closeRegistrationDialog = useCallback(() => {
    setRegistrationEmail(null);
  }, []);

  function updateField(name: FieldName, value: string) {
    const next = { ...values, [name]: value };
    setValues(next);
    if (touchedSubmit) setErrors(validate(next, mode));
    setNotice(null);
  }

  async function handleGoogleClick() {
    if (loading) return;

    setLoading(true);
    setNotice(null);

    try {
      const supabase = createClient();

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Gagal memulai login dengan Google.";

      setNotice({
        type: "error",
        text: message,
      });

      setLoading(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;

    setTouchedSubmit(true);
    setNotice(null);

    const nextErrors = validate(values, mode);
    setErrors(nextErrors);

    const invalidField = fields[mode].find((field) => nextErrors[field]);

    if (invalidField) {
      document.getElementById(`${mode}-${invalidField}`)?.focus();
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const email = values.email.trim();

      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password: values.password,
        });

        if (error) throw error;

        router.replace("/workspace/dashboard");
        router.refresh();
        return;
      }

      if (mode === "register") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password: values.password,
          options: {
            data: {
              full_name: values.fullName.trim(),
            },
            emailRedirectTo: `${window.location.origin}/login`,
          },
        });

        if (error) throw error;

        if (data.session) {
          setNotice({
            type: "info",
            text: "Pendaftaran berhasil. Akun Anda sudah aktif.",
          });
        } else {
          setRegistrationEmail(email);
        }

        setValues(initialValues);
        return;
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      });

      if (error) throw error;

      setNotice({
        type: "info",
        text: "Jika email terdaftar, tautan reset kata sandi akan dikirim. Silakan periksa kotak masuk email Anda.",
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Terjadi kesalahan.";

      setNotice({
        type: "error",
        text:
          message === "Invalid login credentials"
            ? "Email atau kata sandi salah."
            : message,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      className={`${styles.screen}${showHomeLink ? ` ${styles.screenWithHome}` : ""}`}
    >
      {showHomeLink && (
        <Link href="/" className={styles.homeLink}>
          Kembali ke Beranda
        </Link>
      )}
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
          onGoogleClick={handleGoogleClick}
        />
      </div>
      <RegistrationSuccessDialog
        email={registrationEmail}
        onClose={closeRegistrationDialog}
      />
    </main>
  );
}
