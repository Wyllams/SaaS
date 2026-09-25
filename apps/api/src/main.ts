import "reflect-metadata";
import { parseAppEnvironment } from "@saas/config";
import {
  createStructuredLogger,
  initializeServerErrorMonitoring,
  initializeTraceContext,
} from "@saas/observability";
import { NestFactory } from "@nestjs/core";
import {
  FastifyAdapter,
  type NestFastifyApplication,
} from "@nestjs/platform-fastify";
import { AppModule } from "./app.module.js";

function parseOptionalSampleRate(value: string | undefined) {
  if (value === undefined || value === "") return undefined;

  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0 || parsed > 1) {
    throw new Error("SENTRY_TRACES_SAMPLE_RATE must be between 0 and 1");
  }

  return parsed;
}

const environment = parseAppEnvironment(process.env.APP_ENV);
const port = Number(process.env.PORT ?? 4000);
const host = process.env.HOST ?? "0.0.0.0";
const traceContext = initializeTraceContext();
const log = createStructuredLogger({ service: "api" });

const monitoring = initializeServerErrorMonitoring({
  dsn: process.env.SENTRY_DSN,
  environment,
  service: "api",
  tracesSampleRate: parseOptionalSampleRate(
    process.env.SENTRY_TRACES_SAMPLE_RATE,
  ),
});

const adapter = new FastifyAdapter({
  logger: {
    level: process.env.LOG_LEVEL ?? "info",
    redact: [
      "req.headers.authorization",
      "req.headers.cookie",
    ],
  },
});

const app = await NestFactory.create<NestFastifyApplication>(
  AppModule,
  adapter,
  { logger: false },
);

const webOrigin = process.env.WEB_ORIGIN;
if (webOrigin) {
  app.enableCors({
    origin: webOrigin,
    methods: ["GET"],
  });
}

app.enableShutdownHooks();

process.once("beforeExit", () => traceContext.shutdown());

log.info("starting API service", {
  environment,
  port,
  errorMonitoring: monitoring.enabled,
});

await app.listen(port, host);
