import assert from "node:assert/strict";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.js";

const WORKSPACE_A = "11111111-1111-7111-8111-111111111111";
const WORKSPACE_B = "22222222-2222-7222-8222-222222222222";
const CUSTOMER_A1 = "aaaaaaaa-aaaa-7aaa-8aaa-aaaaaaaaaaa1";
const CUSTOMER_A2 = "aaaaaaaa-aaaa-7aaa-8aaa-aaaaaaaaaaa2";
const CUSTOMER_B1 = "bbbbbbbb-bbbb-7bbb-8bbb-bbbbbbbbbbb1";
const ROLLBACK_ID = "aaaaaaaa-aaaa-7aaa-8aaa-aaaaaaaaaaa9";

const admin = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.PRISMA_DATABASE_URL! }),
});
const app = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.PRISMA_APP_DATABASE_URL! }),
});

async function withWorkspace<T>(
  workspaceId: string,
  fn: (tx: Parameters<Parameters<typeof app.$transaction>[0]>[0]) => Promise<T>,
) {
  return app.$transaction(async (tx) => {
    await tx.$executeRaw`select set_config('app.workspace_id', ${workspaceId}, true)`;
    return fn(tx);
  });
}

async function main() {
  await admin.customer.deleteMany();
  await admin.workspace.deleteMany();

  await admin.workspace.createMany({
    data: [
      { id: WORKSPACE_A, name: "Alpha Roofing" },
      { id: WORKSPACE_B, name: "Beta HVAC" },
    ],
  });
  await admin.customer.createMany({
    data: [
      { id: CUSTOMER_A1, workspaceId: WORKSPACE_A, name: "Acme Home", email: "a1@example.com", metadata: { tier: "vip", source: "referral" } },
      { id: CUSTOMER_A2, workspaceId: WORKSPACE_A, name: "Alice Smith", email: "a2@example.com", metadata: { tier: "standard" } },
      { id: CUSTOMER_B1, workspaceId: WORKSPACE_B, name: "Beta Customer", email: "b1@example.com", metadata: { tier: "vip" } },
    ],
  });

  const alphaRows = await withWorkspace(WORKSPACE_A, (tx) =>
    tx.customer.findMany({ orderBy: { name: "asc" } }),
  );
  assert.equal(alphaRows.length, 2);
  assert.ok(alphaRows.every((row) => row.workspaceId === WORKSPACE_A));

  const betaRows = await withWorkspace(WORKSPACE_B, (tx) =>
    tx.customer.findMany(),
  );
  assert.equal(betaRows.length, 1);
  assert.equal(betaRows[0].workspaceId, WORKSPACE_B);

  let crossTenantInsertDenied = false;
  try {
    await withWorkspace(WORKSPACE_A, (tx) =>
      tx.customer.create({
        data: {
          id: "bbbbbbbb-bbbb-7bbb-8bbb-bbbbbbbbbbb9",
          workspaceId: WORKSPACE_B,
          name: "Should Fail",
          metadata: {},
        },
      }),
    );
  } catch {
    crossTenantInsertDenied = true;
  }
  assert.equal(crossTenantInsertDenied, true, "RLS must deny cross-workspace insert");

  try {
    await withWorkspace(WORKSPACE_A, async (tx) => {
      await tx.customer.create({
        data: {
          id: ROLLBACK_ID,
          workspaceId: WORKSPACE_A,
          name: "Rollback Me",
          metadata: { tier: "temporary" },
        },
      });
      throw new Error("intentional rollback");
    });
  } catch (error) {
    assert.match(String(error), /intentional rollback/);
  }

  const rolledBack = await admin.customer.findUnique({ where: { id: ROLLBACK_ID } });
  assert.equal(rolledBack, null, "transaction rollback must remove inserted row");

  const vipRows = await withWorkspace(WORKSPACE_A, (tx) =>
    tx.customer.findMany({
      where: { metadata: { path: ["tier"], equals: "vip" } },
      select: { id: true, name: true },
    }),
  );
  assert.deepEqual(vipRows.map((row) => row.name), ["Acme Home"]);

  const fts = await withWorkspace(WORKSPACE_A, (tx) =>
    tx.$queryRaw<Array<{ id: string; name: string }>>`
      select id, name
      from customers
      where to_tsvector('simple', coalesce(name, ''))
        @@ plainto_tsquery('simple', 'Acme')
    `,
  );
  assert.equal(fts.length, 1);

  const trigram = await withWorkspace(WORKSPACE_A, (tx) =>
    tx.$queryRaw<Array<{ name: string; score: number }>>`
      select name, similarity(name, 'Acme') as score
      from customers
      where name % 'Acme'
      order by score desc
    `,
  );
  assert.ok(trigram.length >= 1);

  console.log(JSON.stringify({
    candidate: "prisma7",
    rlsIsolation: "PASS",
    crossTenantWriteDenied: "PASS",
    transactionRollback: "PASS",
    jsonb: "PASS",
    fullTextSearchViaRawSql: "PASS",
    pgTrgmViaRawSql: "PASS",
  }));
}

main()
  .finally(async () => {
    await admin.$disconnect();
    await app.$disconnect();
  })
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
