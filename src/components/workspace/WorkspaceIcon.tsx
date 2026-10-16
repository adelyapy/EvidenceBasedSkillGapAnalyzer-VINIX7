import type { WorkspaceIconName } from "@/types/workspace";

export default function WorkspaceIcon({ name, size = 22 }: { name: WorkspaceIconName; size?: number }) {
  const common = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2.2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true as const };
  switch (name) {
    case "dashboard": return <svg {...common}><path d="m3 10 9-7 9 7" /><path d="M5 9v11h14V9M10 20v-6h4v6" /></svg>;
    case "analysis": return <svg {...common}><rect x="3" y="14" width="3" height="6" rx="1" fill="currentColor" /><rect x="10" y="10" width="3" height="10" rx="1" fill="currentColor" /><rect x="17" y="4" width="3" height="16" rx="1" fill="currentColor" /></svg>;
    case "history": return <svg {...common}><path d="M4 11a8 8 0 1 1 1.6 5M4 5v6h6" /><path d="M12 7v5l3 2" /></svg>;
    case "profile": return <svg {...common}><circle cx="12" cy="7" r="4" /><path d="M4 21v-2a8 8 0 0 1 16 0v2H4Z" /></svg>;
    case "logout": return <svg {...common}><path d="M10 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h5M14 7l5 5-5 5M19 12H9" /></svg>;
    case "chevron": return <svg {...common}><path d="m7 10 5 5 5-5" /></svg>;
    case "menu": return <svg {...common}><path d="M3 6h18M3 12h18M3 18h18" /></svg>;
    case "close": return <svg {...common}><path d="M5 5l14 14M19 5 5 19" /></svg>;
    case "book": return <svg {...common}><path d="M12 20c-3-2-6-2-9-1V5c3-1 6-1 9 1 3-2 6-2 9-1v14c-3-1-6-1-9 1ZM12 6v14" /></svg>;
    case "plus": return <svg {...common}><path d="M12 4v16M4 12h16" /></svg>;
    case "target": return <svg {...common}><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1" /></svg>;
  }
}
