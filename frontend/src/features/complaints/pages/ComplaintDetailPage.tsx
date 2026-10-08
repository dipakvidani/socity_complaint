import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { AxiosError } from "axios";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Button from "../../../components/Button/Button";
import ConfirmDialog from "../../../components/ConfirmDialog/ConfirmDialog";
import { ForbiddenPage, NotFoundPage } from "../../../components/ErrorPages/ErrorPages";
import { PriorityBadge, StatusBadge } from "../../../components/StatusBadge/StatusBadge";
import { ErrorState, Loader } from "../../../components/States/States";
import { getErrorMessage } from "../../../config/api";
import { useAppSelector } from "../../../store/hooks";
import type { ComplaintDetail, Status } from "../../../types";
import { CATEGORIES, labelOf, STATUSES } from "../../../utils/constants";
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
  const canCancel = user.id === c.residentId && c.status === "open";

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
      <Link to="/" className="flex w-fit items-center gap-1 text-small font-semibold text-ink">
        <ArrowBackIcon fontSize="small" /> Back to complaints
      </Link>

      <article className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={c.status} />
          <PriorityBadge priority={c.priority} />
          <span className="rounded-full bg-card px-3 py-1 text-caption font-semibold text-mute">{labelOf(CATEGORIES, c.category)}</span>
        </div>
        <h1 className="text-page font-bold break-words text-ink">{c.title}</h1>
        <p className="text-caption text-mute">
          Raised by {c.residentName} (Flat {c.flatNumber}) on {formatDate(c.createdAt)}
        </p>
        <p className="text-body break-words whitespace-pre-wrap">{c.description}</p>
        {c.imageUrl && <img src={c.imageUrl} alt="Attached to the complaint" className="max-h-96 w-full rounded-md bg-card object-contain" loading="lazy" />}

        <div className="flex flex-wrap items-center gap-3">
          {canCancel && (
            <Button variant="secondary" onClick={() => setConfirm(true)}>
              Cancel complaint
            </Button>
          )}
          {user.role === "admin" && c.status !== "cancelled" && (
            <label className="flex items-center gap-2 text-small font-semibold text-ink">
              Status
              <select
                value={c.status}
                onChange={(e) => changeStatus(e.target.value as Exclude<Status, "cancelled">)}
                className="h-10 cursor-pointer rounded-md border border-ash bg-canvas px-3 text-small outline-none focus:ring-4 focus:ring-focus"
              >
                {STATUSES.filter((s) => s.value !== "cancelled").map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>
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
    </div>
  );
}
