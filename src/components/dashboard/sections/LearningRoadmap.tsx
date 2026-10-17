"use client";

import { useEffect, useState } from "react";
import { dashboardRoadmap } from "@/data/dashboard";
import { isSavedRoadmap, ROADMAP_STORAGE_KEY, roadmapSteps } from "@/data/roadmap";
import type { SavedRoadmap } from "@/types/roadmap";

export default function LearningRoadmap() {
  const [savedRoadmap, setSavedRoadmap] = useState<SavedRoadmap | null>(null);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      try {
        const parsed: unknown = JSON.parse(sessionStorage.getItem(ROADMAP_STORAGE_KEY) || "null");
        setSavedRoadmap(isSavedRoadmap(parsed) ? parsed : null);
      } catch {
        setSavedRoadmap(null);
      }
    });

    return () => cancelAnimationFrame(frame);
  }, []);

  const steps = savedRoadmap
    ? savedRoadmap.stepIds.flatMap((id) => {
        const step = roadmapSteps.find((item) => item.id === id);
        return step ? [{ label: step.title }] : [];
      })
    : dashboardRoadmap;

  return (
    <section className="bkd-panel bkd-roadmap" aria-labelledby="judul-roadmap">
      <div className="bkd-panelHeading"><h2 id="judul-roadmap">Roadmap Belajar</h2></div>
      {savedRoadmap && (
        <p className="bkd-roadmapMeta">
          Contoh {savedRoadmap.careerLabel} tersimpan sementara untuk sesi browser ini.
        </p>
      )}
      <ol>{steps.map((step, index) => <li key={step.label}><span>{index + 1}</span><p>{step.label}</p></li>)}</ol>
    </section>
  );
}
