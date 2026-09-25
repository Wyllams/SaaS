import assert from "node:assert/strict";
import test from "node:test";
import { SpanStatusCode } from "@opentelemetry/api";
import { createObservabilityRuntime } from "../src/runtime.mjs";
import { runEndToEndScenario } from "../src/scenario.mjs";
import { resolveSentryExternalConfig } from "../src/sentry-contract.mjs";

test("propagates one trace across API, queue, worker and provider spans", async () => {
  const runtime = createObservabilityRuntime();

  try {
    const result = await runEndToEndScenario(runtime);

    assert.match(
      result.carrier.traceparent,
      /^00-[0-9a-f]{32}-[0-9a-f]{16}-0[01]$/,
    );

    const byName = new Map(result.spans.map((span) => [span.name, span]));

    assert.deepEqual(
      [...byName.keys()].sort(),
      ["api.request", "provider.call", "queue.publish", "worker.job"].sort(),
    );

    const traceIds = new Set(
      result.spans.map((span) => span.spanContext().traceId),
    );
    assert.equal(traceIds.size, 1);

    assert.equal(
      byName.get("worker.job").parentSpanContext?.spanId,
      byName.get("queue.publish").spanContext().spanId,
    );

    assert.equal(
      byName.get("provider.call").parentSpanContext?.spanId,
      byName.get("worker.job").spanContext().spanId,
    );

    assert.equal(
      byName.get("provider.call").status.code,
      SpanStatusCode.ERROR,
    );

    assert.ok(
      byName
        .get("provider.call")
        .events.some((event) => event.name === "exception"),
    );
  } finally {
    await runtime.shutdown();
  }
});

test("correlates structured logs with trace context and redacts secrets", async () => {
  const runtime = createObservabilityRuntime();

  try {
    const result = await runEndToEndScenario(runtime);
    const traceId = result.spans[0].spanContext().traceId;

    assert.ok(result.logs.length >= 4);

    for (const record of result.logs) {
      assert.equal(record.trace_id, traceId);
      assert.match(record.span_id, /^[0-9a-f]{16}$/);
    }

    const serialized = JSON.stringify(result.logs);
    assert.doesNotMatch(serialized, /should-never-reach-logs/);
    assert.doesNotMatch(serialized, /also-secret/);
    assert.match(serialized, /\[REDACTED\]/);
  } finally {
    await runtime.shutdown();
  }
});

test("keeps Sentry disabled until a real project DSN is supplied", () => {
  assert.deepEqual(resolveSentryExternalConfig({}), {
    enabled: false,
    reason: "missing_sentry_dsn",
  });

  const enabled = resolveSentryExternalConfig({
    SENTRY_DSN:
      "https://public-key@o123.ingest.sentry.io/456",
    SENTRY_ENVIRONMENT: "poc",
  });

  assert.deepEqual(enabled, {
    enabled: true,
    environment: "poc",
    dsnHost: "o123.ingest.sentry.io",
    dsn: "[REDACTED]",
  });

  assert.throws(
    () =>
      resolveSentryExternalConfig({
        SENTRY_DSN: "http://public-key@example.test/1",
      }),
    /must use HTTPS/,
  );
});
