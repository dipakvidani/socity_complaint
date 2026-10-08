import Tooltip from "@mui/material/Tooltip";

interface TruncatedTextProps {
  text: string;
  lines?: number;
  className?: string;
}

export default function TruncatedText({ text, lines = 1, className = "" }: TruncatedTextProps) {
  const lineClampClass =
    lines > 1
      ? lines === 2
        ? "line-clamp-2"
        : lines === 3
        ? "line-clamp-3"
        : lines === 4
        ? "line-clamp-4"
        : "line-clamp-none"
      : "truncate block";

  return (
    <Tooltip title={text} arrow enterTouchDelay={0}>
      <span className={`${lineClampClass} break-words ${className}`}>
        {text}
      </span>
    </Tooltip>
  );
}

