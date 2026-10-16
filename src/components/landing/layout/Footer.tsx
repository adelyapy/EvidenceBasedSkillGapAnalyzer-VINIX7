import Image from "next/image";
import { img, navigation } from "@/data/landing";
import Brand from "./Brand";

export default function Footer() {
  return (
    <footer className="bk-footer">
      <div className="bk-footerInner">
        <div className="bk-footerBrand">
          <Brand />
          <p>
            BUKTIVA membantu mahasiswa dan freshgraduate memahami kompetensi,
            skill gap, dan roadmap karier berdasarkan proyek nyata.
          </p>
        </div>
        <div className="bk-footerGroup">
          <h2>Navigasi</h2>
          {navigation.map((item) => (
            <a key={item.id} href={`#${item.id}`}>{item.label}</a>
          ))}
        </div>
        <div className="bk-footerGroup">
          <h2>Kontak &amp; Informasi</h2>
          <a href="mailto:halo@buktiva.id">Bantuan: halo@buktiva.id</a>
          <span>Kebijakan Privasi</span>
          <span>BUKTIVA — VINIX7 Aurum</span>
        </div>
        <div className="bk-footerArt">
          <Image src={img("footer-illustration.png")} alt="Terima kasih telah menjadi bagian dari perjalanan ini" width={320} height={170} />
        </div>
      </div>
      <p className="bk-copyright">© 2026 BUKTIVA. VINIX7 Aurum.</p>
    </footer>
  );
}
