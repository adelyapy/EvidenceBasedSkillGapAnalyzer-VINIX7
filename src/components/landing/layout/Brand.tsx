import Image from "next/image";
import { img } from "@/data/landing";

export default function Brand() {
  return (
    <a className="bk-brand" href="#beranda" aria-label="BUKTIVA, ke beranda">
      <Image src={img("logo-icon.svg")} alt="" width={40} height={40} />
      <span>BUKTIVA</span>
    </a>
  );
}
