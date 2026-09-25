export const designTokens = {
  color: {
    actionPrimary: "#2563EB",
    actionPrimaryHover: "#1D4ED8",
    page: "#F8FAFC",
    surfacePrimary: "#FFFFFF",
    surfaceSecondary: "#F1F5F9",
    borderDefault: "#E2E8F0",
    textPrimary: "#0F172A",
    textSecondary: "#475569",
    textMuted: "#64748B",
    textDisabled: "#94A3B8",
    navBackground: "#0F172A",
    navHover: "#1E293B",
  },
  radius: {
    control: "8px",
    surface: "12px",
  },
  spacing: [4, 8, 12, 16, 20, 24, 32, 40, 48, 64],
  breakpoint: {
    mobileMax: 639,
    tabletMax: 1023,
    desktopMax: 1439,
  },
} as const;
