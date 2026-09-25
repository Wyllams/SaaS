import assert from "node:assert/strict";
import test from "node:test";
import { redactSensitive } from "../src/redact.ts";

test("redacts secret-like fields recursively", () => {
  assert.deepEqual(
    redactSensitive({
      authorization: "Bearer secret",
      nested: {
        password: "secret",
        safe: "visible",
      },
      items: [
        { apiKey: "secret" },
        { label: "visible" },
      ],
    }),
    {
      authorization: "[REDACTED]",
      nested: {
        password: "[REDACTED]",
        safe: "visible",
      },
      items: [
        { apiKey: "[REDACTED]" },
        { label: "visible" },
      ],
    },
  );
});
