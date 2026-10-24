import type { ReactNode } from "react";

export default function NewAnalysisTemplate({
  children,
}: {
  children: ReactNode;
}) {
  return <div className="analysis-routeTransition">{children}</div>;
}
