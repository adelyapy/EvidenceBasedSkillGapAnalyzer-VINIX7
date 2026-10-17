import type { AnalysisResultIconName } from "@/types/analysis-result";

export default function AnalysisResultIcon({
  name,
  size = 22,
}: {
  name: AnalysisResultIconName;
  size?: number;
}) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.9,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true as const,
  };

  switch (name) {
    case "download":
      return <svg {...common}><path d="M12 3v12m0 0 4-4m-4 4-4-4M5 17v3h14v-3" /></svg>;
    case "portfolio":
      return <svg {...common}><rect x="5" y="3" width="14" height="18" rx="2" /><circle cx="12" cy="9" r="2.5" /><path d="M8 17c.7-2 2-3 4-3s3.3 1 4 3" /></svg>;
    case "commerce":
      return <svg {...common}><path d="M7 7h11l-1 7H8L6 3H3" /><circle cx="9" cy="19" r="1.5" /><circle cx="16" cy="19" r="1.5" /></svg>;
    case "dashboard":
      return <svg {...common}><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M7 16v-3M12 16V9M17 16v-5" /></svg>;
    case "consistency":
      return <svg {...common}><circle cx="12" cy="12" r="9" /><path d="m8 12 2.5 2.5L16.5 8" /></svg>;
    case "growth":
      return <svg {...common}><circle cx="12" cy="12" r="9" /><path d="m8 13 4-4 4 4M12 9v7" /></svg>;
    case "practice":
      return <svg {...common}><circle cx="12" cy="12" r="9" /><path d="M8.5 8.5c2 0 2 3 3.5 3s1.5-3 3.5-3c1.4 0 2.5 1.6 2.5 3.5s-1.1 3.5-2.5 3.5c-2 0-2-3-3.5-3s-1.5 3-3.5 3C7.1 15.5 6 13.9 6 12s1.1-3.5 2.5-3.5Z" /></svg>;
  }
}
