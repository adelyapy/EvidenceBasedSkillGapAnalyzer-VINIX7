import { dashboardRoadmap } from "@/data/dashboard";

export default function LearningRoadmap() {
  return (
    <section className="bkd-panel bkd-roadmap" aria-labelledby="judul-roadmap">
      <div className="bkd-panelHeading"><h2 id="judul-roadmap">Roadmap Belajar</h2></div>
      <ol>{dashboardRoadmap.map((step, index) => <li key={step.label}><span>{index + 1}</span><p>{step.label}</p></li>)}</ol>
    </section>
  );
}
