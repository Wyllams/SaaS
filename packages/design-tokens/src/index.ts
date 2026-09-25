export const colors = {
  brand: {
    primary: "#2563EB",
    primaryHover: "#1D4ED8",
    primarySoft: "#DBEAFE",
    sidebar: "#0F172A",
    background: "#F8FAFC",
    surface: "#FFFFFF",
    border: "#E2E8F0",
    text: "#0F172A",
    textMuted: "#64748B",
  },
  status: {
    new: { background: "#F3F4F6", text: "#4B5563" },
    scheduled: { background: "#DBEAFE", text: "#1D4ED8" },
    inProgress: { background: "#DCFCE7", text: "#15803D" },
    waiting: { background: "#FEF3C7", text: "#B45309" },
    completed: { background: "#BBF7D0", text: "#166534" },
    delayed: { background: "#FEE2E2", text: "#B91C1C" },
  },
} as const;

export const spacing = {
  1: "4px",
  2: "8px",
  3: "12px",
  4: "16px",
  5: "20px",
  6: "24px",
  8: "32px",
  10: "40px",
  12: "48px",
  16: "64px",
} as const;

export const radii = {
  input: "8px",
  button: "8px",
  card: "12px",
  modal: "12px",
  pill: "9999px",
} as const;

export const typography = {
  fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
  display: { size: "32px", weight: 700 },
  pageTitle: { size: "28px", weight: 700 },
  sectionTitle: { size: "20px", weight: 600 },
  cardTitle: { size: "16px", weight: 600 },
  body: { size: "14px", weight: 400 },
  label: { size: "13px", weight: 500 },
  helper: { size: "12px", weight: 400 },
} as const;
