import Image from "next/image";
import { benefits, img } from "@/data/landing";

export default function About() {
  return (
    <section className="bk-section bk-about" id="tentang" aria-labelledby="about-title">
      <div className="bk-aboutTop">
        <div className="bk-aboutVisual">
          <Image
            src={img("tentang-illustration-crop.png")}
            alt="Ilustrasi analisis kompetensi, skill gap, dan roadmap pembelajaran"
            width={470}
            height={340}
          />
        </div>
        <div className="bk-aboutCopy">
          <p className="bk-pill">TENTANG BUKTIVA</p>
          <h2 id="about-title">Lebih dari Sekadar<br />Analisis Skill</h2>
          <p>
            Buktiva adalah platform berbasis AI yang membantu kamu menganalisis
            kompetensi dari proyek nyata, menemukan skill gap, dan mendapatkan
            roadmap pembelajaran yang sesuai dengan target kariermu.
          </p>
        </div>
      </div>
      <div className="bk-benefitGrid">
        {benefits.map((benefit) => (
          <article className="bk-benefitCard" key={benefit.title}>
            <div className="bk-benefitTitle">
              <Image src={img(benefit.image)} alt="" width={68} height={68} />
              <h3>{benefit.title}</h3>
            </div>
            <p>{benefit.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
