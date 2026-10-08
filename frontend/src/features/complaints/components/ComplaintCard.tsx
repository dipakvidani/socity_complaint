import { ReactNode } from "react";
import { Link } from "react-router-dom";
import Card from "../../../components/Card/Card";
import TruncatedText from "../../../components/TruncatedText/TruncatedText";
import { PriorityBadge, StatusBadge } from "../../../components/StatusBadge/StatusBadge";
import type { Complaint } from "../../../types";
import { CATEGORIES, labelOf } from "../../../utils/constants";
import { timeAgo } from "../../../utils/format";

interface ComplaintCardProps {
  complaint: Complaint;
  admin?: boolean;
  actions?: ReactNode;
}

export default function ComplaintCard({ complaint, admin = false, actions }: ComplaintCardProps) {
  return (
    <Card className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge status={complaint.status} />
        <PriorityBadge priority={complaint.priority} />
        <span className="rounded-full bg-canvas px-3 py-1 text-caption font-semibold text-mute">{labelOf(CATEGORIES, complaint.category)}</span>
      </div>
      <Link to={`/complaints/${complaint.id}`} className="min-w-0 text-title font-semibold text-ink">
        <TruncatedText text={complaint.title} />
      </Link>
      <div className="text-small text-mute">
        <TruncatedText text={complaint.description} lines={2} />
      </div>
      <div className="mt-auto flex flex-wrap items-center justify-between gap-2 text-caption text-mute">
        <span className="min-w-0 max-w-full">
          {admin ? `${complaint.residentName} · Flat ${complaint.flatNumber} · ` : null}
          {timeAgo(complaint.createdAt)}
        </span>
        {actions}
      </div>
    </Card>
  );
}
