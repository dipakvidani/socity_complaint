import { CSSProperties } from "react";
import Tooltip from "@mui/material/Tooltip";

interface TruncatedTextProps {
  text: string;
  lines?: number;
  className?: string;
}

export default function TruncatedText({ text, lines = 1, className = "" }: TruncatedTextProps) {
  const clamp: CSSProperties | undefined =
    lines > 1 ? { display: "-webkit-box", WebkitLineClamp: lines, WebkitBoxOrient: "vertical", overflow: "hidden" } : undefined;
  return (
    <Tooltip title={text} arrow enterTouchDelay={0}>
      <span className={`${lines > 1 ? "" : "block truncate"} break-words ${className}`} style={clamp}>
        {text}
      </span>
    </Tooltip>
  );
}
