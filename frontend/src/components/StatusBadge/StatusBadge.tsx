import { ReactNode } from "react";
import type { Priority, Status } from "../../types";
import { labelOf, PRIORITIES, STATUSES } from "../../utils/constants";

const statusStyle: Record<Status, string> = {
  open: "bg-info-bg text-info-ink border border-info-ink/20",
  in_progress: "bg-warn-bg text-warn-ink border border-warn-ink/20",
  resolved: "bg-success-bg text-success-ink border border-success-ink/20",
  cancelled: "bg-secondary text-mute border border-hairline/60",
};

const priorityStyle: Record<Priority, string> = {
  low: "bg-secondary text-mute border border-hairline/60",
  medium: "bg-warn-bg text-warn-ink border border-warn-ink/20",
  high: "bg-primary text-on-primary font-black shadow-xs",
};

const Pill = ({ className, children }: { className: string; children: ReactNode }) => (
  <span className={`inline-flex items-center rounded-full px-3 py-1 text-caption font-bold ${className}`}>{children}</span>
);

export const StatusBadge = ({ status }: { status: Status }) => <Pill className={statusStyle[status]}>{labelOf(STATUSES, status)}</Pill>;
export const PriorityBadge = ({ priority }: { priority: Priority }) => <Pill className={priorityStyle[priority]}>{labelOf(PRIORITIES, priority)}</Pill>;

