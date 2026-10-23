"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { styles } from "@/data/auth";

type RegistrationSuccessDialogProps = {
  email: string | null;
  onClose: () => void;
};

export default function RegistrationSuccessDialog({
  email,
  onClose,
}: RegistrationSuccessDialogProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!email) return;

    const previousFocus =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusFrame = window.requestAnimationFrame(() => {
      closeButtonRef.current?.focus();
    });

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }

      if (event.key === "Tab") {
        event.preventDefault();
        closeButtonRef.current?.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousBodyOverflow;
      previousFocus?.focus();
    };
  }, [email, onClose]);

  if (!email || typeof document === "undefined") return null;

  return createPortal(
    <div className={styles.confirmationBackdrop}>
      <section
        className={styles.confirmationDialog}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="registration-success-title"
        aria-describedby="registration-success-description"
      >
        <div className={styles.confirmationIcon} aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none">
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <path d="m4 7 8 6 8-6" />
            <path d="m8.5 16.5 2 2 4-4" />
          </svg>
        </div>

        <p className={styles.confirmationEyebrow}>Pendaftaran berhasil</p>
        <h2 id="registration-success-title">Periksa emailmu</h2>
        <p id="registration-success-description">
          Kami telah mengirim tautan verifikasi ke alamat berikut:
        </p>
        <strong className={styles.confirmationEmail}>{email}</strong>
        <p className={styles.confirmationInstruction}>
          Buka email tersebut dan klik tautan verifikasi untuk mengaktifkan
          akun serta melanjutkan ke halaman login.
        </p>
        <p className={styles.confirmationNote}>
          Belum menemukannya? Periksa folder spam atau promosi.
        </p>

        <button
          ref={closeButtonRef}
          className={styles.confirmationButton}
          type="button"
          onClick={onClose}
        >
          Saya mengerti
        </button>
      </section>
    </div>,
    document.body,
  );
}
