import { parseAppEnvironment } from "@saas/config";
import { createRedisConnection } from "./redis.js";

const environment = parseAppEnvironment(process.env.APP_ENV);
const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
  throw new Error("REDIS_URL is required to start the worker");
}

const redis = createRedisConnection(redisUrl);

const shutdown = async (signal: string) => {
  process.stdout.write(
    JSON.stringify({
      level: "info",
      service: "worker",
      environment,
      message: "worker shutting down",
      signal,
    }) + "\n",
  );

  await redis.quit().catch(() => undefined);
  process.exit(0);
};

process.once("SIGTERM", () => void shutdown("SIGTERM"));
process.once("SIGINT", () => void shutdown("SIGINT"));

await redis.connect();
const pong = await redis.ping();

if (pong !== "PONG") {
  throw new Error("queue datastore readiness check failed");
}

process.stdout.write(
  JSON.stringify({
    level: "info",
    service: "worker",
    environment,
    readiness: "ready",
    handlers: 0,
    message: "worker foundation ready; no business job handlers registered",
  }) + "\n",
);

// Keep the worker process alive until job handlers are introduced by later Epics.
await new Promise<void>(() => undefined);
