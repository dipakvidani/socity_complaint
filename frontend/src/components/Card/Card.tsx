import { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  soft?: boolean;
}

export default function Card({ soft = true, className = "", children, ...rest }: CardProps) {
  return (
    <div className={`rounded-2xl p-pad border transition-all duration-200 ${soft ? "bg-card border-hairline/60 shadow-xs" : "border-hairline bg-canvas shadow-sm"} ${className}`} {...rest}>
      {children}
    </div>
  );
}

