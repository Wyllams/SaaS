import assert from "node:assert/strict";
import test from "node:test";
import { reconcileIdentity } from "./identity-reconciliation.ts";

test("creates one internal User for a first verified Supabase subject", async () => {
  const repository = new InMemoryIdentityRepository();

  const result = await reconcileIdentity({
    repository,
    identity: {
      subject: "7f24bf3c-90b7-4a9b-8e91-5d5d8f0f2e22",
      email: "owner@example.test",
    },
  });

  assert.equal(result.created, true);
  assert.equal(result.user.email, "owner@example.test");
  assert.equal(repository.users.length, 1);
  assert.equal(repository.mappings.length, 1);
  assert.equal(repository.mappings[0].userId, result.user.id);
});

test("reuses the internal User for a previously mapped Supabase subject", async () => {
  const repository = new InMemoryIdentityRepository();
  const identity = {
    subject: "7f24bf3c-90b7-4a9b-8e91-5d5d8f0f2e22",
    email: "owner@example.test",
  };

  const first = await reconcileIdentity({ repository, identity });
  const second = await reconcileIdentity({ repository, identity });

  assert.equal(second.created, false);
  assert.equal(second.user.id, first.user.id);
  assert.equal(repository.users.length, 1);
  assert.equal(repository.mappings.length, 1);
});

test("requires the repository to resolve concurrent reconciliation atomically", async () => {
  const repository = new InMemoryIdentityRepository();
  const identity = {
    subject: "2dd90b7e-37e4-45da-8218-76b6a16b7e20",
    email: "concurrent@example.test",
  };

  const results = await Promise.all([
    reconcileIdentity({ repository, identity }),
    reconcileIdentity({ repository, identity }),
  ]);

  assert.equal(results.filter((result) => result.created).length, 1);
  assert.equal(new Set(results.map((result) => result.user.id)).size, 1);
  assert.equal(repository.users.length, 1);
  assert.equal(repository.mappings.length, 1);
});

class InMemoryIdentityRepository {
  users = [];
  mappings = [];

  async findOrCreateUserWithSupabaseIdentity({ id, email, subject }) {
    const mapping = this.mappings.find((candidate) => candidate.subject === subject);
    const existing = mapping
      ? this.users.find((candidate) => candidate.id === mapping.userId)
      : undefined;
    if (existing) return { user: existing, created: false };

    const user = { id, email };
    this.users.push(user);
    this.mappings.push({ userId: id, subject });
    return { user, created: true };
  }
}
