import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { setTimeout as sleep } from "node:timers/promises";
import { Queue, QueueEvents, Worker, type Job } from "bullmq";
import { Redis } from "ioredis";

const host = process.env.VALKEY_HOST ?? "127.0.0.1";
const port = Number(process.env.VALKEY_PORT ?? "6379");
const connection = { host, port, maxRetriesPerRequest: null as null };

async function withQueue<T>(
  prefix: string,
  run: (ctx: {
    queue: Queue;
    events: QueueEvents;
    redis: Redis;
    queueName: string;
  }) => Promise<T>,
): Promise<T> {
  const queueName = `poc05-${prefix}-${randomUUID()}`;
  const queue = new Queue(queueName, { connection });
  const events = new QueueEvents(queueName, { connection });
  const redis = new Redis({ host, port, maxRetriesPerRequest: null });
  await events.waitUntilReady();
  try {
    return await run({ queue, events, redis, queueName });
  } finally {
    await queue.obliterate({ force: true }).catch(() => undefined);
    await Promise.allSettled([queue.close(), events.close(), redis.quit()]);
  }
}

async function retryBackoffTest() {
  return withQueue("retry", async ({ queue, events, queueName }) => {
    const seenAttempts: number[] = [];
    const worker = new Worker(
      queueName,
      async (job: Job) => {
        seenAttempts.push(job.attemptsMade + 1);
        if (job.attemptsMade < 2) throw new Error("transient failure");
        return { ok: true, attemptsMade: job.attemptsMade + 1 };
      },
      { connection },
    );
    try {
      const job = await queue.add("retryable", { kind: "integration" }, {
        attempts: 3,
        backoff: { type: "fixed", delay: 100 },
        removeOnComplete: false,
        removeOnFail: false,
      });
      const result = await job.waitUntilFinished(events, 10_000);
      assert.deepEqual(seenAttempts, [1, 2, 3]);
      assert.deepEqual(result, { ok: true, attemptsMade: 3 });
      const stored = await queue.getJob(job.id!);
      assert.equal(stored?.attemptsMade, 3);
      return "PASS";
    } finally {
      await worker.close();
    }
  });
}

async function idempotencyTest() {
  return withQueue("idempotency", async ({ queue, events, redis, queueName }) => {
    const operationId = `payment-${randomUUID()}`;
    const sideEffectCounter = `poc05:counter:${operationId}`;
    const lockKey = `poc05:idempotency:${operationId}`;

    const worker = new Worker(
      queueName,
      async (job: Job<{ operationId: string }>) => {
        const claimed = await redis.set(
          `poc05:idempotency:${job.data.operationId}`,
          "processed",
          "NX",
          "EX",
          120,
        );
        if (claimed === "OK") {
          await redis.incr(sideEffectCounter);
          return { executed: true };
        }
        return { executed: false };
      },
      { connection, concurrency: 2 },
    );

    try {
      const [a, b] = await Promise.all([
        queue.add("payment-webhook", { operationId }),
        queue.add("payment-webhook", { operationId }),
      ]);
      const [ra, rb] = await Promise.all([
        a.waitUntilFinished(events, 10_000),
        b.waitUntilFinished(events, 10_000),
      ]);
      assert.equal(Number(await redis.get(sideEffectCounter)), 1);
      assert.equal([ra.executed, rb.executed].filter(Boolean).length, 1);
      assert.equal(await redis.get(lockKey), "processed");
      return "PASS";
    } finally {
      await worker.close();
      await redis.del(sideEffectCounter, lockKey);
    }
  });
}

async function delayedJobTest() {
  return withQueue("delayed", async ({ queue, events, queueName }) => {
    const worker = new Worker(queueName, async () => Date.now(), { connection });
    try {
      const started = Date.now();
      const job = await queue.add("delayed-notification", {}, { delay: 600 });
      const processedAt = Number(await job.waitUntilFinished(events, 10_000));
      const elapsed = processedAt - started;
      assert.ok(elapsed >= 450, `delayed job ran too early: ${elapsed}ms`);
      assert.ok(elapsed < 5_000, `delayed job ran unexpectedly late: ${elapsed}ms`);
      return "PASS";
    } finally {
      await worker.close();
    }
  });
}

async function concurrencyTest() {
  return withQueue("concurrency", async ({ queue, events, queueName }) => {
    let active = 0;
    let maxActive = 0;

    const worker = new Worker(
      queueName,
      async () => {
        active += 1;
        maxActive = Math.max(maxActive, active);
        await sleep(180);
        active -= 1;
        return true;
      },
      { connection, concurrency: 3 },
    );

    try {
      const jobs = await Promise.all(
        Array.from({ length: 6 }, (_, i) => queue.add("parallel", { i })),
      );
      await Promise.all(jobs.map((job) => job.waitUntilFinished(events, 10_000)));
      assert.ok(maxActive >= 2, `expected concurrent processing, maxActive=${maxActive}`);
      assert.ok(maxActive <= 3, `worker exceeded configured concurrency, maxActive=${maxActive}`);
      return { status: "PASS", maxActive };
    } finally {
      await worker.close();
    }
  });
}

async function recoveryTest() {
  return withQueue("recovery", async ({ queue, events, queueName }) => {
    const job = await queue.add("queued-before-worker", { recover: true });
    await sleep(150);

    const worker = new Worker(
      queueName,
      async (incoming: Job<{ recover: boolean }>) => incoming.data.recover,
      { connection },
    );
    try {
      const result = await job.waitUntilFinished(events, 10_000);
      assert.equal(result, true);
      return "PASS";
    } finally {
      await worker.close();
    }
  });
}

async function permanentFailureTest() {
  return withQueue("failed", async ({ queue, events, queueName }) => {
    const worker = new Worker(
      queueName,
      async () => {
        throw new Error("permanent failure");
      },
      { connection },
    );
    try {
      const job = await queue.add("permanent", {}, {
        attempts: 2,
        backoff: { type: "fixed", delay: 50 },
        removeOnFail: false,
      });
      await assert.rejects(() => job.waitUntilFinished(events, 10_000));
      const failed = await queue.getJob(job.id!);
      assert.equal(failed?.attemptsMade, 2);
      assert.equal(await failed?.getState(), "failed");
      return "PASS";
    } finally {
      await worker.close();
    }
  });
}

async function main() {
  const redis = new Redis({ host, port, maxRetriesPerRequest: null });
  try {
    const pong = await redis.ping();
    assert.equal(pong, "PONG");
    const serverInfo = await redis.info("server");
    const valkeyDetected = /valkey|redis_version/i.test(serverInfo);
    assert.equal(valkeyDetected, true);
  } finally {
    await redis.quit();
  }

  const results = {
    retryBackoff: await retryBackoffTest(),
    idempotency: await idempotencyTest(),
    delayedJobs: await delayedJobTest(),
    concurrency: await concurrencyTest(),
    recovery: await recoveryTest(),
    permanentFailurePersistence: await permanentFailureTest(),
  };

  console.log(JSON.stringify({
    candidate: "bullmq-valkey",
    bullmq: "6.3.4",
    valkey: "8.1.10",
    ...results,
  }));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
