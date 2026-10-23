import type { ReactNode } from "react";
import type { AuthMode, FieldName } from "@/types/auth";

export const styles = {
  back: "bka-back",
  benefits: "bka-benefits",
  card: "bka-card",
  confirmationBackdrop: "bka-confirmationBackdrop",
  confirmationButton: "bka-confirmationButton",
  confirmationDialog: "bka-confirmationDialog",
  confirmationEmail: "bka-confirmationEmail",
  confirmationEyebrow: "bka-confirmationEyebrow",
  confirmationIcon: "bka-confirmationIcon",
  confirmationInstruction: "bka-confirmationInstruction",
  confirmationNote: "bka-confirmationNote",
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
  homeLink: "bka-homeLink",
  illustration: "bka-illustration",
  inputError: "bka-inputError",
  inputWrap: "bka-inputWrap",
  intro: "bka-intro",
  left: "bka-left",
  login: "bka-login",
  notice: "bka-notice",
  noticeError: "bka-noticeError",
  noticeInfo: "bka-noticeInfo",
  passwordToggle: "bka-passwordToggle",
  primaryButton: "bka-primaryButton",
  register: "bka-register",
  reset: "bka-reset",
  right: "bka-right",
  screen: "bka-screen",
  screenWithHome: "bka-screenWithHome",
  shell: "bka-shell",
  socialArea: "bka-socialArea",
  spinner: "bka-spinner",
  switch: "bka-switch",
  tick: "bka-tick",
} as const;

type AuthContent = {
  heading: ReactNode;
  illustration: string;
  imageAlt: string;
  title: string;
  description: string;
  submit: string;
  benefits: string[];
};

export const contents: Record<AuthMode, AuthContent> = {
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

export const fields: Record<AuthMode, FieldName[]> = {
  login: ["email", "password"],
  register: ["fullName", "email", "password", "confirmPassword"],
  reset: ["email"],
};

export const fieldLabels: Record<FieldName, string> = {
  fullName: "Nama Lengkap",
  email: "Email",
  password: "Kata Sandi",
  confirmPassword: "Konfirmasi Kata Sandi",
};

export const fieldPlaceholders: Record<FieldName, string> = {
  fullName: "Masukkan nama lengkap Anda.",
  email: "Masukkan alamat email Anda.",
  password: "Masukkan kata sandi minimal 8 karakter.",
  confirmPassword: "Masukkan ulang kata sandi yang sudah Anda buat.",
};
