import { SeverityBadge } from "./SeverityBadge";
import type { LiveEvent } from "../../types";

interface Props {
  event: LiveEvent;
}

// Maps event types to short readable labels
const eventTypeLabel: Record<string, string> = {
  TRANSACTION_PLACED: "Transaction Placed",
  TRANSACTION_COMPLETED: "Transaction Completed",
  TRANSACTION_FAILED: "Transaction Failed",
  PAYMENT_INITIATED: "Payment Initiated",
  PAYMENT_COMPLETED: "Payment Completed",
  ORDER_STATE_CHANGED: "Order State Changed",
  ANOMALY_FLAGGED: "Anomaly Flagged",
  FRAUD_DETECTED: "Fraud Detected",
};

// Maps source services to short display names
const sourceLabel: Record<string, string> = {
  "transaction-service": "TXN",
  "payment-service": "PAY",
  "order-service": "ORD",
  "fraud-service": "FRD",
  "risk-service": "RSK",
};

const formatTime = (timestamp: number): string => {
  return new Date(timestamp).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
};

const formatAmount = (payload: Record<string, unknown>): string => {
  const amount = payload["amount"];
  if (typeof amount === "number") {
    return `$${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  return "";
};

export const EventRow = ({ event }: Props) => {
  const amount = formatAmount(event.payload);
  const region = event.payload["region"] as string | undefined;

  return (
    <div className="flex items-center gap-3 px-4 py-2.5 border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
      {/* Timestamp */}
      <span className="text-xs text-gray-500 font-mono w-20 shrink-0">
        {formatTime(event.timestamp)}
      </span>

      {/* Source badge */}
      <span className="text-xs font-mono bg-gray-800 text-gray-400 px-1.5 py-0.5 rounded w-10 text-center shrink-0">
        {sourceLabel[event.source] ?? event.source}
      </span>

      {/* Event type */}
      <span className="text-sm text-gray-200 flex-1 min-w-0 truncate">
        {eventTypeLabel[event.type] ?? event.type}
      </span>

      {/* Amount if present */}
      {amount && (
        <span className="text-xs text-gray-400 font-mono shrink-0">
          {amount}
        </span>
      )}

      {/* Region if present */}
      {region && (
        <span className="text-xs text-gray-500 shrink-0">{region}</span>
      )}

      {/* Severity */}
      <div className="shrink-0">
        <SeverityBadge severity={event.severity} />
      </div>
    </div>
  );
};
