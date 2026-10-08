import Dialog from "@mui/material/Dialog";
import Button from "../Button/Button";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export default function ConfirmDialog({ open, title, message, confirmLabel = "Yes, continue", loading, onConfirm, onClose }: ConfirmDialogProps) {
  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} fullWidth maxWidth="xs">
      <div className="flex flex-col gap-3 bg-canvas p-6">
        <h2 className="text-heading font-semibold text-ink">{title}</h2>
        <p className="text-small text-mute">{message}</p>
        <div className="mt-2 flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Not now
          </Button>
          <Button onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
