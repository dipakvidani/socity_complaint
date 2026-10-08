import { ReactNode } from "react";
import CircularProgress from "@mui/material/CircularProgress";
import InboxOutlinedIcon from "@mui/icons-material/InboxOutlined";
import ErrorOutlinedIcon from "@mui/icons-material/ErrorOutlined";
import Button from "../Button/Button";

interface LoaderProps {
  label?: string;
  full?: boolean;
}

export function Loader({ label = "Loading, please wait...", full = false }: LoaderProps) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 py-10 text-mute ${full ? "min-h-screen" : ""}`} role="status">
      <CircularProgress color="primary" />
      <p className="text-small">{label}</p>
    </div>
  );
}

interface EmptyStateProps {
  title: string;
  message?: string;
  action?: ReactNode;
}

export function EmptyState({ title, message, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-md bg-card px-pad py-10 text-center">
      <InboxOutlinedIcon sx={{ fontSize: 48 }} className="text-ash" />
      <h3 className="text-title font-semibold text-ink">{title}</h3>
      {message && <p className="max-w-md text-small text-mute">{message}</p>}
      {action}
    </div>
  );
}

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ message = "We could not load this right now.", onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-md bg-card px-pad py-10 text-center" role="alert">
      <ErrorOutlinedIcon sx={{ fontSize: 48 }} className="text-error" />
      <h3 className="text-title font-semibold text-ink">Something went wrong</h3>
      <p className="max-w-md text-small text-mute">{message}</p>
      {onRetry && <Button onClick={onRetry}>Try again</Button>}
    </div>
  );
}
