import { ReactNode } from "react";
import type { Priority, Status } from "../../types";
import { labelOf, PRIORITIES, STATUSES } from "../../utils/constants";

const statusStyle: Record<Status, string> = {
  open: "bg-info-bg text-info-ink",
  in_progress: "bg-warn-bg text-warn-ink",
  resolved: "bg-success-bg text-success-ink",
  cancelled: "bg-secondary text-mute",
};

const priorityStyle: Record<Priority, string> = {
  low: "bg-secondary text-mute",
  medium: "bg-warn-bg text-warn-ink",
  high: "bg-primary text-on-primary",
};

const Pill = ({ className, children }: { className: string; children: ReactNode }) => (
  <span className={`inline-flex items-center rounded-full px-3 py-1 text-caption font-bold ${className}`}>{children}</span>
);

export const StatusBadge = ({ status }: { status: Status }) => <Pill className={statusStyle[status]}>{labelOf(STATUSES, status)}</Pill>;
export const PriorityBadge = ({ priority }: { priority: Priority }) => <Pill className={priorityStyle[priority]}>{labelOf(PRIORITIES, priority)}</Pill>;
