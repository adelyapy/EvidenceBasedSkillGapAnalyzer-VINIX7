"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import "./auth.css";

const styles = {
  back: "bka-back",
  benefits: "bka-benefits",
  card: "bka-card",
  description: "bka-description",
  divider: "bka-divider",
  field: "bka-field",
  fieldError: "bka-fieldError",
  fieldIcon: "bka-fieldIcon",
  fieldTop: "bka-fieldTop",
  forgot: "bka-forgot",
  form: "bka-form",
  googleButton: "bka-googleButton",
  headline: "bka-headline",
  illustration: "bka-illustration",
  inputError: "bka-inputError",
  inputWrap: "bka-inputWrap",
  intro: "bka-intro",
  left: "bka-left",
  login: "bka-login",
  notice: "bka-notice",
  noticeError: "bka-noticeError",
  noticeInfo: "bka-noticeInfo",
  primaryButton: "bka-primaryButton",
  register: "bka-register",
  reset: "bka-reset",
  right: "bka-right",
  screen: "bka-screen",
  shell: "bka-shell",
  socialArea: "bka-socialArea",
  spinner: "bka-spinner",
  switch: "bka-switch",
  tick: "bka-tick",
} as const;


type AuthMode = "login" | "register" | "reset";
type FieldName = "fullName" | "email" | "password" | "confirmPassword";
type FormValues = Record<FieldName, string>;
type FormErrors = Partial<Record<FieldName, string>>;
type Notice = { type: "info" | "error"; text: string } | null;

const initialValues: FormValues = {
  fullName: "",
  email: "",
  password: "",
  confirmPassword: "",
};

const contents = {
  login: {
    heading: <>Satu Akun<br />untuk Masa Depan<br />Lebih Jelas</>,
    illustration: "/images/login-illustration.png",
    imageAlt: "Ilustrasi dokumen proyek dengan panah kemajuan",
    title: "Masuk ke Buktiva",
    description: "Lanjutkan perjalanan kariermu berdasarkan proyek nyata.",
    submit: "MASUK",
    benefits: [
      "Analisis proyek dengan AI",
      "Validasi kompetensi",
      "Temukan skill gap",
      "Dapatkan roadmap pembelajaran",
    ],
  },
  register: {
    heading: <>Bergabung<br />di Buktiva Sekarang</>,
    illustration: "/images/register-illustration.png",
    imageAlt: "Ilustrasi perempuan menggunakan laptop untuk membangun portofolio",
    title: "Daftar ke Buktiva",
    description: "Buat akun baru dan mulai bergabung bersama kami.",
    submit: "DAFTAR",
    benefits: [
      "Gratis dan mudah dibuat",
      "Akses ke semua fitur",
      "Dukungan penuh dari tim kami",
      "Mulai bangun portofolio profesional",
    ],
  },
  reset: {
    heading: <>Lupa Kata Sandi?</>,
    illustration: "/images/reset-illustration.png",
    imageAlt: "Ilustrasi pengiriman email untuk mereset kata sandi",
    title: "Mengatur Ulang Kata Sandi",
    description:
      "Masukkan alamat email yang terdaftar di akun Buktiva Anda. Kami akan mengirimkan tautan untuk mengatur ulang kata sandi.",
    submit: "Kirim Tautan",
    benefits: [] as string[],
  },
};

const fields: Record<AuthMode, FieldName[]> = {
  login: ["email", "password"],
  register: ["fullName", "email", "password", "confirmPassword"],
  reset: ["email"],
};

const fieldLabels: Record<FieldName, string> = {
  fullName: "Nama Lengkap",
  email: "Email",
  password: "Kata Sandi",
  confirmPassword: "Konfirmasi Kata Sandi",
};

const fieldPlaceholders: Record<FieldName, string> = {
  fullName: "Masukkan nama lengkap Anda.",
  email: "Masukkan alamat email Anda.",
  password: "Masukkan kata sandi minimal 8 karakter.",
  confirmPassword: "Masukkan ulang kata sandi yang sudah Anda buat.",
};

function validate(values: FormValues, mode: AuthMode): FormErrors {
  const errors: FormErrors = {};
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (mode === "register" && !values.fullName.trim()) {
    errors.fullName = "Nama lengkap wajib diisi.";
  }
  if (!values.email.trim()) {
    errors.email = "Email wajib diisi.";
  } else if (!emailPattern.test(values.email.trim())) {
    errors.email = "Format email tidak valid. Contoh: nama@email.com";
  }
  if (mode !== "reset") {
    if (!values.password) {
      errors.password = "Kata sandi wajib diisi.";
    } else if (mode === "register" && values.password.length < 8) {
      errors.password = "Kata sandi minimal 8 karakter.";
    }
  }
  if (mode === "register") {
    if (!values.confirmPassword) {
      errors.confirmPassword = "Konfirmasi kata sandi wajib diisi.";
    } else if (values.confirmPassword !== values.password) {
      errors.confirmPassword = "Konfirmasi kata sandi tidak cocok.";
    }
  }
  return errors;
}

function FieldIcon({ name }: { name: FieldName }) {
  if (name === "email") {
    return <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M3.6 5h16.8A1.6 1.6 0 0 1 22 6.6V7l-10 7L2 7v-.4A1.6 1.6 0 0 1 3.6 5Z"/><path d="M2 9.2 11.4 16a1 1 0 0 0 1.2 0L22 9.2v8.2a1.6 1.6 0 0 1-1.6 1.6H3.6A1.6 1.6 0 0 1 2 17.4V9.2Z"/></svg>;
  }
  if (name === "fullName") {
    return <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="12" cy="7.8" r="4.2"/><path d="M3 20.4c0-4.7 3.7-7.2 9-7.2s9 2.5 9 7.2V22H3v-1.6Z"/></svg>;
  }
  return <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6.1 9V6.5a5.9 5.9 0 0 1 11.8 0V9h.8a2.3 2.3 0 0 1 2.3 2.3v8.4a2.3 2.3 0 0 1-2.3 2.3H5.3A2.3 2.3 0 0 1 3 19.7v-8.4A2.3 2.3 0 0 1 5.3 9h.8Zm2.1 0h7.6V6.5a3.8 3.8 0 1 0-7.6 0V9Zm.5 8.2a1.45 1.45 0 1 0 0-2.9 1.45 1.45 0 0 0 0 2.9Zm3.3 0a1.45 1.45 0 1 0 0-2.9 1.45 1.45 0 0 0 0 2.9Zm3.3 0a1.45 1.45 0 1 0 0-2.9 1.45 1.45 0 0 0 0 2.9Z"/></svg>;
}

export default function AuthPage({ mode }: { mode: AuthMode }) {
  const data = contents[mode];
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

  const isReset = mode === "reset";
  const isRegister = mode === "register";

  return (
    <main className={styles.screen}>
      <div className={`${styles.shell} ${styles[mode]}`}>
        <section className={styles.left} aria-labelledby={`${mode}-headline`}>
          <h1 id={`${mode}-headline`} className={styles.headline}>{data.heading}</h1>
          {isReset ? (
            <p className={styles.intro}>Tidak masalah! Masukkan alamat email Anda dan kami akan mengirimkan tautan untuk mengatur ulang kata sandi Anda.</p>
          ) : (
            <>
              {isRegister && <p className={styles.intro}>Buat akun dan mulai perjalanan kariermu bersama proyek-proyek nyata.</p>}
              <ul className={styles.benefits}>
                {data.benefits.map((benefit) => (
                  <li key={benefit}>
                    <span className={styles.tick} aria-hidden="true">
                      <svg viewBox="0 0 24 24" fill="none"><path d="m4.2 12.5 5.1 5.1 10.5-11" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </span>
                    {benefit}
                  </li>
                ))}
              </ul>
            </>
          )}
          <div className={styles.illustration}>
            <Image src={data.illustration} alt={data.imageAlt} width={mode === "login" ? 1580 : mode === "register" ? 1604 : 1448} height={mode === "login" ? 995 : mode === "register" ? 980 : 1086} priority sizes="(max-width: 700px) 75vw, 360px" />
          </div>
        </section>

        <div className={styles.right}>
          <section className={styles.card} aria-labelledby={`${mode}-title`}>
            <h2 id={`${mode}-title`}>{data.title}</h2>
            <p className={styles.description}>{data.description}</p>

            <form onSubmit={handleSubmit} noValidate className={styles.form}>
              {fields[mode].map((name) => {
                const isPass = name === "password" || name === "confirmPassword";
                const inputType = name === "email" ? "email" : isPass ? "password" : "text";
                const autocomplete = name === "email" ? "email" : name === "fullName" ? "name" : isRegister ? "new-password" : "current-password";
                const placeholder = mode === "login" && name === "password" ? "Masukkan kata sandi Anda." : fieldPlaceholders[name];
                return (
                  <div className={styles.field} key={name}>
                    <div className={styles.fieldTop}>
                      <label htmlFor={`${mode}-${name}`}>{fieldLabels[name]}</label>
                      {mode === "login" && name === "password" && <Link href="/reset-password" className={styles.forgot}>Lupa kata sandi?</Link>}
                    </div>
                    <div className={`${styles.inputWrap} ${errors[name] ? styles.inputError : ""}`}>
                      <span className={styles.fieldIcon}><FieldIcon name={name} /></span>
                      <input
                        id={`${mode}-${name}`}
                        name={name}
                        type={inputType}
                        value={values[name]}
                        onChange={(event) => updateField(name, event.target.value)}
                        placeholder={placeholder}
                        autoComplete={autocomplete}
                        aria-invalid={Boolean(errors[name])}
                        aria-describedby={errors[name] ? `${mode}-${name}-error` : undefined}
                        disabled={loading}
                        required
                      />
                    </div>
                    {errors[name] && <p className={styles.fieldError} id={`${mode}-${name}-error`}>{errors[name]}</p>}
                  </div>
                );
              })}
              <button className={styles.primaryButton} disabled={loading} type="submit" aria-busy={loading}>
                {loading ? <><span className={styles.spinner} aria-hidden="true" />{isReset ? "Mengirim..." : isRegister ? "Mendaftar..." : "Memproses..."}</> : data.submit}
              </button>
              {notice && <p role={notice.type === "error" ? "alert" : "status"} className={`${styles.notice} ${notice.type === "error" ? styles.noticeError : styles.noticeInfo}`}>{notice.text}</p>}
            </form>

            {!isReset && (
              <div className={styles.socialArea}>
                <div className={styles.divider}><span>{isRegister ? "atau" : "atau lanjutkan dengan"}</span></div>
                <button
                  type="button"
                  className={styles.googleButton}
                  onClick={() => setNotice({ type: "info", text: "Masuk dengan Google belum aktif. OAuth Google perlu dihubungkan ke backend terlebih dahulu." })}
                >
                  <Image src="/images/google-icon.png" alt="" width={27} height={27}/>
                  {isRegister ? "Daftar dengan Google" : "Lanjutkan dengan Google"}
                </button>
              </div>
            )}
            {!isReset && (
              <p className={styles.switch}>
                {isRegister ? "Sudah punya akun? " : "Belum punya akun? "}
                <Link href={isRegister ? "/login" : "/register"}>{isRegister ? "Masuk di sini." : "Daftar Sekarang."}</Link>
              </p>
            )}
          </section>
          <Link href={isReset ? "/login" : "/"} className={styles.back}>
            <svg viewBox="0 0 44 21" fill="none" aria-hidden="true"><path d="M40 10.5H3m0 0 9-9m-9 9 9 9" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>
            {isReset ? "Kembali ke Halaman Masuk" : "Kembali ke Beranda"}
          </Link>
        </div>
      </div>
    </main>
  );
}
