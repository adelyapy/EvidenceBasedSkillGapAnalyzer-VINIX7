import Image from "next/image";
import { contents, styles } from "@/data/auth";
import type { AuthMode } from "@/types/auth";

type AuthIntroProps = { mode: AuthMode };

export default function AuthIntro({ mode }: AuthIntroProps) {
  const data = contents[mode];
  const isReset = mode === "reset";
  const isRegister = mode === "register";

  return (
    <section className={styles.left} aria-labelledby={`${mode}-headline`}>
      <h1 id={`${mode}-headline`} className={styles.headline}>{data.heading}</h1>
      {isReset ? (
        <p className={styles.intro}>Tidak masalah! Masukkan alamat email Anda dan kami akan mengirimkan tautan untuk mengatur ulang kata sandi Anda.</p>
      ) : (
        <>
          {isRegister && <p className={styles.intro}>Buat akun dan mulai perjalanan kariermu bersama proyek-proyek nyata.</p>}
          <ul className={styles.benefits}>
            {data.benefits.map((benefit) => (
              <li key={benefit}>
                <span className={styles.tick} aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none"><path d="m4.2 12.5 5.1 5.1 10.5-11" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </span>
                {benefit}
              </li>
            ))}
          </ul>
        </>
      )}
      <div className={styles.illustration}>
        <Image src={data.illustration} alt={data.imageAlt} width={mode === "login" ? 1580 : mode === "register" ? 1604 : 1448} height={mode === "login" ? 995 : mode === "register" ? 980 : 1086} priority sizes="(max-width: 700px) 75vw, 360px" />
      </div>
    </section>
  );
}
