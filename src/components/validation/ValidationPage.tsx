"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

import { questions, type QuestionNumber } from "./questions";


const STORAGE_KEY = "buktiva.validation.answers";

function readAnswers(): Record<string, string> {
  try {
    const saved = sessionStorage.getItem(STORAGE_KEY);

    if (!saved) return {};

    const parsed = JSON.parse(saved);

    if (
      parsed &&
      typeof parsed === "object" &&
      !Array.isArray(parsed)
    ) {
      return parsed;
    }

    return {};
  } catch {
    return {};
  }
}

type IconName =
  | "home"
  | "chart"
  | "history"
  | "user"
  | "logout"
  | "bell";

function Icon({ name }: { name: IconName }) {
  const icons = {
    home: (
      <>
        <path d="m3 10 9-7 9 7v10H3z" />
        <path d="M9 20v-7h6v7" />
      </>
    ),
    chart: (
      <>
        <rect x="3" y="14" width="4" height="7" rx="1" />
        <rect x="10" y="9" width="4" height="12" rx="1" />
        <rect x="17" y="3" width="4" height="18" rx="1" />
      </>
    ),
    history: (
      <>
        <path d="M3 11a9 9 0 1 1 2.5 6.2" />
        <path d="M3 4v7h7" />
        <path d="M12 7v5l4 2" />
      </>
    ),
    user: (
      <>
        <circle cx="12" cy="7" r="4" />
        <path d="M4 21v-2a8 8 0 0 1 16 0v2z" />
      </>
    ),
    logout: (
      <>
        <path d="M10 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h5" />
        <path d="m14 7 5 5-5 5" />
        <path d="M8 12h11" />
      </>
    ),
    bell: (
      <>
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
        <path d="M10 21h4" />
      </>
    ),
  };

  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {icons[name]}
    </svg>
  );
}

const navigation: {
  label: string;
  href: string;
  icon: IconName;
}[] = [
  { label: "Dashboard", href: "/", icon: "home" },
  {
    label: "Analisa Baru",
    href: "/analisa-baru.html",
    icon: "chart",
  },
  {
    label: "Riwayat Analisis",
    href: "/riwayat-analis-dummy.html",
    icon: "history",
  },
  {
    label: "Profile",
    href: "/index_profile.html",
    icon: "user",
  },
];

export default function ValidationPage({
  step,
}: {
  step: QuestionNumber;
}) {
  const router = useRouter();

  const [answer, setAnswer] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");
  const [collapsed, setCollapsed] = useState(false);

  const currentQuestion = questions[step];
  const progress = (step / 5) * 100;

  useEffect(() => {
    const stored = readAnswers();

    setAnswer(stored[String(step)] || "");
    setLoaded(true);
  }, [step]);

  function handleAnswerChange(value: string) {
    setAnswer(value);
    setError("");

    const previous = readAnswers();

    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        ...previous,
        [step]: value,
      })
    );
  }

  function handleNext(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!answer.trim()) {
      setError("Silakan isi jawaban sebelum melanjutkan.");
      return;
    }

    const previous = readAnswers();

    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        ...previous,
        [step]: answer,
      })
    );

    if (step < 5) {
      router.push(`/pertanyaan-${step + 1}`);
    } else {
      sessionStorage.setItem(
        "buktiva.validation.completed",
        "true"
      );

      router.push("/hasil-analisis");
    }
  }

  return (
    <div
      className={`validation-shell ${
        collapsed ? "validation-shell--collapsed" : ""
      }`}
    >
      {/* SIDEBAR */}
      <aside className="validation-sidebar">
        <div className="validation-brand">
          <Link href="/" className="validation-logo">
            <Image
              src="/images/logo-icon.svg"
              alt="Logo BUKTIVA"
              width={36}
              height={40}
            />
            <strong>BUKTIVA</strong>
          </Link>

          <button
            type="button"
            className="validation-collapse"
            onClick={() => setCollapsed(!collapsed)}
            aria-label="Perkecil atau perbesar sidebar"
          >
            {collapsed ? "»" : "«"}
          </button>
        </div>

        <nav
          className="validation-navigation"
          aria-label="Navigasi utama"
        >
          {navigation.map((item) => (
            <Link
              href={item.href}
              key={item.label}
              className={`validation-nav-item ${
                item.label === "Analisa Baru" ? "active" : ""
              }`}
              title={item.label}
            >
              <Icon name={item.icon} />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="validation-logout">
          <Link href="/login" className="validation-nav-item">
            <Icon name="logout" />
            <span>Keluar</span>
          </Link>
        </div>
      </aside>

      {/* HALAMAN UTAMA */}
      <div className="validation-main">
        {/* HEADER */}
        <header className="validation-header">
          <div className="validation-header-actions">
            <button
              type="button"
              className="validation-notification"
              aria-label="Notifikasi"
            >
              <Icon name="bell" />
            </button>

            <details className="validation-profile">
                <summary>
                    {/* FOTO PROFIL DI SINI */}
                    <Image
                    src="/assets/images/adelya-putri-yunita.png"
                    alt="Foto profil Adelya"
                    width={34}
                    height={34}
                    className="validation-avatar"
                    />

                    <span className="validation-profile-name">
                    <strong>Adelya</strong>
                    <small>Mahasiswa</small>
                    </span>

                    <span>⌄</span>
                </summary>
            </details>
          </div>
        </header>

        {/* KONTEN PERTANYAAN */}
        <main className="validation-content">
          <div className="validation-intro">
            <h1>Pertanyaan Validasi</h1>
            <p>
              Jawab beberapa pertanyaan berikut untuk memastikan
              pemahamanmu terhadap proyek benar-benar sesuai.
            </p>
          </div>

          {/* PROGRESS */}
          <div className="validation-progress-section">
            <div className="validation-progress-label">
              Pertanyaan {step} dari 5
            </div>

            <div
              className="validation-progress-track"
              role="progressbar"
              aria-label="Progres pertanyaan"
              aria-valuenow={step}
              aria-valuemin={0}
              aria-valuemax={5}
            >
              <div
                className="validation-progress-fill"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="validation-workspace">
            {/* FORM JAWABAN */}
            <form
              className="validation-form"
              onSubmit={handleNext}
            >
              <div className="validation-question-card">
                <label
                  htmlFor="validation-answer"
                  className="validation-question-text"
                >
                  {currentQuestion.question}
                </label>

                <div className="validation-textarea-wrap">
                  <textarea
                    id="validation-answer"
                    name={`jawaban-${step}`}
                    placeholder="Tulis jawaban Anda di sini..."
                    value={answer}
                    maxLength={1000}
                    required
                    disabled={!loaded}
                    onChange={(event) =>
                      handleAnswerChange(event.target.value)
                    }
                    aria-describedby="validation-counter"
                  />

                  <span
                    id="validation-counter"
                    className="validation-character-count"
                  >
                    {answer.length}/1000
                  </span>
                </div>
              </div>

              {error && (
                <p className="validation-error" role="alert">
                  {error}
                </p>
              )}

              <div className="validation-buttons">
                {step > 1 && (
                  <Link
                    href={`/pertanyaan-${step - 1}`}
                    className="validation-back"
                  >
                    ← Kembali
                  </Link>
                )}

                <button
                  type="submit"
                  disabled={!loaded}
                  className="validation-next"
                >
                  {step === 5 ? "Selesai" : "Selanjutnya"}
                  <span aria-hidden="true">→</span>
                </button>
              </div>
            </form>

            {/* TIPS */}
            <aside className="validation-tips">
              <h2>
                <span className="validation-tips-icon">!</span>
                Tips Menjawab
              </h2>

              <ul>
                {currentQuestion.tips.map((tip, index) => (
                  <li key={index}>{tip}</li>
                ))}
              </ul>
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
}