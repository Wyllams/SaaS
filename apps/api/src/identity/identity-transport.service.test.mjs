import assert from "node:assert/strict";
import test from "node:test";
import { HttpException } from "@nestjs/common";
import {
  extractBearerAccessToken,
  IdentityTransport,
} from "./identity-transport.ts";

test("extracts only a complete bearer access token", () => {
  assert.equal(extractBearerAccessToken("Bearer token-value"), "token-value");
  assert.equal(extractBearerAccessToken("Basic token-value"), null);
  assert.equal(extractBearerAccessToken("Bearer"), null);
  assert.equal(extractBearerAccessToken(undefined), null);
});

test("rejects a missing bearer token before verification or reconciliation", async () => {
  let verified = false;
  const service = new IdentityTransport(
    { async findOrCreateUserWithSupabaseIdentity() { throw new Error("must not reconcile"); } },
    async () => { verified = true; return null; },
  );

  await assert.rejects(
    () => service.currentIdentity(undefined),
    (error) => error instanceof HttpException && error.getStatus() === 401,
  );
  assert.equal(verified, false);
});

test("returns only the reconciled internal User for a verified bearer token", async () => {
  const service = new IdentityTransport(
    {
      async findOrCreateUserWithSupabaseIdentity(input) {
        return { user: { id: input.id, email: input.email }, created: true };
      },
    },
    async () => ({ subject: "7f24bf3c-90b7-4a9b-8e91-5d5d8f0f2e22", email: "owner@example.test" }),
  );

  const result = await service.currentIdentity("Bearer valid-token");
  assert.deepEqual(Object.keys(result), ["user"]);
  assert.equal(result.user.email, "owner@example.test");
});

test("rejects an invalid bearer token without reconciling", async () => {
  let repositoryCalled = false;
  const service = new IdentityTransport(
    {
      async findOrCreateUserWithSupabaseIdentity() {
        repositoryCalled = true;
        throw new Error("must not reconcile");
      },
    },
    async () => null,
  );

  await assert.rejects(
    () => service.currentIdentity("Bearer invalid-token"),
    (error) => error instanceof HttpException && error.getStatus() === 401,
  );
  assert.equal(repositoryCalled, false);
});

test("does not expose an identity endpoint when the database is not configured", async () => {
  const service = new IdentityTransport(null, async () => null);

  await assert.rejects(
    () => service.currentIdentity("Bearer valid-token"),
    (error) => error instanceof HttpException && error.getStatus() === 503,
  );
});
