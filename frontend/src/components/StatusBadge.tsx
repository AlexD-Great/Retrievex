import type { RetrievalStatus } from "@retrievex/shared";

interface StatusBadgeProps {
  status: RetrievalStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return <span className={`status status-${status}`}>{status}</span>;
}
