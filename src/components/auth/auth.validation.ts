import type { AuthMode, FormErrors, FormValues } from "@/types/auth";

export function validate(values: FormValues, mode: AuthMode): FormErrors {
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
