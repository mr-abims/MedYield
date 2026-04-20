import type { BountyStatus } from "@/lib/types";

interface StatusBadgeProps {
  status: BountyStatus;
  fillPct?: number;
}

export function StatusBadge({ status, fillPct = 0 }: StatusBadgeProps) {
  let label: string = status;
  let classes = "bg-status-completed-bg text-status-completed-fg";

  if (status === "OPEN" && fillPct >= 80) {
    label = "FILLING FAST";
    classes = "bg-status-filling-bg text-status-filling-fg";
  } else if (status === "OPEN") {
    classes = "bg-status-open-bg text-status-open-fg";
  } else if (status === "COMPUTING") {
    classes = "bg-status-computing-bg text-status-computing-fg";
  } else if (status === "COMPLETED") {
    classes = "bg-status-completed-bg text-status-completed-fg";
  } else if (status === "EXPIRED") {
    classes = "bg-status-error-bg text-status-error-fg";
  }

  return (
    <span
      className={`px-2.5 py-[3px] rounded-pill text-[10px] font-bold tracking-[0.08em] ${classes}`}
    >
      {label}
    </span>
  );
}
