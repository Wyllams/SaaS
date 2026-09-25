import assert from "node:assert/strict";
import { performance } from "node:perf_hooks";
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool, type DatabaseError } from "pg";

type Mode = "direct" | "session" | "transaction";

type Result = {
  mode: Mode;
  reachable: boolean;
  serverVersion?: string;
  ssl?: boolean;
  simpleQueryMs?: number;
  transactionLocalContext?: "PASS" | "FAIL";
  concurrency?: {
    status: "PASS" | "FAIL";
    operations: number;
    maxPoolSize: number;
    elapsedMs: number;
  };
  namedPreparedStatement?: "SUPPORTED" | "UNSUPPORTED" | "NOT_TESTED";
  sessionStateProbe?: "PERSISTED" | "NOT_PERSISTED" | "NOT_TESTED";
  errorCode?: string;
  errorCodes?: string[];
  errorClass?: string;
};

const urls: Record<Mode, string | undefined> = {
  direct: process.env.SUPABASE_DIRECT_DATABASE_URL,
  session: process.env.SUPABASE_SESSION_DATABASE_URL,
  transaction: process.env.SUPABASE_TRANSACTION_DATABASE_URL,
};

function safeError(error: unknown) {
  if (error && typeof error === "object") {
    const candidate = error as Partial<DatabaseError> & {
      code?: string;
      name?: string;
      errors?: Array<{ code?: string }>;
    };
    const nestedCodes = (candidate.errors ?? [])
      .map((item) => item.code)
      .filter((code): code is string => Boolean(code));
    const codes = [candidate.code, ...nestedCodes].filter(
      (code): code is string => Boolean(code),
    );
    return {
      errorCode: codes[0] ?? "UNKNOWN",
      errorCodes: [...new Set(codes)],
      errorClass: candidate.name ?? error.constructor?.name ?? "Error",
    };
  }
  return { errorCode: "UNKNOWN", errorCodes: [], errorClass: "Error" };
}

function isNetworkReachabilityResult(result: Result) {
  const networkCodes = new Set([
    "ENETUNREACH",
    "EHOSTUNREACH",
    "EAI_AGAIN",
    "ENOTFOUND",
    "ECONNREFUSED",
    "ETIMEDOUT",
  ]);
  return (result.errorCodes ?? [result.errorCode]).some(
    (code) => code != null && networkCodes.has(code),
  );
}

async function probe(mode: Mode, connectionString: string): Promise<Result> {
  const parsedUrl = new URL(connectionString);
  parsedUrl.searchParams.delete("sslmode");

  const pool = new Pool({
    connectionString: parsedUrl.toString(),
    max: 8,
    connectionTimeoutMillis: 12_000,
    idleTimeoutMillis: 5_000,
    application_name: `crewcommand-poc02-${mode}`,
    ssl: { rejectUnauthorized: false },
  });
  const db = drizzle(pool);

  try {
    const started = performance.now();
    const base = await db.execute(sql<{
      server_version: string;
    }>`
      select current_setting('server_version') as server_version
    `);
    const simpleQueryMs = Math.round((performance.now() - started) * 100) / 100;
    const first = base.rows[0];
    assert.ok(first?.server_version);

    const tlsClient = await pool.connect();
    let clientTlsEncrypted = false;
    try {
      const internal = tlsClient as unknown as {
        connection?: { stream?: { encrypted?: boolean } };
      };
      clientTlsEncrypted = Boolean(internal.connection?.stream?.encrypted);
    } finally {
      tlsClient.release();
    }

    const contextValue = "11111111-1111-7111-8111-111111111111";
    const transactionLocalContext = await db.transaction(async (tx) => {
      await tx.execute(sql`select set_config('app.workspace_id', ${contextValue}, true)`);
      const context = await tx.execute(sql<{ workspace_id: string }>`
        select current_setting('app.workspace_id', true) as workspace_id
      `);
      return context.rows[0]?.workspace_id === contextValue ? "PASS" : "FAIL";
    });
    assert.equal(transactionLocalContext, "PASS");

    const concurrencyStarted = performance.now();
    const operations = 24;
    await Promise.all(
      Array.from({ length: operations }, async (_, index) => {
        const result = await db.execute(sql<{ value: number }>`
          select ${index}::int as value, pg_sleep(0.03)
        `);
        assert.equal(Number(result.rows[0]?.value), index);
      }),
    );
    const elapsedMs = Math.round((performance.now() - concurrencyStarted) * 100) / 100;

    let namedPreparedStatement: Result["namedPreparedStatement"] = "NOT_TESTED";
    let sessionStateProbe: Result["sessionStateProbe"] = "NOT_TESTED";

    const client = await pool.connect();
    try {
      try {
        const queryName = `crewcommand_poc02_${mode}_prepared`;
        const firstPrepared = await client.query({
          name: queryName,
          text: "select $1::int as value",
          values: [41],
        });
        const secondPrepared = await client.query({
          name: queryName,
          text: "select $1::int as value",
          values: [42],
        });
        namedPreparedStatement =
          Number(firstPrepared.rows[0]?.value) === 41 &&
          Number(secondPrepared.rows[0]?.value) === 42
            ? "SUPPORTED"
            : "UNSUPPORTED";
      } catch {
        namedPreparedStatement = "UNSUPPORTED";
      }

      try {
        const marker = `crewcommand-poc02-${mode}-session-marker`;
        await client.query("select set_config('application_name', $1, false)", [marker]);
        const state = await client.query<{ value: string }>(
          "select current_setting('application_name') as value",
        );
        sessionStateProbe =
          state.rows[0]?.value === marker ? "PERSISTED" : "NOT_PERSISTED";
      } catch {
        sessionStateProbe = "NOT_PERSISTED";
      }
    } finally {
      client.release();
    }

    return {
      mode,
      reachable: true,
      serverVersion: String(first.server_version),
      ssl: clientTlsEncrypted,
      simpleQueryMs,
      transactionLocalContext,
      concurrency: {
        status: "PASS",
        operations,
        maxPoolSize: 8,
        elapsedMs,
      },
      namedPreparedStatement,
      sessionStateProbe,
    };
  } catch (error) {
    return {
      mode,
      reachable: false,
      ...safeError(error),
    };
  } finally {
    await pool.end();
  }
}

async function main() {
  for (const [mode, url] of Object.entries(urls) as Array<[Mode, string | undefined]>) {
    assert.ok(url, `${mode} database URL secret is missing`);
  }

  const results: Result[] = [];
  for (const mode of ["direct", "session", "transaction"] as const) {
    results.push(await probe(mode, urls[mode]!));
  }

  const direct = results.find((item) => item.mode === "direct")!;
  const session = results.find((item) => item.mode === "session")!;
  const transaction = results.find((item) => item.mode === "transaction")!;

  assert.equal(session.reachable, true, "Session pooler must be reachable");
  assert.equal(transaction.reachable, true, "Transaction pooler must be reachable");
  assert.equal(session.transactionLocalContext, "PASS");
  assert.equal(transaction.transactionLocalContext, "PASS");
  assert.equal(session.concurrency?.status, "PASS");
  assert.equal(transaction.concurrency?.status, "PASS");
  assert.equal(session.ssl, true, "Session pooler must use SSL");
  assert.equal(transaction.ssl, true, "Transaction pooler must use SSL");

  if (!direct.reachable && !isNetworkReachabilityResult(direct)) {
    throw new Error(
      `Direct connection failed for a non-network reason: ${direct.errorCode}/${direct.errorClass}`,
    );
  }

  console.log(JSON.stringify({
    poc: "POC-02",
    results,
    interpretation: {
      direct:
        direct.reachable
          ? "reachable-from-github-runner"
          : "network-unreachable-from-github-runner-acceptable-if-ipv6",
      session: "persistent-backend-compatible",
      transaction:
        "short-lived-connection-compatible; transaction-local tenant context validated",
    },
  }));
}

main().catch((error) => {
  console.error({
    message: error instanceof Error ? error.message : "POC-02 failed",
    errorClass: error instanceof Error ? error.name : "Error",
  });
  process.exitCode = 1;
});
