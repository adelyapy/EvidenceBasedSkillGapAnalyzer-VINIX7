"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { analysisSteps, analysisStorage } from "@/data/analysis";
import type { AnalysisStepId } from "@/types/analysis";

export default function AnalysisStepper({ current }: { current: AnalysisStepId }) {
  const [lastAvailableIndex, setLastAvailableIndex] = useState(0);

  useEffect(() => {
    let hasProject = false;

    try {
      const projects: unknown = JSON.parse(
        sessionStorage.getItem(analysisStorage.projects) || "[]",
      );
      hasProject = Array.isArray(projects) && projects.length > 0;
    } catch {
      hasProject = false;
    }

    const progress = sessionStorage.getItem(analysisStorage.flowProgress);
    const savedRole = Boolean(
      sessionStorage.getItem(analysisStorage.targetRole)?.trim(),
    );
    const completedIndex = progress === "cv" ? 2 : progress === "role" ? 1 : progress === "project" || hasProject ? 0 : -1;

    setLastAvailableIndex(
      Math.min(analysisSteps.length - 1, Math.max(completedIndex + 1, hasProject && savedRole ? 2 : 0)),
    );
  }, []);

  return (
    <nav className="analysis-stepper" aria-label="Tahapan analisis">
      {analysisSteps.map((step, index) => {
        const active = step.id === current;
        const unlocked = index <= lastAvailableIndex;
        const completed = index < lastAvailableIndex;
        const content = (
          <>
            <span className={`analysis-step-number${active ? " analysis-step-number--active" : ""}${completed ? " analysis-step-number--complete" : ""}`}>{index + 1}</span>
            <span className="analysis-step-label">{step.label}</span>
            {!unlocked && <span className="analysis-step-lock">Terkunci</span>}
          </>
        );

        return (
          <div className="analysis-step-wrap" key={step.id}>
            {index > 0 && <span className="analysis-step-connector" aria-hidden="true" />}
            {step.href && unlocked ? (
              <Link className={`analysis-step${active ? " analysis-step--active" : ""}${completed ? " analysis-step--complete" : ""}`} href={step.href} aria-current={active ? "step" : undefined}>
                {content}
              </Link>
            ) : (
              <span className="analysis-step analysis-step--disabled" aria-disabled="true" title={`Selesaikan langkah sebelumnya untuk membuka ${step.label}`}>
                {content}
              </span>
            )}
          </div>
        );
      })}
    </nav>
  );
}
