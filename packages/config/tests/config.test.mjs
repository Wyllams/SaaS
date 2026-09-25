import assert from "node:assert/strict";
import test from "node:test";
import { parseAppEnvironment } from "../src/index.ts";

test("defaults to development", () => {
  assert.equal(parseAppEnvironment(undefined), "development");
});

test("accepts all approved environments", () => {
  assert.equal(parseAppEnvironment("development"), "development");
  assert.equal(parseAppEnvironment("staging"), "staging");
  assert.equal(parseAppEnvironment("production"), "production");
});

test("rejects unknown environments", () => {
  assert.throws(
    () => parseAppEnvironment("preview"),
    /Unsupported APP_ENV/,
  );
});
