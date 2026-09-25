import * as Sentry from "@sentry/node";

export interface ServerErrorMonitoringOptions {
  dsn?: string;
  environment: string;
  service: string;
  tracesSampleRate?: number;
}

export function initializeServerErrorMonitoring({
  dsn,
  environment,
  service,
  tracesSampleRate,
}: ServerErrorMonitoringOptions) {
  if (!dsn) {
    return { enabled: false } as const;
  }

  if (
    tracesSampleRate !== undefined &&
    (tracesSampleRate < 0 || tracesSampleRate > 1)
  ) {
    throw new Error("SENTRY_TRACES_SAMPLE_RATE must be between 0 and 1");
  }

  const options: Parameters<typeof Sentry.init>[0] = {
    dsn,
    environment,
    serverName: service,
    sendDefaultPii: false,
    beforeSend(event) {
      if (event.request?.headers) {
        delete event.request.headers.authorization;
        delete event.request.headers.Authorization;
        delete event.request.headers.cookie;
        delete event.request.headers.Cookie;
      }

      return event;
    },
  };

  if (tracesSampleRate !== undefined) {
    options.tracesSampleRate = tracesSampleRate;
  }

  Sentry.init(options);

  return { enabled: true } as const;
}
