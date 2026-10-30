import type { RoadmapStep } from "@/types/roadmap";

type Props = {
  number: number;
  step: RoadmapStep;
};

export default function RoadmapStepCard({ number, step }: Props) {
  const materialHelpId = `bkrm-material-${step.id}`;

  return (
    <li className="bkrm-stepItem">
      <article className="bkrm-stepCard" aria-labelledby={`bkrm-step-${step.id}`}>
        <span className="bkrm-stepNumber" aria-hidden="true">{number}</span>
        <div className="bkrm-stepBody">
          <h3 id={`bkrm-step-${step.id}`}>{step.title}</h3>
          <p className="bkrm-duration">({step.duration})</p>
          <ul className="bkrm-checklist">
            {step.checklist.map((item) => (
              <li key={item}><span aria-hidden="true">✓</span>{item}</li>
            ))}
          </ul>
          <button type="button" className="bkrm-materialButton" disabled aria-describedby={materialHelpId}>
            Lihat Materi 
          </button>
          <p className="bkrm-materialHelp" id={materialHelpId}>Materi belum tersedia.</p>
        </div>
      </article>
    </li>
  );
}
