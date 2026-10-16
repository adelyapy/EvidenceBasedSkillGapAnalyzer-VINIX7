import Image from "next/image";
import { img, members } from "@/data/landing";

export default function Team() {
  return (
    <section className="bk-section bk-team" id="team-kami" aria-labelledby="team-title">
      <div className="bk-teamIntro">
        <div className="bk-teamVisual">
          <Image
            src={img("team-illustration.png")}
            alt="Ilustrasi anggota tim BUKTIVA bekerja sama"
            width={490}
            height={280}
          />
        </div>
        <div className="bk-teamCopy">
          <p className="bk-pill">TEAM KAMI</p>
          <h2 id="team-title">Bersama Mewujudkan Karier<br />yang Lebih Terarah</h2>
          <p>
            Kami adalah tim yang memiliki semangat yang sama untuk membantu
            mahasiswa dan fresh graduate menemukan potensi diri melalui
            teknologi dan analisis data.
          </p>
        </div>
      </div>
      <div className="bk-teamGrid">
        {members.map((member) => (
          <article className="bk-memberCard" key={member.name}>
            <div className="bk-portrait">
              <Image src={img(member.image)} alt={`Potret ${member.name}`} width={140} height={140} />
            </div>
            <h3>{member.name}</h3>
            <p className="bk-role">{member.role}</p>
            <p className="bk-memberDescription">{member.description}</p>
            <div className="bk-socialLinks">
              <a href={member.linkedin} target="_blank" rel="noopener noreferrer" aria-label={`LinkedIn ${member.name}`}>in</a>
              <a href={member.github} target="_blank" rel="noopener noreferrer" aria-label={`GitHub ${member.name}`}>
                <svg aria-hidden="true" width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 .8a11.2 11.2 0 0 0-3.54 21.82c.56.1.76-.24.76-.54V20c-3.1.67-3.75-1.31-3.75-1.31-.5-1.28-1.23-1.62-1.23-1.62-1.01-.69.08-.68.08-.68 1.12.08 1.72 1.15 1.72 1.15 1 .1 1.64-.76 1.64-.76.09-.73.39-1.23.71-1.51-2.47-.28-5.08-1.24-5.08-5.53 0-1.22.44-2.22 1.16-3.01-.12-.28-.5-1.42.11-2.96 0 0 .95-.3 3.08 1.15A10.7 10.7 0 0 1 12 6.35c.95 0 1.9.13 2.79.37 2.13-1.45 3.07-1.15 3.07-1.15.62 1.54.24 2.68.12 2.96.73.79 1.15 1.79 1.15 3.01 0 4.31-2.62 5.25-5.11 5.53.4.35.75 1.04.75 2.11v2.9c0 .31.2.66.77.54A11.2 11.2 0 0 0 12 .8Z" />
                </svg>
              </a>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
