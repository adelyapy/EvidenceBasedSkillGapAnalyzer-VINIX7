import Link from "next/link";
import { analysisSteps } from "@/data/analysis";
import type { AnalysisStepId } from "@/types/analysis";

export default function AnalysisStepper({ current }: { current: AnalysisStepId }) {
  return (
    <nav className="analysis-stepper" aria-label="Tahapan analisis">
      {analysisSteps.map((step, index) => {
        const active = step.id === current;
        const content = (
          <>
            <span className={`analysis-step-number${active ? " analysis-step-number--active" : ""}`}>{index + 1}</span>
            <span className="analysis-step-label">{step.label}</span>
          </>
        );

        return (
          <div className="analysis-step-wrap" key={step.id}>
            {index > 0 && <span className="analysis-step-connector" aria-hidden="true" />}
            {step.href ? (
              <Link className={`analysis-step${active ? " analysis-step--active" : ""}`} href={step.href} aria-current={active ? "step" : undefined}>
                {content}
              </Link>
            ) : (
              <span className="analysis-step analysis-step--disabled" aria-disabled="true" title={`${step.label} belum tersedia di Next.js`}>
                {content}
              </span>
            )}
          </div>
        );
      })}
    </nav>
  );
}
