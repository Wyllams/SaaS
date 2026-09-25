import * as Sentry from "@sentry/node";

const dsn = String(process.env.SENTRY_DSN ?? "").trim();

if (!dsn) {
  throw new Error("SENTRY_DSN GitHub Actions secret is missing");
}

Sentry.init({
  dsn,
  environment: "poc-12",
  tracesSampleRate: 1.0,
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
});

let eventId;

await Sentry.startSpan(
  {
    name: "poc-12.external-ingestion",
    op: "poc.external",
    attributes: {
      "poc.number": 12,
      "poc.provider": "sentry",
      "poc.synthetic": true,
    },
  },
  async () => {
    eventId = Sentry.captureException(
      new Error("POC-12 controlled Sentry ingestion test"),
      {
        tags: {
          poc: "12",
          synthetic: "true",
        },
        extra: {
          purpose: "external-ingestion-validation",
        },
      },
    );

    await new Promise((resolve) => setTimeout(resolve, 100));
  },
);

const flushed = await Sentry.flush(10_000);

if (!flushed) {
  throw new Error("Sentry flush timed out");
}

if (!eventId) {
  throw new Error("Sentry did not return an event id");
}

console.log(`SENTRY_POC12_EVENT_ID=${eventId}`);
console.log("SENTRY_POC12_FLUSHED=true");
