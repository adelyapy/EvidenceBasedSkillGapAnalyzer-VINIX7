"use client";

import { useState } from "react";
import Link from "next/link";
import { fieldLabels, fieldPlaceholders, styles } from "@/data/auth";
import type { AuthMode, FieldName } from "@/types/auth";

function FieldIcon({ name }: { name: FieldName }) {
  if (name === "email") {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M3.6 5h16.8A1.6 1.6 0 0 1 22 6.6V7l-10 7L2 7v-.4A1.6 1.6 0 0 1 3.6 5Z" />
        <path d="M2 9.2 11.4 16a1 1 0 0 0 1.2 0L22 9.2v8.2a1.6 1.6 0 0 1-1.6 1.6H3.6A1.6 1.6 0 0 1 2 17.4V9.2Z" />
      </svg>
    );
  }
  if (name === "fullName") {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <circle cx="12" cy="7.8" r="4.2" />
        <path d="M3 20.4c0-4.7 3.7-7.2 9-7.2s9 2.5 9 7.2V22H3v-1.6Z" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M6.1 9V6.5a5.9 5.9 0 0 1 11.8 0V9h.8a2.3 2.3 0 0 1 2.3 2.3v8.4a2.3 2.3 0 0 1-2.3 2.3H5.3A2.3 2.3 0 0 1 3 19.7v-8.4A2.3 2.3 0 0 1 5.3 9h.8Zm2.1 0h7.6V6.5a3.8 3.8 0 1 0-7.6 0V9Zm.5 8.2a1.45 1.45 0 1 0 0-2.9 1.45 1.45 0 0 0 0 2.9Zm3.3 0a1.45 1.45 0 1 0 0-2.9 1.45 1.45 0 0 0 0 2.9Zm3.3 0a1.45 1.45 0 1 0 0-2.9 1.45 1.45 0 0 0 0 2.9Z" />
    </svg>
  );
}

export function PasswordVisibilityIcon({ visible }: { visible: boolean }) {
  return visible ? (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 3l18 18M10.6 10.7a2 2 0 0 0 2.7 2.7M9.9 4.3A10.8 10.8 0 0 1 12 4c5.5 0 9 5 9 5a15.7 15.7 0 0 1-3 3.5M6.2 6.2C4.2 7.4 3 9 3 9s3.5 5 9 5c1 0 1.9-.2 2.7-.4" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 12s3.5-5 9-5 9 5 9 5-3.5 5-9 5-9-5-9-5Z" />
      <circle cx="12" cy="12" r="2.5" />
    </svg>
  );
}

type AuthFieldProps = {
  mode: AuthMode;
  name: FieldName;
  value: string;
  error?: string;
  loading: boolean;
  onChange: (value: string) => void;
};

export default function AuthField({
  mode,
  name,
  value,
  error,
  loading,
  onChange,
}: AuthFieldProps) {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const isRegister = mode === "register";
  const isPass = name === "password" || name === "confirmPassword";
  const inputType = name === "email" ? "email" : isPass ? "password" : "text";
  const autocomplete =
    name === "email"
      ? "email"
      : name === "fullName"
        ? "name"
        : isRegister
          ? "new-password"
          : "current-password";
  const placeholder =
    mode === "login" && name === "password"
      ? "Masukkan kata sandi Anda."
      : fieldPlaceholders[name];

  return (
    <div className={styles.field}>
      <div className={styles.fieldTop}>
        <label htmlFor={`${mode}-${name}`}>{fieldLabels[name]}</label>
        {mode === "login" && name === "password" && (
          <Link href="/reset-password" className={styles.forgot}>
            Lupa kata sandi?
          </Link>
        )}
      </div>
      <div className={`${styles.inputWrap} ${error ? styles.inputError : ""}`}>
        <span className={styles.fieldIcon}>
          <FieldIcon name={name} />
        </span>
        <input
          id={`${mode}-${name}`}
          name={name}
          type={isPass && passwordVisible ? "text" : inputType}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          autoComplete={autocomplete}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${mode}-${name}-error` : undefined}
          disabled={loading}
          required
        />
        {isPass && (
          <button
            type="button"
            className={styles.passwordToggle}
            onClick={() => setPasswordVisible((visible) => !visible)}
            aria-label={
              passwordVisible
                ? "Sembunyikan kata sandi"
                : "Tampilkan kata sandi"
            }
            aria-pressed={passwordVisible}
            aria-controls={`${mode}-${name}`}
            disabled={loading}
          >
            <PasswordVisibilityIcon visible={passwordVisible} />
          </button>
        )}
      </div>
      {error && (
        <p className={styles.fieldError} id={`${mode}-${name}-error`}>
          {error}
        </p>
      )}
    </div>
  );
}
