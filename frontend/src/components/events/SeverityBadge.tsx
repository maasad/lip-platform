import type { EventSeverity } from "../../types";

interface Props {
  severity: EventSeverity;
}

const severityConfig = {
  LOW: {
    bg: "bg-green-900/40",
    text: "text-green-400",
    border: "border-green-800",
    dot: "bg-green-400",
  },
  MEDIUM: {
    bg: "bg-yellow-900/40",
    text: "text-yellow-400",
    border: "border-yellow-800",
    dot: "bg-yellow-400",
  },
  HIGH: {
    bg: "bg-orange-900/40",
    text: "text-orange-400",
    border: "border-orange-800",
    dot: "bg-orange-400",
  },
  CRITICAL: {
    bg: "bg-red-900/40",
    text: "text-red-400",
    border: "border-red-800",
    dot: "bg-red-500",
  },
};

export const SeverityBadge = ({ severity }: Props) => {
  const config = severityConfig[severity];

  return (
    <span
      className={`
                inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium
                border ${config.bg} ${config.text} ${config.border}
      `}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {severity}
    </span>
  );
};
