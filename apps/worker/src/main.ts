import { parseAppEnvironment } from "@saas/config";
import {
  createStructuredLogger,
  initializeServerErrorMonitoring,
  initializeTraceContext,
} from "@saas/observability";
import { createRedisConnection } from "./redis.js";

function parseOptionalSampleRate(value: string | undefined) {
  if (value === undefined || value === "") return undefined;

  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0 || parsed > 1) {
    throw new Error("SENTRY_TRACES_SAMPLE_RATE must be between 0 and 1");
  }

  return parsed;
}

const environment = parseAppEnvironment(process.env.APP_ENV);
const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
  throw new Error("REDIS_URL is required to start the worker");
}

const traceContext = initializeTraceContext();
const log = createStructuredLogger({ service: "worker" });

const monitoring = initializeServerErrorMonitoring({
  dsn: process.env.SENTRY_DSN,
  environment,
  service: "worker",
  tracesSampleRate: parseOptionalSampleRate(
    process.env.SENTRY_TRACES_SAMPLE_RATE,
  ),
});

const redis = createRedisConnection(redisUrl);

const shutdown = async (signal: string) => {
  log.info("worker shutting down", { signal });
  await redis.quit().catch(() => undefined);
  traceContext.shutdown();
  process.exit(0);
};

process.once("SIGTERM", () => void shutdown("SIGTERM"));
process.once("SIGINT", () => void shutdown("SIGINT"));

await redis.connect();
const pong = await redis.ping();

if (pong !== "PONG") {
  throw new Error("queue datastore readiness check failed");
}

log.info("worker foundation ready; no business job handlers registered", {
  environment,
  readiness: "ready",
  handlers: 0,
  errorMonitoring: monitoring.enabled,
});

// Keep the worker process alive until job handlers are introduced by later Epics.
await new Promise<void>(() => undefined);
