"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import AnalysisStepper from "./AnalysisStepper";
import TargetRoleIcon from "./TargetRoleIcon";
import { analysisRoutes, analysisStorage } from "@/data/analysis";
import {
  TARGET_ROLE_DESCRIPTION_LIMIT,
  TARGET_ROLE_STORAGE_KEY,
  targetRoleInformation,
  targetRoleOptions,
} from "@/data/target-role";
import type { TargetRoleDraft, TargetRoleId } from "@/types/target-role";

const DEFAULT_ROLE: TargetRoleId = "frontend";

function isTargetRoleId(value: unknown): value is TargetRoleId {
  return targetRoleOptions.some((option) => option.id === value);
}

function roleIdFromLabel(label: string | null): TargetRoleId | null {
  const option = targetRoleOptions.find((item) => item.label === label);
  return option?.id ?? null;
}

function readSavedDraft(): TargetRoleDraft {
  const sharedRole = sessionStorage.getItem(analysisStorage.targetRole);
  const sharedDescription = sessionStorage.getItem(analysisStorage.jobDescription) || "";

  try {
    const parsed: unknown = JSON.parse(
      sessionStorage.getItem(TARGET_ROLE_STORAGE_KEY) || "null",
    );

    if (parsed && typeof parsed === "object") {
      const candidate = parsed as Record<string, unknown>;
      if (isTargetRoleId(candidate.role)) {
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
    role: roleIdFromLabel(sharedRole) ?? DEFAULT_ROLE,
    jobDescription: sharedDescription.slice(0, TARGET_ROLE_DESCRIPTION_LIMIT),
  };
}

function writeSavedDraft(draft: TargetRoleDraft) {
  const option = targetRoleOptions.find((item) => item.id === draft.role);
  if (!option) throw new Error("Target role tidak valid.");

  sessionStorage.setItem(TARGET_ROLE_STORAGE_KEY, JSON.stringify(draft));
  sessionStorage.setItem(analysisStorage.targetRole, option.label);
  sessionStorage.setItem(analysisStorage.jobDescription, draft.jobDescription);
}

export default function TargetRolePage() {
  const router = useRouter();
  const [role, setRole] = useState<TargetRoleId>(DEFAULT_ROLE);
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

  function selectRole(nextRole: TargetRoleId) {
    setRole(nextRole);
    setMessage("");
    persistDraft({ role: nextRole, jobDescription });
  }

  function submitTargetRole(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (!isTargetRoleId(role)) {
      setMessage("Pilih target role terlebih dahulu.");
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
        <section className="bktr-fieldSection" aria-labelledby="bktr-role-heading">
          <div className="bktr-fieldHeading">
            <div>
              <h2 id="bktr-role-heading">Target Role</h2>
              <p>Pilih posisi pekerjaan yang ingin kamu tuju.</p>
            </div>
            <label className="bktr-selectField" htmlFor="bktr-role-select">
              <span>Pilihan role</span>
              <select
                id="bktr-role-select"
                value={role}
                onChange={(event) => selectRole(event.target.value as TargetRoleId)}
                required
              >
                {targetRoleOptions.map((option) => (
                  <option key={option.id} value={option.id}>{option.label}</option>
                ))}
              </select>
            </label>
          </div>

          <fieldset className="bktr-roleGrid">
            <legend className="bktr-srOnly">Pilih target role</legend>
            {targetRoleOptions.map((option) => {
              const selected = option.id === role;
              return (
                <label
                  className={`bktr-roleCard${selected ? " bktr-roleCard--selected" : ""}`}
                  key={option.id}
                >
                  <input
                    type="radio"
                    name="target-role"
                    value={option.id}
                    checked={selected}
                    onChange={() => selectRole(option.id)}
                  />
                  <span className="bktr-roleIcon"><TargetRoleIcon name={option.icon} /></span>
                  <span>{option.label}</span>
                </label>
              );
            })}
          </fieldset>
        </section>

        <section className="bktr-descriptionSection" aria-labelledby="bktr-description-heading">
          <div className="bktr-descriptionHeading">
            <div>
              <h2 id="bktr-description-heading">Deskripsi Pekerjaan <span>(Opsional)</span></h2>
              <label htmlFor="bktr-job-description">
                Masukkan deskripsi pekerjaan dari lowongan yang kamu pilih.
              </label>
            </div>
            <span aria-live="polite">{jobDescription.length}/{TARGET_ROLE_DESCRIPTION_LIMIT}</span>
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

        <aside className="bktr-information" aria-labelledby="bktr-information-title">
          <span className="bktr-informationIcon" aria-hidden="true">i</span>
          <div>
            <h2 id="bktr-information-title">{targetRoleInformation.title}</h2>
            <p>{targetRoleInformation.description}</p>
          </div>
        </aside>

        {message && <p className="bktr-message" role="alert">{message}</p>}

        <div className="bktr-actions">
          <Link className="bktr-button bktr-button--back" href={analysisRoutes.uploadProject}>
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
