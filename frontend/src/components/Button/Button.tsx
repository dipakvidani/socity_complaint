import { ButtonHTMLAttributes } from "react";
import CircularProgress from "@mui/material/CircularProgress";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "icon";
type Size = "sm" | "md";

const variants: Record<Variant, string> = {
  primary: "bg-primary text-on-primary hover:brightness-105 active:bg-primary-pressed shadow-xs",
  secondary: "bg-secondary text-ink hover:bg-secondary-pressed active:bg-secondary-pressed border border-hairline/60",
  ghost: "bg-transparent text-ink hover:bg-secondary/70 active:bg-secondary",
  danger: "bg-error/10 text-error hover:bg-error/20 active:bg-error/30 border border-error/25",
  icon: "bg-card text-ink hover:bg-secondary active:bg-secondary-pressed rounded-full !h-10 !w-10 !p-0 border border-hairline/50",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3.5 text-caption font-bold rounded-full",
  md: "h-11 px-5 text-small font-bold rounded-full",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

export default function Button({
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  className = "",
  children,
  type = "button",
  ...rest
}: ButtonProps) {
  const off = disabled || loading;
  const sizeClass = variant === "icon" ? "" : sizes[size];
  return (
    <button
      type={type}
      disabled={off}
      className={`inline-flex cursor-pointer items-center justify-center gap-2 outline-none transition-all focus-visible:ring-4 focus-visible:ring-focus disabled:cursor-not-allowed disabled:opacity-50 ${sizeClass} ${variants[variant]} ${className}`}
      {...rest}
    >
      {loading && <CircularProgress size={size === "sm" ? 14 : 16} color="inherit" />}
      {children}
    </button>
  );
}


