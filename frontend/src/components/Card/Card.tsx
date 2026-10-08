import { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  soft?: boolean;
}

export default function Card({ soft = true, className = "", children, ...rest }: CardProps) {
  return (
    <div className={`rounded-md p-pad ${soft ? "bg-card" : "border border-hairline bg-canvas"} ${className}`} {...rest}>
      {children}
    </div>
  );
}
