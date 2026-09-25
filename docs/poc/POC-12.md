# POC-12 — Observability E2E

## Status

**LOCAL PASS — OpenTelemetry + structured-log contract validated. Real Sentry ingestion remains pending because it requires a Sentry project/DSN.**

## Goal

Validate an end-to-end observability contract for the SaaS without tying the architecture to the final product name.

The PoC scope is:

- OpenTelemetry trace propagation can be validated locally;
- application logs can be structured and correlated to traces locally;
- a controlled error can be represented in trace data;
- sensitive fields must not leak into logs;
- real Sentry validation requires a Sentry project and DSN.

## Repository basis

This branch is based on **POC-04 — Monorepo Foundation**.

The experiment lives under:

`packages/observability-poc/`

No Web/API framework scaffold is introduced by this PoC.

## Validated local stack

- `@opentelemetry/api` 1.9.1;
- `@opentelemetry/core` 2.11.0;
- `@opentelemetry/context-async-hooks` 2.11.0;
- `@opentelemetry/sdk-trace` 2.11.0;
- Node.js 24.21.0;
- pnpm 12.6.0.

## Local E2E scenario

The test scenario models:

`API request → queue publish → worker job → provider call`

The trace crosses the simulated queue boundary through W3C Trace Context.

Validated:

1. all four spans share one trace id;
2. `traceparent` is injected and extracted across the queue boundary;
3. worker span is parented to the producer span;
4. provider span is parented to the worker span;
5. structured logs contain `trace_id` and `span_id`;
6. a controlled provider failure produces an exception event and ERROR span status;
7. authorization/password/token-like fields are redacted from logs.

## Signal scope

### Traces

OpenTelemetry tracing is the interoperability layer accepted by this PoC.

### Logs

The PoC uses structured application logs correlated with the active OpenTelemetry span.

OpenTelemetry JavaScript log SDK support is not treated as a production requirement by this PoC because the current OpenTelemetry JavaScript documentation classifies Logs as **Development**, while Traces are **Stable**.

The design therefore keeps logging output structured and trace-correlated without coupling the application to the OpenTelemetry Logs SDK.

## Sentry boundary

Real Sentry ingestion is **not yet validated**.

External validation requires:

- a Sentry account/organization;
- a dedicated PoC project;
- its DSN stored outside Git;
- an actual event/trace sent and visible in that project.

The DSN must not be committed to the repository or copied into normal evidence logs.

The local contract verifies:

- Sentry remains disabled when no DSN exists;
- a supplied DSN must be HTTPS;
- config/evidence redacts the DSN.

Sentry is therefore **not approved as the external backend by POC-12 yet**.

### External test prepared

The branch includes a controlled Sentry external-ingestion test that:

- reads `SENTRY_DSN` only from the GitHub Actions secret environment;
- initializes `@sentry/node` with tracing enabled at 100% sampling for the PoC;
- sends one synthetic controlled exception inside an active span;
- disables default PII collection;
- strips Authorization/Cookie headers if present;
- flushes before process exit;
- prints only the returned Sentry event id and flush status.

The workflow never prints the DSN.

## Security guardrails

- no Authorization headers in logs;
- no passwords, API keys, tokens or secrets in logs;
- trace attributes must not become a dumping ground for request bodies;
- customer content/PII requires explicit allowlisting before logging;
- DSNs/tokens belong in environment/secrets configuration;
- errors may record stack information, but sensitive application context must be filtered first.

## CI evidence

Bootstrap/local validation run:

- GitHub Actions run: `36139191422`;
- local observability tests: PASS;
- monorepo structure: PASS;
- dependency lock committed by GitHub Actions bot:
  `4172c2f6657bcd1f43add2a3a83db8d3a54316dc`.

The permanent workflow uses:

- `pnpm install --frozen-lockfile`;
- read-only repository permissions;
- deterministic local E2E tests.

## Acceptance criteria

| Criterion | Result |
| --- | --- |
| POC-04 monorepo structure preserved | PASS |
| OpenTelemetry dependencies resolve from committed lockfile | PASS |
| W3C trace propagation | PASS |
| API → queue → worker → provider single trace | PASS |
| Error span + exception event | PASS |
| Structured log trace correlation | PASS |
| Secret redaction | PASS |
| Sentry external ingestion | PENDING — requires project/DSN |

## Decision

The local architecture decision is:

- use OpenTelemetry as the trace instrumentation/interoperability layer;
- use structured logs with trace/span correlation;
- keep sensitive-field redaction mandatory;
- keep the external observability backend replaceable.

Sentry remains a candidate backend pending real ingestion validation.

## ADR

Local architecture decision recorded in:

`docs/adr/ADR-012-opentelemetry-structured-observability.md`
