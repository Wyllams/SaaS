export function resolveSentryExternalConfig(env = process.env) {
  const rawDsn = String(env.SENTRY_DSN ?? "").trim();

  if (!rawDsn) {
    return {
      enabled: false,
      reason: "missing_sentry_dsn",
    };
  }

  let url;
  try {
    url = new URL(rawDsn);
  } catch {
    throw new Error("SENTRY_DSN must be a valid URL");
  }

  if (url.protocol !== "https:") {
    throw new Error("SENTRY_DSN must use HTTPS");
  }

  return {
    enabled: true,
    environment: String(env.SENTRY_ENVIRONMENT ?? "poc").trim() || "poc",
    dsnHost: url.host,
    dsn: "[REDACTED]",
  };
}
