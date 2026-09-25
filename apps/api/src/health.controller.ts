import { Controller, Get, Res } from "@nestjs/common";
import type { FastifyReply } from "fastify";

@Controller()
export class HealthController {
  @Get("/health")
  health() {
    return {
      status: "ok",
      service: "api",
    } as const;
  }

  @Get("/ready")
  ready(@Res({ passthrough: true }) reply: FastifyReply) {
    const databaseConfigured = Boolean(process.env.DATABASE_URL);
    const queueConfigured = Boolean(process.env.REDIS_URL);
    const ready = databaseConfigured && queueConfigured;

    if (!ready) {
      reply.code(503);
    }

    return {
      status: ready ? "ready" : "not-ready",
      service: "api",
      checks: {
        database: databaseConfigured ? "configured" : "missing",
        queue: queueConfigured ? "configured" : "missing",
      },
    } as const;
  }
}
