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
  }
}
