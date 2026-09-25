import assert from "node:assert/strict";
import test from "node:test";
import { verifySupabaseAccessToken } from "./supabase-token-verifier.ts";

test("rejects an empty access token before creating a Supabase client", async () => {
  assert.equal(await verifySupabaseAccessToken(""), null);
});
