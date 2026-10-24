import Link from "next/link";
import WorkspaceIcon from "@/components/workspace/WorkspaceIcon";
import type { WorkspaceIconName } from "@/types/workspace";

type DashboardEmptyStateProps = {
  icon: WorkspaceIconName;
  title: string;
  description: string;
  actionLabel: string;
  actionHref: string;
};

export default function DashboardEmptyState({
  icon,
  title,
  description,
  actionLabel,
  actionHref,
}: DashboardEmptyStateProps) {
  return (
    <div className="bkd-emptyState">
      <span className="bkd-emptyStateIcon" aria-hidden="true">
        <WorkspaceIcon name={icon} size={27} />
      </span>
      <h3>{title}</h3>
      <p>{description}</p>
      <Link className="bkd-emptyStateAction" href={actionHref}>
        <WorkspaceIcon name="plus" size={19} />
        {actionLabel}
      </Link>
    </div>
  );
}
