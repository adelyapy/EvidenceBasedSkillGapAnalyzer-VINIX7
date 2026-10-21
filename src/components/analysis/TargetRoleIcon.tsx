import type { TargetRoleIconName } from "@/types/target-role";

export default function TargetRoleIcon({
  name,
  size = 30,
}: {
  name: TargetRoleIconName;
  size?: number;
}) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true as const,
  };

  switch (name) {
    case "code":
      return <svg {...common}><path d="m8 9-3 3 3 3M16 9l3 3-3 3M14 5l-4 14" /></svg>;
    case "server":
      return <svg {...common}><rect x="4" y="4" width="16" height="6" rx="1.5" /><rect x="4" y="14" width="16" height="6" rx="1.5" /><path d="M8 7h.01M8 17h.01M12 7h5M12 17h5" /></svg>;
    case "mobile":
      return <svg {...common}><rect x="7" y="2" width="10" height="20" rx="2" /><path d="M10 5h4M11 18h2" /></svg>;
    case "chart":
      return <svg {...common}><path d="M4 19V9M10 19V5M16 19v-7M22 19V3M2 19h20" /></svg>;
    case "design":
      return <svg {...common}><path d="m12 3 3 3-8.5 8.5L3 15l.5-3.5zM14 5l2-2 3 3-2 2M13 15l3 6 2-4 4-2-6-3z" /></svg>;
    case "cloud":
      return <svg {...common}><path d="M7 18h10a4 4 0 0 0 .7-7.9A6 6 0 0 0 6.2 8.8 4.6 4.6 0 0 0 7 18Z" /><path d="m9.5 13 2.5-2.5 2.5 2.5M12 10.5V16" /></svg>;
    case "briefcase":
      return <svg {...common}><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18M10 12v2h4v-2" /></svg>;
    case "megaphone":
      return <svg {...common}><path d="m4 14 11-4v8L4 14Z" /><path d="M15 12h2a3 3 0 0 0 0-6M6 15l1.5 4H10l-1-4" /></svg>;
    case "calculator":
      return <svg {...common}><rect x="5" y="2" width="14" height="20" rx="2" /><path d="M8 6h8M8 11h.01M12 11h.01M16 11h.01M8 15h.01M12 15h.01M16 15h.01M8 19h.01M12 19h.01M16 19h.01" /></svg>;
    case "people":
      return <svg {...common}><circle cx="9" cy="8" r="3" /><path d="M3 21v-2a6 6 0 0 1 12 0v2M16 5a3 3 0 0 1 0 6M21 21v-2a6 6 0 0 0-3-5.2" /></svg>;
    case "palette":
      return <svg {...common}><path d="M12 3a9 9 0 1 0 0 18h1.1a1.9 1.9 0 0 0 .6-3.7 1.9 1.9 0 0 1 1.3-3.6H18A3 3 0 0 0 21 11c0-4.4-4-8-9-8Z" /><path d="M7.5 10h.01M9 6.5h.01M14 6.5h.01M17 10h.01" /></svg>;
    case "flask":
      return <svg {...common}><path d="M9 3h6M10 3v6l-5 8a3 3 0 0 0 2.6 4h8.8a3 3 0 0 0 2.6-4l-5-8V3M8 15h8" /></svg>;
    case "heart":
      return <svg {...common}><path d="M20.8 8.6c0 5-8.8 10.4-8.8 10.4S3.2 13.6 3.2 8.6A4.6 4.6 0 0 1 12 6.7a4.6 4.6 0 0 1 8.8 1.9Z" /></svg>;
    case "book":
      return <svg {...common}><path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v18H6.5A2.5 2.5 0 0 0 4 22.5v-18ZM4 20h16" /></svg>;
    case "scale":
      return <svg {...common}><path d="M12 3v18M5 21h14M4 7h16M6 7l-3 6h6L6 7ZM18 7l-3 6h6l-3-6Z" /></svg>;
  }
}
