import Link from "next/link";
import { navigation } from "@/data/landing";
import Brand from "./Brand";

export default function Navbar() {
  return (
    <header className="bk-header">
      <nav className="bk-navbar" aria-label="Navigasi utama">
        <Brand />
        <div className="bk-navLinks">
          {navigation.map((item, index) => (
            <a
              key={item.id}
              className={index === 0 ? "bk-activeNav" : "bk-navLink"}
              href={`#${item.id}`}
            >
              {item.label}
            </a>
          ))}
        </div>
        <div className="bk-navActions">
          <Link className="bk-loginButton" href="/login">MASUK</Link>
          <Link className="bk-registerButton" href="/register">DAFTAR</Link>
        </div>
      </nav>
    </header>
  );
}
