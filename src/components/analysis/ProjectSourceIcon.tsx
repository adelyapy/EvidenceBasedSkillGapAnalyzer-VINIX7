import type { UploadProjectSource } from "@/types/upload-project";

/** Ikon sumber bukti yang dipakai konsisten pada upload dan hasil analisis. */
export default function ProjectSourceIcon({
  source,
  size = 24,
}: {
  source: UploadProjectSource;
  size?: number;
}) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true as const,
  };

  switch (source) {
    case "github":
      return <svg {...common}><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3.3-.4 6.8-1.6 6.8-7A5.4 5.4 0 0 0 19.4 4 5 5 0 0 0 19.3.5S18.2.1 15.5 1.8a12.2 12.2 0 0 0-7 0C5.8.1 4.7.5 4.7.5A5 5 0 0 0 4.6 4a5.4 5.4 0 0 0-1.4 3.7c0 5.4 3.5 6.6 6.8 7A4.8 4.8 0 0 0 9 18v4" /><path d="M9 19c-3 .9-3-1.5-4-2" /></svg>;
    case "portfolio":
      return <svg {...common}><path d="M10 13a5 5 0 0 0 7.1 0l2-2a5 5 0 0 0-7.1-7.1l-1.1 1.1" /><path d="M14 11a5 5 0 0 0-7.1 0l-2 2A5 5 0 0 0 12 20.1l1.1-1.1" /></svg>;
    case "deployment":
      return <svg {...common}><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" /></svg>;
    case "linkedin":
      return <svg {...common}><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M8 10v6M8 7v.01M12 16v-3.5a2.5 2.5 0 0 1 5 0V16M12 12v4" /></svg>;
    case "pdf":
      return <svg {...common}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6M8 15h8M8 18h6" /></svg>;
  }
}
