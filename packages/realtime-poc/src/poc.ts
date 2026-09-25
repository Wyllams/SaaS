import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { setTimeout as sleep } from "node:timers/promises";
import { createClient, type RealtimeChannel, type SupabaseClient } from "@supabase/supabase-js";
import { Pool } from "pg";

const projectUrl = process.env.SUPABASE_PROJECT_URL!;
const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY!;
const databaseUrl = process.env.SUPABASE_SESSION_DATABASE_URL!;

assert.ok(projectUrl, "SUPABASE_PROJECT_URL is required");
assert.ok(publishableKey, "SUPABASE_PUBLISHABLE_KEY is required");
assert.ok(databaseUrl, "SUPABASE_SESSION_DATABASE_URL is required");

const db = new Pool({
  connectionString: databaseUrl,
  max: 2,
  ssl: { rejectUnauthorized: false },
  application_name: "crewcommand-poc06-realtime",
});

type SubscribeResult = {
  status: string;
  error?: string;
};

function createRealtimeClient(): SupabaseClient {
  return createClient(projectUrl, publishableKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  });
}

async function subscribe(channel: RealtimeChannel, timeoutMs = 8_000): Promise<SubscribeResult> {
  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      resolve({ status: "TIMEOUT" });
    }, timeoutMs);

    channel.subscribe((status, error) => {
      if (status === "SUBSCRIBED" || status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED") {
        clearTimeout(timer);
        resolve({
          status,
          error: error ? error.message : undefined,
        });
      }
    });
  });
}

async function waitFor<T>(promise: Promise<T>, timeoutMs: number, message: string): Promise<T> {
  return Promise.race([
    promise,
    sleep(timeoutMs).then(() => {
      throw new Error(message);
    }),
  ]);
}

async function main() {
  const event1 = randomUUID();
  const event2 = randomUUID();

  await db.query(
    "insert into public.poc06_attempt4_events(id, payload) values ($1::uuid, $2::jsonb)",
    [event1, JSON.stringify({ kind: "job.updated", sequence: 1 })],
  );

  const subscriber = createRealtimeClient();
  const publisher = createRealtimeClient();
  const unauthorized = createRealtimeClient();

  const received: Array<Record<string, unknown>> = [];
  let resolveReceived: ((value: Record<string, unknown>) => void) | undefined;
  const receivedPromise = new Promise<Record<string, unknown>>((resolve) => {
    resolveReceived = resolve;
  });

  const subscriberChannel = subscriber
    .channel("poc06:attempt4:authorized", { config: { private: true } })
    .on("broadcast", { event: "job.updated" }, ({ payload }) => {
      received.push(payload as Record<string, unknown>);
      resolveReceived?.(payload as Record<string, unknown>);
    });

  const publisherChannel = publisher.channel("poc06:attempt4:authorized", {
    config: { private: true },
  });

  const subscriberStatus = await subscribe(subscriberChannel);
  const publisherStatus = await subscribe(publisherChannel);

  assert.equal(
    subscriberStatus.status,
    "SUBSCRIBED",
    `authorized subscriber failed: ${subscriberStatus.status}/${subscriberStatus.error ?? "no-error"}`,
  );
  assert.equal(
    publisherStatus.status,
    "SUBSCRIBED",
    `authorized publisher failed: ${publisherStatus.status}/${publisherStatus.error ?? "no-error"}`,
  );

  const sendStatus = await publisherChannel.send({
    type: "broadcast",
    event: "job.updated",
    payload: { eventId: event1, sequence: 1 },
  });
  assert.equal(sendStatus, "ok");

  const firstReceived = await waitFor(
    receivedPromise,
    5_000,
    "authorized subscriber did not receive broadcast",
  );
  assert.equal(firstReceived.eventId, event1);
  assert.equal(firstReceived.sequence, 1);

  const forbiddenChannel = unauthorized.channel("poc06:attempt4:forbidden", {
    config: { private: true },
  });
  const forbiddenStatus = await subscribe(forbiddenChannel, 5_000);
  assert.notEqual(
    forbiddenStatus.status,
    "SUBSCRIBED",
    "unauthorized topic must not be subscribable",
  );

  await subscriber.removeChannel(subscriberChannel);

  await db.query(
    "insert into public.poc06_attempt4_events(id, payload) values ($1::uuid, $2::jsonb)",
    [event2, JSON.stringify({ kind: "job.updated", sequence: 2 })],
  );

  const secondSendStatus = await publisherChannel.send({
    type: "broadcast",
    event: "job.updated",
    payload: { eventId: event2, sequence: 2 },
  });
  assert.equal(secondSendStatus, "ok");

  await sleep(750);
  assert.equal(
    received.length,
    1,
    "disconnected subscriber must not receive ephemeral broadcast",
  );

  const persisted = await db.query<{
    id: string;
    sequence: number;
  }>(
    `
      select id::text,
             (payload->>'sequence')::int as sequence
      from public.poc06_attempt4_events
      where id = any($1::uuid[])
      order by (payload->>'sequence')::int
    `,
    [[event1, event2]],
  );

  assert.deepEqual(
    persisted.rows.map((row) => row.sequence),
    [1, 2],
    "database must retain both events even when realtime delivery is missed",
  );

  const recoveredEvent = persisted.rows.find((row) => row.id === event2);
  assert.ok(recoveredEvent, "missed event must be recoverable from PostgreSQL");
  assert.equal(recoveredEvent.sequence, 2);

  await Promise.allSettled([
    publisher.removeChannel(publisherChannel),
    unauthorized.removeChannel(forbiddenChannel),
  ]);

  subscriber.realtime.disconnect();
  publisher.realtime.disconnect();
  unauthorized.realtime.disconnect();

  console.log(
    JSON.stringify({
      poc: "POC-06",
      supabaseJs: "2.117.1",
      privateAuthorizedSubscribe: "PASS",
      privateAuthorizedBroadcast: "PASS",
      forbiddenTopicAuthorization: {
        status: "PASS",
        observedStatus: forbiddenStatus.status,
      },
      disconnectedClientMissesEphemeralBroadcast: "PASS",
      postgresRecoveryOfMissedState: "PASS",
      persistedRows: persisted.rowCount,
    }),
  );
}

main()
  .catch((error) => {
    console.error({
      message: error instanceof Error ? error.message : "POC-06 failed",
      errorClass: error instanceof Error ? error.name : "Error",
    });
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.end().catch(() => undefined);
    setTimeout(() => process.exit(process.exitCode ?? 0), 100);
  });
