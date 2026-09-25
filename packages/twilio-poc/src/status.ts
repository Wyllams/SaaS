export type SmsStatus =
  | "accepted"
  | "scheduled"
  | "queued"
  | "sending"
  | "sent"
  | "delivered"
  | "undelivered"
  | "failed"
  | "canceled"
  | "read";

const rank: Record<SmsStatus, number> = {
  accepted: 0,
  scheduled: 0,
  queued: 1,
  sending: 2,
  sent: 3,
  delivered: 4,
  undelivered: 4,
  failed: 4,
  canceled: 4,
  read: 5,
};

const terminal = new Set<SmsStatus>([
  "delivered",
  "undelivered",
  "failed",
  "canceled",
  "read",
]);

export type StatusCallback = {
  MessageSid: string;
  MessageStatus: SmsStatus;
  ErrorCode?: string;
  RawDlrDoneDate?: string;
};

export function reconcileStatus(
  current: SmsStatus | null,
  incoming: StatusCallback,
):
  | { action: "APPLY"; nextStatus: SmsStatus }
  | { action: "IGNORE_REGRESSION"; nextStatus: SmsStatus }
  | { action: "REFETCH_CONFLICT"; nextStatus: SmsStatus } {
  if (!current) return { action: "APPLY", nextStatus: incoming.MessageStatus };

  const currentRank = rank[current];
  const incomingRank = rank[incoming.MessageStatus];

  if (incomingRank < currentRank) {
    return { action: "IGNORE_REGRESSION", nextStatus: current };
  }

  if (
    incomingRank === currentRank &&
    current !== incoming.MessageStatus &&
    terminal.has(current) &&
    terminal.has(incoming.MessageStatus)
  ) {
    return { action: "REFETCH_CONFLICT", nextStatus: current };
  }

  return { action: "APPLY", nextStatus: incoming.MessageStatus };
}
