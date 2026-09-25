type Status =
  | "new"
  | "scheduled"
  | "in-progress"
  | "waiting"
  | "completed"
  | "delayed";

const config: Record<Status, { label: string; style: React.CSSProperties }> = {
  new: {
    label: "New",
    style: { background: "var(--cc-status-new-bg)", color: "var(--cc-status-new-text)" },
  },
  scheduled: {
    label: "Scheduled",
    style: { background: "var(--cc-status-scheduled-bg)", color: "var(--cc-status-scheduled-text)" },
  },
  "in-progress": {
    label: "In Progress",
    style: { background: "var(--cc-status-in-progress-bg)", color: "var(--cc-status-in-progress-text)" },
  },
  waiting: {
    label: "Waiting",
    style: { background: "var(--cc-status-waiting-bg)", color: "var(--cc-status-waiting-text)" },
  },
  completed: {
    label: "Completed",
    style: { background: "var(--cc-status-completed-bg)", color: "var(--cc-status-completed-text)" },
  },
  delayed: {
    label: "Delayed",
    style: { background: "var(--cc-status-delayed-bg)", color: "var(--cc-status-delayed-text)" },
  },
};

export function StatusBadge({ status }: { status: Status }) {
  const item = config[status];
  return (
    <span
      data-status={status}
      style={item.style}
      className="inline-flex min-h-6 items-center rounded-full px-2.5 text-xs font-medium"
    >
      {item.label}
    </span>
  );
}
