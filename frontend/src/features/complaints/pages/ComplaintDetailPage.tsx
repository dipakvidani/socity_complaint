import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Dialog from "@mui/material/Dialog";
import toast from "../../../utils/toast";
import { AxiosError } from "axios";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import CloseIcon from "@mui/icons-material/Close";
import Button from "../../../components/Button/Button";
import ConfirmDialog from "../../../components/ConfirmDialog/ConfirmDialog";
import { ForbiddenPage, NotFoundPage } from "../../../components/ErrorPages/ErrorPages";
import { PriorityBadge, StatusBadge } from "../../../components/StatusBadge/StatusBadge";
import { ErrorState, Loader } from "../../../components/States/States";
import { getErrorMessage } from "../../../config/api";
import { useAppSelector } from "../../../store/hooks";
import type { ComplaintDetail, Status } from "../../../types";
import { CATEGORIES, getCategoryPlaceholder, getComplaintBannerSrc, labelOf, STATUSES } from "../../../utils/constants";
import { formatDate } from "../../../utils/format";
import CommentSection from "../components/CommentSection";
import { useComplaintSockets } from "../hooks/useComplaintSockets";
import { complaintService } from "../services/complaintService";

interface DetailState {
  data: ComplaintDetail | null;
  loading: boolean;
  error: string | null;
  code: number | null;
}

export default function ComplaintDetailPage() {
  const { id = "" } = useParams();
  const user = useAppSelector((s) => s.auth.user);
  const [state, setState] = useState<DetailState>({ data: null, loading: true, error: null, code: null });
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  const load = useCallback(
    async (silent = false) => {
      if (!silent) setState((s) => ({ ...s, loading: true, error: null, code: null }));
      try {
        const res = await complaintService.detail(id);
        setState({ data: res.data, loading: false, error: null, code: null });
      } catch (error) {
        const code = (error as AxiosError).response?.status ?? null;
        setState({ data: null, loading: false, error: getErrorMessage(error, "We could not load this complaint."), code });
      }
    },
    [id]
  );

  useEffect(() => {
    load();
  }, [load]);

  useComplaintSockets((_event, payload) => {
    if (String(payload.id ?? payload.complaintId) === id) load(true);
  });

  if (state.loading) return <Loader label="Loading complaint..." />;
  if (state.code === 404) return <NotFoundPage />;
  if (state.code === 403) return <ForbiddenPage />;
  if (state.error || !state.data || !user) return <ErrorState message={state.error ?? undefined} onRetry={() => load()} />;

  const c = state.data;
  const canCancel = user.id === c.residentId && c.status !== "cancelled";
  const isUploadedPhoto = Boolean(c.imageUrl);
  const bannerSrc = getComplaintBannerSrc(c.imageUrl, c.category);
  const defaultPlaceholder = getCategoryPlaceholder(c.category);

  const cancel = async () => {
    setBusy(true);
    try {
      const res = await complaintService.cancel(c.id);
      toast.success(res.message);
      setConfirm(false);
      load(true);
    } catch (error) {
      toast.error(getErrorMessage(error, "We could not cancel this complaint."));
    } finally {
      setBusy(false);
    }
  };

  const changeStatus = async (status: Exclude<Status, "cancelled">) => {
    try {
      const res = await complaintService.changeStatus(c.id, status);
      toast.success(res.message);
      load(true);
    } catch (error) {
      toast.error(getErrorMessage(error, "We could not update the status."));
    }
  };

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <Link to="/" className="flex w-fit items-center gap-1.5 text-small font-semibold text-ink hover:text-indigo-600 transition-colors">
        <ArrowBackIcon className="!text-[18px]" /> Back to complaints
      </Link>

      <article className="flex flex-col gap-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-canvas p-6 shadow-sm">
        {/* Header Badges */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-4">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={c.status} />
            <PriorityBadge priority={c.priority} />
          </div>
          <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-caption font-semibold text-mute border border-slate-200/60 dark:border-slate-700/60">
            {labelOf(CATEGORIES, c.category)}
          </span>
        </div>

        {/* Complaint Title & Author */}
        <div className="flex flex-col gap-1.5">
          <h1 className="text-heading font-bold break-words text-ink leading-tight">{c.title}</h1>
          <p className="text-caption text-mute">
            Raised by <strong className="font-semibold text-ink">{c.residentName}</strong> (Flat {c.flatNumber}) on {formatDate(c.createdAt)}
          </p>
        </div>

        {/* Category Illustration or Uploaded Photo Banner */}
        <div
          onClick={() => setPreviewOpen(true)}
          className="relative h-64 sm:h-80 w-full overflow-hidden rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-slate-900/5 dark:bg-slate-950/40 cursor-pointer group"
        >
          <img
            src={bannerSrc}
            alt={c.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            onError={(e) => {
              const target = e.currentTarget;
              target.onerror = null;
              target.src = defaultPlaceholder;
            }}
          />
          <div className="absolute top-3 right-3 flex items-center gap-1.5 rounded-full bg-slate-900/75 backdrop-blur-md px-3 py-1.5 text-caption font-medium text-white shadow-lg">
            <ImageOutlinedIcon className="!text-[16px]" />
            <span>{isUploadedPhoto ? "Attached Photo (Click to Enlarge)" : labelOf(CATEGORIES, c.category)}</span>
          </div>
        </div>

        {/* Complaint Description */}
        <div className="bg-slate-50/50 dark:bg-slate-900/30 p-4 rounded-xl border border-slate-100 dark:border-slate-800/60">
          <h3 className="text-caption font-semibold text-mute uppercase tracking-wider mb-1">Details</h3>
          <p className="text-body break-words whitespace-pre-wrap text-ink leading-relaxed">{c.description}</p>
        </div>

        {/* Actions Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          {canCancel && (
            <Button variant="secondary" onClick={() => setConfirm(true)}>
              Cancel complaint
            </Button>
          )}

          {user.role === "admin" && c.status !== "cancelled" && (
            <div className="flex items-center gap-2.5 text-small font-semibold text-ink">
              <span>Status</span>
              <Select
                size="small"
                value={c.status}
                onChange={(e) => changeStatus(e.target.value as Exclude<Status, "cancelled">)}
                sx={{
                  height: 40,
                  borderRadius: "12px",
                  fontSize: "14px",
                  fontWeight: 600,
                  backgroundColor: "var(--color-canvas)",
                  color: "var(--color-ink)",
                  "& .MuiOutlinedInput-notchedOutline": { borderColor: "var(--color-hairline)" },
                  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "var(--color-ink)" },
                }}
                MenuProps={{
                  slotProps: {
                    paper: {
                      sx: {
                        borderRadius: "12px",
                        backgroundColor: "var(--color-canvas)",
                        color: "var(--color-ink)",
                        "& .MuiMenuItem-root": { fontSize: "14px", padding: "10px 16px" },
                      },
                    },
                  },
                }}
              >
                {STATUSES.filter((s) => s.value !== "cancelled").map((s) => (
                  <MenuItem key={s.value} value={s.value}>
                    {s.label}
                  </MenuItem>
                ))}
              </Select>
            </div>
          )}
        </div>
      </article>

      <CommentSection complaintId={c.id} comments={c.comments} closed={c.status === "cancelled"} onAdded={() => load(true)} />

      <ConfirmDialog
        open={confirm}
        title="Cancel this complaint?"
        message="The society office will stop working on it. You cannot reopen it later."
        confirmLabel="Yes, cancel it"
        loading={busy}
        onConfirm={cancel}
        onClose={() => setConfirm(false)}
      />

      {/* Image / Category Banner Lightbox Dialog */}
      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        maxWidth="md"
        className="backdrop-blur-sm"
        slotProps={{
          paper: {
            sx: {
              overflow: "hidden",
              borderRadius: "24px",
              maxHeight: "85vh",
              backgroundImage: "none",
              m: 2,
            },
          },
        }}
      >
        <div className="flex flex-col gap-3 bg-canvas p-4 sm:p-6 rounded-2xl max-w-2xl overflow-hidden max-h-[85vh]">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 shrink-0">
            <div>
              <h3 className="text-heading font-semibold text-ink">{isUploadedPhoto ? "Attached Photo" : `${labelOf(CATEGORIES, c.category)} Illustration`}</h3>
              <p className="text-caption text-mute truncate max-w-xs">{c.title}</p>
            </div>
            <button
              type="button"
              onClick={() => setPreviewOpen(false)}
              className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:text-ink hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <CloseIcon className="!text-[18px]" />
            </button>
          </div>

          <div className="flex-1 min-h-0 flex items-center justify-center bg-slate-900/5 dark:bg-slate-950 rounded-xl overflow-hidden p-2">
            <img
              src={bannerSrc}
              alt={c.title}
              className="max-h-[65vh] sm:max-h-[70vh] max-w-full w-auto object-contain rounded-lg shrink-0"
              onError={(e) => {
                const target = e.currentTarget;
                target.onerror = null;
                target.src = defaultPlaceholder;
              }}
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
}
