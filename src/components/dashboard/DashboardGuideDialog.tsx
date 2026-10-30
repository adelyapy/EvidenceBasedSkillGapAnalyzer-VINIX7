"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { analysisRoutes } from "@/data/analysis";
import { useAnimatedDismiss } from "@/hooks/useAnimatedDismiss";
import WorkspaceIcon from "@/components/workspace/WorkspaceIcon";

const guideSteps = [
  {
    title: "Tambahkan bukti proyek",
    description:
      "Masukkan URL GitHub, portofolio, deployment, atau dokumen PDF dari proyek yang pernah kamu kerjakan.",
  },
  {
    title: "Tentukan target role",
    description:
      "Pilih pekerjaan yang kamu tuju dan tambahkan deskripsi lowongan agar kebutuhan kompetensinya lebih jelas.",
  },
  {
    title: "Tambahkan CV bila diperlukan",
    description:
      "Unggah CV berformat PDF untuk melengkapi konteks pengalamanmu. Langkah ini bersifat opsional.",
  },
  {
    title: "Periksa kembali input",
    description:
      "Tinjau proyek, target role, dan CV. Gunakan tombol edit bila ada informasi yang perlu diperbaiki.",
  },
  {
    title: "Mulai analisis dan validasi",
    description:
      "Mulai proses analisis, lalu jawab pertanyaan validasi berdasarkan kontribusimu pada proyek.",
  },
  {
    title: "Pelajari hasil dan roadmap",
    description:
      "Baca hasil kompetensi, skill gap, dan roadmap belajar. Analisis sebelumnya dapat dibuka kembali dari Riwayat.",
  },
] as const;

const focusableSelector =
  'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function DashboardGuideDialog() {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const { isClosing, requestDismiss } = useAnimatedDismiss({
    onDismiss: () => setOpen(false),
  });

  useEffect(() => {
    if (!open) return;

    const triggerElement = triggerRef.current;
    const previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusFrame = window.requestAnimationFrame(() => {
      closeButtonRef.current?.focus();
    });

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        requestDismiss();
        return;
      }

      if (event.key !== "Tab") return;

      const focusableElements = Array.from(
        dialogRef.current?.querySelectorAll<HTMLElement>(focusableSelector) ??
          [],
      );

      if (focusableElements.length === 0) {
        event.preventDefault();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousBodyOverflow;
      triggerElement?.focus();
    };
  }, [open, requestDismiss]);

  return (
    <>
      <button
        ref={triggerRef}
        className="bkd-secondaryButton bkd-guideTrigger"
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(true)}
      >
        <WorkspaceIcon name="book" size={18} />
        Lihat panduan
      </button>

      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className={`bkd-guideBackdrop${
              isClosing ? " bkd-guideBackdrop--closing" : ""
            }`}
            role="presentation"
            onMouseDown={requestDismiss}
          >
            <section
              ref={dialogRef}
              className="bkd-guideDialog"
              role="dialog"
              aria-modal="true"
              aria-labelledby="bkd-guide-title"
              aria-describedby="bkd-guide-description"
              onMouseDown={(event) => event.stopPropagation()}
            >
              <header className="bkd-guideHeader">
                <div>
                  <span className="bkd-guideBadge">Panduan penggunaan</span>
                  <h2 id="bkd-guide-title">Mulai menggunakan BUKTIVA</h2>
                  <p id="bkd-guide-description">
                    Ikuti enam langkah berikut untuk menyiapkan analisis hingga
                    memahami rekomendasi pengembangan kariermu.
                  </p>
                </div>
                <button
                  ref={closeButtonRef}
                  className="bkd-guideClose"
                  type="button"
                  onClick={requestDismiss}
                  aria-label="Tutup panduan"
                >
                  <WorkspaceIcon name="close" size={22} />
                </button>
              </header>

              <ol className="bkd-guideSteps">
                {guideSteps.map((step, index) => (
                  <li key={step.title}>
                    <span className="bkd-guideNumber" aria-hidden="true">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <h3>{step.title}</h3>
                      <p>{step.description}</p>
                    </div>
                  </li>
                ))}
              </ol>

              <aside className="bkd-guideTip" aria-labelledby="bkd-guide-tip">
                <WorkspaceIcon name="target" size={24} />
                <div>
                  <h3 id="bkd-guide-tip">Sebelum memulai</h3>
                  <p>
                    Siapkan minimal satu bukti proyek dan target role. Jika
                    muncul kesalahan, periksa input yang ditandai atau kembali
                    ke langkah sebelumnya. CV dapat dilewati.
                  </p>
                </div>
              </aside>

              <footer className="bkd-guideActions">
                <button
                  className="bkd-guideDismiss"
                  type="button"
                  onClick={requestDismiss}
                >
                  Tutup panduan
                </button>
                <Link
                  className="bkd-guideStart"
                  href={analysisRoutes.uploadProject}
                >
                  Mulai analisa baru
                  
                </Link>
              </footer>
            </section>
          </div>,
          document.body,
        )}
    </>
  );
}
