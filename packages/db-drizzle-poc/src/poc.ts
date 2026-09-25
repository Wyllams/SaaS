import assert from "node:assert/strict";
import { drizzle } from "drizzle-orm/node-postgres";
import { eq, sql } from "drizzle-orm";
import { Pool } from "pg";
import { customers, workspaces } from "./schema.js";

const WORKSPACE_A = "11111111-1111-7111-8111-111111111111";
const WORKSPACE_B = "22222222-2222-7222-8222-222222222222";
const CUSTOMER_A1 = "aaaaaaaa-aaaa-7aaa-8aaa-aaaaaaaaaaa1";
const CUSTOMER_A2 = "aaaaaaaa-aaaa-7aaa-8aaa-aaaaaaaaaaa2";
const CUSTOMER_B1 = "bbbbbbbb-bbbb-7bbb-8bbb-bbbbbbbbbbb1";
const ROLLBACK_ID = "aaaaaaaa-aaaa-7aaa-8aaa-aaaaaaaaaaa9";

type CustomerRow = typeof customers.$inferSelect;
type NamedCustomer = { id: string; name: string };
type TrigramRow = { name: string; score: number };
type QueryRows<T> = { rows: T[] };

const adminPool = new Pool({ connectionString: process.env.DRIZZLE_DATABASE_URL });
const appPool = new Pool({ connectionString: process.env.DRIZZLE_APP_DATABASE_URL });
const admin = drizzle(adminPool);
const app = drizzle(appPool);

async function withWorkspace<T>(
  workspaceId: string,
  fn: (tx: any) => Promise<T>,
): Promise<T> {
  return app.transaction(async (tx) => {
    await tx.execute(sql`select set_config('app.workspace_id', ${workspaceId}, true)`);
    return fn(tx);
  });
}

async function main() {
  await admin.delete(customers);
  await admin.delete(workspaces);

  await admin.insert(workspaces).values([
    { id: WORKSPACE_A, name: "Alpha Roofing" },
    { id: WORKSPACE_B, name: "Beta HVAC" },
  ]);
  await admin.insert(customers).values([
    { id: CUSTOMER_A1, workspaceId: WORKSPACE_A, name: "Acme Home", email: "a1@example.com", metadata: { tier: "vip", source: "referral" } },
    { id: CUSTOMER_A2, workspaceId: WORKSPACE_A, name: "Alice Smith", email: "a2@example.com", metadata: { tier: "standard" } },
    { id: CUSTOMER_B1, workspaceId: WORKSPACE_B, name: "Beta Customer", email: "b1@example.com", metadata: { tier: "vip" } },
  ]);

  const alphaRows = await withWorkspace<CustomerRow[]>(WORKSPACE_A, (tx) =>
    tx.select().from(customers).orderBy(customers.name),
  );
  assert.equal(alphaRows.length, 2);
  assert.ok(alphaRows.every((row) => row.workspaceId === WORKSPACE_A));

  const betaRows = await withWorkspace<CustomerRow[]>(WORKSPACE_B, (tx) =>
    tx.select().from(customers),
  );
  assert.equal(betaRows.length, 1);
  assert.equal(betaRows[0].workspaceId, WORKSPACE_B);

  let crossTenantInsertDenied = false;
  try {
    await withWorkspace<unknown>(WORKSPACE_A, (tx) =>
      tx.insert(customers).values({
        id: "bbbbbbbb-bbbb-7bbb-8bbb-bbbbbbbbbbb9",
        workspaceId: WORKSPACE_B,
        name: "Should Fail",
        metadata: {},
      }),
    );
  } catch {
    crossTenantInsertDenied = true;
  }
  assert.equal(crossTenantInsertDenied, true, "RLS must deny cross-workspace insert");

  try {
    await withWorkspace<never>(WORKSPACE_A, async (tx) => {
      await tx.insert(customers).values({
        id: ROLLBACK_ID,
        workspaceId: WORKSPACE_A,
        name: "Rollback Me",
        metadata: { tier: "temporary" },
      });
      throw new Error("intentional rollback");
    });
  } catch (error) {
    assert.match(String(error), /intentional rollback/);
  }

  const rolledBack = await admin
    .select()
    .from(customers)
    .where(eq(customers.id, ROLLBACK_ID));
  assert.equal(rolledBack.length, 0, "transaction rollback must remove inserted row");

  const vipRows = await withWorkspace<NamedCustomer[]>(WORKSPACE_A, (tx) =>
    tx
      .select({ id: customers.id, name: customers.name })
      .from(customers)
      .where(sql`${customers.metadata}->>'tier' = 'vip'`),
  );
  assert.deepEqual(vipRows.map((row) => row.name), ["Acme Home"]);

  const fts = await withWorkspace<QueryRows<NamedCustomer>>(WORKSPACE_A, (tx) =>
    tx.execute(sql`
      select id, name
      from customers
      where to_tsvector('simple', coalesce(name, ''))
        @@ plainto_tsquery('simple', 'Acme')
    `),
  );
  assert.equal(fts.rows.length, 1);

  const trigram = await withWorkspace<QueryRows<TrigramRow>>(WORKSPACE_A, (tx) =>
    tx.execute(sql`
      select name, similarity(name, 'Acme') as score
      from customers
      where name % 'Acme'
      order by score desc
    `),
  );
  assert.ok(trigram.rows.length >= 1);

  console.log(JSON.stringify({
    candidate: "drizzle",
    rlsIsolation: "PASS",
    crossTenantWriteDenied: "PASS",
    transactionRollback: "PASS",
    jsonb: "PASS",
    fullTextSearch: "PASS",
    pgTrgm: "PASS",
    strictTypecheckHarness: "PASS",
  }));
}

main()
  .finally(async () => {
    await adminPool.end();
    await appPool.end();
  })
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
