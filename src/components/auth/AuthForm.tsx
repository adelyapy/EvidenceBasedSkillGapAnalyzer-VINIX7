import type { FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { contents, fields, styles } from "@/data/auth";
import type { AuthMode, FieldName, FormErrors, FormValues, Notice } from "@/types/auth";
import AuthField from "./AuthField";

type AuthFormProps = {
  mode: AuthMode;
  values: FormValues;
  errors: FormErrors;
  loading: boolean;
  notice: Notice;
  onFieldChange: (name: FieldName, value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onGoogleClick: () => void;
};

export default function AuthForm({ mode, values, errors, loading, notice, onFieldChange, onSubmit, onGoogleClick }: AuthFormProps) {
  const data = contents[mode];
  const isReset = mode === "reset";
  const isRegister = mode === "register";

  return (
    <div className={styles.right}>
      <section className={styles.card} aria-labelledby={`${mode}-title`}>
        <h2 id={`${mode}-title`}>{data.title}</h2>
        <p className={styles.description}>{data.description}</p>

        <form onSubmit={onSubmit} noValidate className={styles.form}>
          {fields[mode].map((name) => (
            <AuthField
              key={name}
              mode={mode}
              name={name}
              value={values[name]}
              error={errors[name]}
              loading={loading}
              onChange={(value) => onFieldChange(name, value)}
            />
          ))}
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
              onClick={onGoogleClick}
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
  );
}
