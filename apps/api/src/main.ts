import "reflect-metadata";
import { parseAppEnvironment } from "@saas/config";
import { NestFactory } from "@nestjs/core";
import {
  FastifyAdapter,
  type NestFastifyApplication,
} from "@nestjs/platform-fastify";
import { AppModule } from "./app.module.js";

const environment = parseAppEnvironment(process.env.APP_ENV);
const port = Number(process.env.PORT ?? 3000);
const host = process.env.HOST ?? "0.0.0.0";

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

app.enableShutdownHooks();

adapter.getInstance().log.info(
  { environment, service: "api" },
  "starting API service",
);

await app.listen(port, host);
