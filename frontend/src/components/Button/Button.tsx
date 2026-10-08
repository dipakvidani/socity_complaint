import { ButtonHTMLAttributes } from "react";
import CircularProgress from "@mui/material/CircularProgress";

type Variant = "primary" | "secondary" | "ghost" | "icon";

const variants: Record<Variant, string> = {
  primary: "bg-primary text-on-primary active:bg-primary-pressed",
  secondary: "bg-secondary text-ink active:bg-secondary-pressed",
  ghost: "bg-transparent text-ink active:bg-secondary",
  icon: "bg-card text-ink active:bg-secondary rounded-full !h-10 !w-10 !p-0",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  loading?: boolean;
}

export default function Button({ variant = "primary", loading = false, disabled = false, className = "", children, type = "button", ...rest }: ButtonProps) {
  const off = disabled || loading;
  return (
    <button
      type={type}
      disabled={off}
      className={`inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-md px-3.5 text-small font-bold outline-none transition-colors focus-visible:ring-4 focus-visible:ring-focus disabled:cursor-not-allowed disabled:bg-card disabled:text-ash ${variants[variant]} ${className}`}
      {...rest}
    >
      {loading && <CircularProgress size={16} color="inherit" />}
      {children}
    </button>
  );
}
