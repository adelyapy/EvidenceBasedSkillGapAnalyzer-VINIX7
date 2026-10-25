import type { AnalysisHistoryEntry } from "@/types/history";
import type { HistoryStatusIconName } from "./historyStatus";

type IconName = AnalysisHistoryEntry["icon"] | HistoryStatusIconName | "analysis" | "average" | "role" | "search" | "filter" | "sort" | "calendar" | "close" | "history" | "plus";

export default function HistoryIcon({ name, size = 24 }: { name: IconName; size?: number }) {
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

  switch (name) {
    case "analysis": return <svg {...common}><path d="M4 19V9m6 10V5m6 14v-7m4 7H2" /></svg>;
    case "average": return <svg {...common}><circle cx="12" cy="12" r="9" /><path d="M8 15 16 9M9 9h.01M15 15h.01" /></svg>;
    case "role": return <svg {...common}><circle cx="12" cy="7" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></svg>;
    case "search": return <svg {...common}><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 5 5" /></svg>;
    case "history": return <svg {...common}><path d="M4 11a8 8 0 1 1 1.6 5M4 5v6h6" /><path d="M12 7v5l3 2" /></svg>;
    case "plus": return <svg {...common}><path d="M12 4v16M4 12h16" /></svg>;
    case "filter": return <svg {...common}><path d="M3 5h18l-7 8v6l-4 2v-8L3 5Z" /></svg>;
    case "sort": return <svg {...common}><path d="M7 4v16m0 0-3-3m3 3 3-3M17 20V4m0 0-3 3m3-3 3 3" /></svg>;
    case "calendar": return <svg {...common}><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M8 3v4m8-4v4M3 10h18" /></svg>;
    case "check": return <svg {...common}><circle cx="12" cy="12" r="9" /><path d="m8 12 3 3 5-6" /></svg>;
    case "draft": return <svg {...common}><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" /></svg>;
    case "error": return <svg {...common}><circle cx="12" cy="12" r="9" /><path d="m9 9 6 6m0-6-6 6" /></svg>;
    case "processing": return <svg {...common}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>;
    case "help": return <svg {...common}><circle cx="12" cy="12" r="9" /><path d="M9.5 9a2.7 2.7 0 1 1 4.2 2.25c-1.2.75-1.7 1.2-1.7 2.25M12 17h.01" /></svg>;
    case "close": return <svg {...common}><path d="m5 5 14 14M19 5 5 19" /></svg>;
    case "portfolio": return <svg {...common}><rect x="3" y="5" width="18" height="15" rx="2" /><path d="M8 5V3h8v2M3 11h18M10 11v2h4v-2" /></svg>;
    case "commerce": return <svg {...common}><path d="M3 4h2l2 11h10l3-8H6" /><circle cx="9" cy="19" r="1.5" /><circle cx="17" cy="19" r="1.5" /></svg>;
    case "analytics": return <svg {...common}><path d="M4 20V10m5 10V5m5 15v-7m5 7V8" /></svg>;
    case "mobile": return <svg {...common}><rect x="7" y="2" width="10" height="20" rx="2" /><path d="M10 5h4m-3 14h2" /></svg>;
  }
}
