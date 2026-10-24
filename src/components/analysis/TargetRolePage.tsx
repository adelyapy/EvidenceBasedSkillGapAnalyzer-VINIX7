"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import AnalysisStepper from "./AnalysisStepper";
import { analysisRoutes, analysisStorage } from "@/data/analysis";
import {
  TARGET_ROLE_DESCRIPTION_LIMIT,
  TARGET_ROLE_STORAGE_KEY,
  targetRoleInformation,
} from "@/data/target-role";
import type { TargetRoleDraft } from "@/types/target-role";

const DEFAULT_ROLE = "Frontend Developer";

function readSavedDraft(): TargetRoleDraft {
  const sharedRole = sessionStorage.getItem(analysisStorage.targetRole);
  const sharedDescription =
    sessionStorage.getItem(analysisStorage.jobDescription) || "";

  try {
    const parsed: unknown = JSON.parse(
      sessionStorage.getItem(TARGET_ROLE_STORAGE_KEY) || "null",
    );

    if (parsed && typeof parsed === "object") {
      const candidate = parsed as Record<string, unknown>;
      if (typeof candidate.role === "string" && candidate.role.trim()) {
        return {
          role: candidate.role,
          jobDescription:
            typeof candidate.jobDescription === "string"
              ? candidate.jobDescription.slice(0, TARGET_ROLE_DESCRIPTION_LIMIT)
              : sharedDescription.slice(0, TARGET_ROLE_DESCRIPTION_LIMIT),
        };
      }
    }
  } catch {
    // Fall back to the shared analysis keys when the UI cache is invalid.
  }

  return {
    role: sharedRole?.trim() || DEFAULT_ROLE,
    jobDescription: sharedDescription.slice(0, TARGET_ROLE_DESCRIPTION_LIMIT),
  };
}

function writeSavedDraft(draft: TargetRoleDraft) {
  const role = draft.role.trim();
  if (!role) throw new Error("Target role belum diisi.");

  sessionStorage.setItem(
    TARGET_ROLE_STORAGE_KEY,
    JSON.stringify({ ...draft, role }),
  );
  sessionStorage.setItem(analysisStorage.targetRole, role);
  sessionStorage.setItem(analysisStorage.jobDescription, draft.jobDescription);
}

export default function TargetRolePage() {
  const router = useRouter();
  const [role, setRole] = useState(DEFAULT_ROLE);
  const [jobDescription, setJobDescription] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [storageAvailable, setStorageAvailable] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      try {
        const saved = readSavedDraft();
        setRole(saved.role);
        setJobDescription(saved.jobDescription);
        writeSavedDraft(saved);
        setStorageAvailable(true);
      } catch {
        setStorageAvailable(false);
        setMessage(
          "Penyimpanan sesi browser tidak tersedia. Pilihan belum dapat diteruskan ke tahap Upload CV.",
        );
      } finally {
        setLoaded(true);
      }
    });

    return () => cancelAnimationFrame(frame);
  }, []);

  function persistDraft(draft: TargetRoleDraft) {
    try {
      writeSavedDraft(draft);
      setStorageAvailable(true);
    } catch {
      setStorageAvailable(false);
      setMessage(
        "Pilihan tidak dapat disimpan pada sesi browser. Tetap di halaman ini agar data tidak hilang.",
      );
    }
  }

  function selectRole(nextRole: string) {
    setRole(nextRole);
    setMessage("");
    persistDraft({ role: nextRole, jobDescription });
  }

  function submitTargetRole(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (!role.trim()) {
      setMessage("Masukkan target role terlebih dahulu.");
      return;
    }

    if (jobDescription.length > TARGET_ROLE_DESCRIPTION_LIMIT) {
      setMessage(
        `Deskripsi pekerjaan maksimal ${TARGET_ROLE_DESCRIPTION_LIMIT} karakter.`,
      );
      return;
    }

    try {
      writeSavedDraft({ role, jobDescription });
      router.push(analysisRoutes.uploadCv);
    } catch {
      setStorageAvailable(false);
      setMessage(
        "Pilihan tidak dapat disimpan pada sesi browser. Navigasi dihentikan agar data tidak hilang.",
      );
    }
  }

  return (
    <div className="bktr-page">
      <AnalysisStepper current="role" />

      <section className="bktr-hero" aria-labelledby="bktr-title">
        <div className="bktr-heroCopy">
          <h1 id="bktr-title">Tentukan Target Pekerjaan</h1>
          <p>Pilih role yang kamu incar agar hasil analisis lebih relevan.</p>
        </div>
        <Image
          className="bktr-heroImage"
          src="/images/analysis/target-role-vector.png"
          alt="Ilustrasi mahasiswa menunjuk target pekerjaan"
          width={578}
          height={432}
          priority
        />
      </section>

      <form className="bktr-form" onSubmit={submitTargetRole} noValidate>
        <section
          className="bktr-fieldSection"
          aria-labelledby="bktr-role-heading"
        >
          <div className="bktr-fieldHeading">
            <div>
              <h2 id="bktr-role-heading">Target Role</h2>
              <p>Pilih posisi pekerjaan yang ingin kamu tuju.</p>
            </div>
          </div>
          <label className="bktr-selectField" htmlFor="bktr-role-input">
            <span>Target role</span>
            <input
              id="bktr-role-input"
              type="text"
              value={role}
              placeholder="Contoh: Management Trainee"
              onChange={(event) => selectRole(event.target.value)}
              required
            />
          </label>
          <p className="bktr-roleHint">
            Masukkan posisi pekerjaan yang ingin kamu tuju.
          </p>
        </section>

        <section
          className="bktr-descriptionSection"
          aria-labelledby="bktr-description-heading"
        >
          <div className="bktr-descriptionHeading">
            <div>
              <h2 id="bktr-description-heading">
                Deskripsi Pekerjaan <span>(Opsional)</span>
              </h2>
              <label htmlFor="bktr-job-description">
                Masukkan deskripsi pekerjaan dari lowongan yang kamu pilih.
              </label>
            </div>
            <span aria-live="polite">
              {jobDescription.length}/{TARGET_ROLE_DESCRIPTION_LIMIT}
            </span>
          </div>
          <textarea
            id="bktr-job-description"
            name="job-description"
            rows={6}
            maxLength={TARGET_ROLE_DESCRIPTION_LIMIT}
            value={jobDescription}
            placeholder="Tuliskan deskripsi pekerjaan dari lowongan yang kamu pilih"
            onChange={(event) => {
              const nextDescription = event.target.value;
              setJobDescription(nextDescription);
              setMessage("");
              persistDraft({ role, jobDescription: nextDescription });
            }}
          />
        </section>

        <aside
          className="bktr-information"
          aria-labelledby="bktr-information-title"
        >
          <span className="bktr-informationIcon" aria-hidden="true">
            i
          </span>
          <div>
            <h2 id="bktr-information-title">{targetRoleInformation.title}</h2>
            <p>{targetRoleInformation.description}</p>
          </div>
        </aside>

        {message && (
          <p className="bktr-message" role="alert">
            {message}
          </p>
        )}

        <div className="bktr-actions">
          <Link
            className="bktr-button bktr-button--back"
            href={analysisRoutes.uploadProject}
          >
            <span aria-hidden="true">←</span> Kembali
          </Link>
          <button
            className="bktr-button bktr-button--next"
            type="submit"
            disabled={!loaded || !storageAvailable}
          >
            Lanjutkan <span aria-hidden="true">→</span>
          </button>
        </div>
      </form>
    </div>
  );
}
