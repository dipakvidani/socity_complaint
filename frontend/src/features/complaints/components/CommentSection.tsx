import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import SendIcon from "@mui/icons-material/Send";
import Button from "../../../components/Button/Button";
import { TextAreaField } from "../../../components/Field/Field";
import { getErrorMessage } from "../../../config/api";
import type { Comment } from "../../../types";
import { timeAgo } from "../../../utils/format";
import { commentSchema, CommentValues, filters, LIMITS } from "../../../utils/validation";
import { complaintService } from "../services/complaintService";

interface CommentSectionProps {
  complaintId: number;
  comments: Comment[];
  closed: boolean;
  onAdded: () => void;
}

export default function CommentSection({ complaintId, comments, closed, onAdded }: CommentSectionProps) {
  const [busy, setBusy] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CommentValues>({ resolver: zodResolver(commentSchema), defaultValues: { message: "" } });

  const submit = async ({ message }: CommentValues) => {
    setBusy(true);
    try {
      const res = await complaintService.addComment(complaintId, message);
      reset();
      toast.success(res.message);
      onAdded();
    } catch (error) {
      toast.error(getErrorMessage(error, "We could not add your comment. Please try again."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-title font-semibold text-ink">Comments ({comments.length})</h2>
      {comments.length === 0 ? (
        <p className="text-small text-mute">No comments yet. Start the conversation below.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {comments.map((c) => (
            <li key={c.id} className="rounded-md bg-card p-4">
              <div className="mb-1 flex flex-wrap items-center gap-2 text-caption text-mute">
                <span className="text-small font-bold text-ink">{c.authorName}</span>
                {c.authorRole === "admin" && <span className="rounded-full bg-primary px-2 py-0.5 text-caption font-bold text-on-primary">Admin</span>}
                <span>{timeAgo(c.createdAt)}</span>
              </div>
              <p className="text-small break-words whitespace-pre-wrap text-body">{c.message}</p>
            </li>
          ))}
        </ul>
      )}
      {closed ? (
        <p className="text-small text-mute">Comments are closed because this complaint was cancelled.</p>
      ) : (
        <form noValidate onSubmit={handleSubmit(submit)} className="flex flex-col gap-3">
          <TextAreaField aria-label="Write a comment" rows={3} placeholder="Write a comment" maxLength={LIMITS.comment} filter={filters.text} error={errors.message?.message} {...register("message")} />
          <Button type="submit" loading={busy} className="self-end">
            <SendIcon fontSize="small" /> Send comment
          </Button>
        </form>
      )}
    </section>
  );
}
