import assert from "node:assert/strict";
import test from "node:test";
import { reconcileAuthenticatedIdentity } from "./authenticated-reconciliation.ts";

test("rejects an absent or invalid token before reconciliation", async () => {
  let repositoryCalled = false;
  const result = await reconcileAuthenticatedIdentity({ token: "", verifyToken: async () => null, repository: { async findOrCreateUserWithSupabaseIdentity() { repositoryCalled = true; } } });
  assert.equal(result, null);
  assert.equal(repositoryCalled, false);
});

test("reconciles only a server-verified identity", async () => {
  const result = await reconcileAuthenticatedIdentity({ token: "valid-token", verifyToken: async () => ({ subject: "7f24bf3c-90b7-4a9b-8e91-5d5d8f0f2e22", email: "owner@example.test" }), repository: { async findOrCreateUserWithSupabaseIdentity(input) { return { user: { id: input.id, email: input.email }, created: true }; } } });
  assert.equal(result?.user.email, "owner@example.test");
  assert.equal(result?.created, true);
});

test("ignores browser-supplied authorization and internal identity fields", async () => {
  let receivedInput;
  const result = await reconcileAuthenticatedIdentity({
    token: "valid-token",
    internalUserId: "browser-controlled-user-id",
    workspaceId: "browser-controlled-workspace-id",
    role: "owner",
    permission: "everything",
    verifyToken: async () => ({ subject: "7f24bf3c-90b7-4a9b-8e91-5d5d8f0f2e22", email: "owner@example.test" }),
    repository: {
      async findOrCreateUserWithSupabaseIdentity(input) {
        receivedInput = input;
        return { user: { id: input.id, email: input.email }, created: true };
      },
    },
  });

  assert.equal(result?.user.email, "owner@example.test");
  assert.deepEqual(Object.keys(receivedInput).sort(), ["email", "id", "subject"]);
  assert.equal(receivedInput.subject, "7f24bf3c-90b7-4a9b-8e91-5d5d8f0f2e22");
});
