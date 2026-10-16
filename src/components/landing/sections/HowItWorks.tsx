import Image from "next/image";
import { img, steps } from "@/data/landing";

export default function HowItWorks() {
  return (
    <section className="bk-section bk-howItWorks" id="cara-kerja" aria-labelledby="how-title">
      <div className="bk-sectionCenterTitle">
        <p className="bk-pill">CARA KERJA BUKTIVA</p>
        <h2 id="how-title">Langkah Mudah Menuju Karier Impian</h2>
        <p>
          Mulai dari proyek nyata sampai rekomendasi belajar yang disesuaikan
          dengan target kariermu.
        </p>
      </div>
      <ol className="bk-stepGrid">
        {steps.map((step, i) => (
          <li className="bk-stepCard" key={step.title}>
            <span className="bk-stepNumber">0{i + 1}</span>
            <div className="bk-stepIllustration">
              <Image src={img(step.image)} alt="" width={250} height={170} />
            </div>
            <h3>{step.title}</h3>
            <p>{step.description}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
