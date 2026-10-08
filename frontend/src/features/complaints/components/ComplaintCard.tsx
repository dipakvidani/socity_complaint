import { ReactNode } from "react";
import { Link } from "react-router-dom";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import TruncatedText from "../../../components/TruncatedText/TruncatedText";
import { PriorityBadge, StatusBadge } from "../../../components/StatusBadge/StatusBadge";
import type { Complaint } from "../../../types";
import { CATEGORIES, getCategoryPlaceholder, getComplaintBannerSrc, labelOf } from "../../../utils/constants";
import { timeAgo } from "../../../utils/format";

interface ComplaintCardProps {
  complaint: Complaint;
  admin?: boolean;
  actions?: ReactNode;
}

export default function ComplaintCard({ complaint, admin = false, actions }: ComplaintCardProps) {
  const isUploadedPhoto = Boolean(complaint.imageUrl);
  const bannerSrc = getComplaintBannerSrc(complaint.imageUrl, complaint.category);
  const defaultPlaceholder = getCategoryPlaceholder(complaint.category);

  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-canvas p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-xl">
      <div className="flex flex-col gap-3.5">
        {/* Badges & Category Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-3">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={complaint.status} />
            <PriorityBadge priority={complaint.priority} />
          </div>
          <span className="inline-flex items-center rounded-full bg-slate-100 dark:bg-slate-800/80 px-2.5 py-0.5 text-caption font-semibold text-mute border border-slate-200/60 dark:border-slate-700/60">
            {labelOf(CATEGORIES, complaint.category)}
          </span>
        </div>

        {/* Category / Uploaded Photo Banner */}
        <div className="relative h-44 w-full overflow-hidden rounded-xl border border-slate-200/60 dark:border-slate-800/60 bg-slate-900/5 dark:bg-slate-950/40">
          <img
            src={bannerSrc}
            alt={complaint.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            onError={(e) => {
              const target = e.currentTarget;
              target.onerror = null;
              target.src = defaultPlaceholder;
            }}
          />
          {isUploadedPhoto && (
            <div className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-slate-900/70 backdrop-blur-md px-2.5 py-1 text-[11px] font-medium text-white shadow-md">
              <ImageOutlinedIcon className="!text-[13px]" />
              <span>Photo</span>
            </div>
          )}
        </div>

        {/* Title & Description */}
        <div className="flex flex-col gap-1.5">
          <Link
            to={`/complaints/${complaint.id}`}
            className="group/title flex items-start justify-between gap-2 text-title font-bold text-ink transition-colors hover:text-indigo-600 dark:hover:text-indigo-400"
          >
            <span className="line-clamp-2 leading-snug">
              <TruncatedText text={complaint.title} />
            </span>
            <ArrowForwardIcon
              className="mt-1 shrink-0 opacity-0 -translate-x-1 transition-all duration-200 group-hover/title:opacity-100 group-hover/title:translate-x-0 text-indigo-600 dark:text-indigo-400 !text-[18px]"
            />
          </Link>
          <p className="text-small text-mute line-clamp-2 leading-relaxed">
            {complaint.description}
          </p>
        </div>
      </div>

      {/* Card Footer */}
      <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-caption text-mute">
        <div className="flex flex-wrap items-center gap-2.5">
          {admin && (
            <div className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300 bg-slate-100/80 dark:bg-slate-800/60 px-2 py-0.5 rounded-lg border border-slate-200/50 dark:border-slate-700/50">
              <PersonOutlinedIcon className="!text-[14px] text-mute" />
              <span className="truncate max-w-[120px]">{complaint.residentName}</span>
              <span className="text-slate-400 dark:text-slate-600">•</span>
              <HomeOutlinedIcon className="!text-[14px] text-mute" />
              <span>{complaint.flatNumber}</span>
            </div>
          )}
          <div className="flex items-center gap-1 text-mute">
            <AccessTimeOutlinedIcon className="!text-[14px]" />
            <span>{timeAgo(complaint.createdAt)}</span>
          </div>
        </div>

        {actions && <div className="shrink-0">{actions}</div>}
      </div>
    </div>
  );
}
