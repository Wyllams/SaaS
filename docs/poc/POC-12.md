# POC-12 — Observability E2E

## Status

**IN PROGRESS — local OpenTelemetry + structured-log validation prepared; CI and real Sentry ingestion pending.**

## Goal

Validate an end-to-end observability contract for the SaaS without tying the architecture to the final product name.

The PoC focuses on the scope already defined for POC-12:

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

## Local E2E scenario

The test scenario models:

`API request → queue publish → worker job → provider call`

The trace crosses the simulated queue boundary through the W3C `traceparent` header.

Acceptance requires:

1. all four spans share one trace id;
2. queue-to-worker parentage is preserved after inject/extract;
3. structured logs contain `trace_id` and `span_id`;
4. a controlled provider failure produces an exception event and ERROR span status;
5. authorization/password/token-like fields are redacted from logs.

## Signal scope

### Traces

OpenTelemetry tracing is the primary interoperability layer for this PoC.

### Logs

The PoC uses structured application logs correlated with the active OpenTelemetry span.

OpenTelemetry JavaScript log SDK support is not treated as a production requirement by this PoC because the current OpenTelemetry JavaScript documentation still classifies Logs as **Development**, while Traces are **Stable**.

This does not prevent a future logging bridge/exporter decision.

## Sentry boundary

Real Sentry ingestion is **not validated locally**.

External validation requires:

- a Sentry account/organization;
- a dedicated PoC project;
- its DSN stored outside Git;
- an actual event/trace sent and visible in the Sentry project.

The DSN must not be committed to the repository or copied into normal evidence logs.

The local contract only verifies that:

- Sentry remains disabled when no DSN exists;
- a supplied DSN must be an HTTPS URL;
- evidence/config output redacts the DSN.

## Security guardrails

- no Authorization headers in logs;
- no passwords, API keys, tokens or secrets in logs;
- trace attributes must not become a dumping ground for request bodies;
- customer content/PII requires explicit allowlisting before logging;
- DSNs/tokens belong in environment/secrets configuration;
- errors may record stack information, but sensitive application context must be filtered first.

## CI acceptance criteria

| Criterion | Status |
| --- | --- |
| POC-04 monorepo structure preserved | PENDING |
| OpenTelemetry dependencies resolve from committed lockfile | PENDING |
| W3C trace propagation | PENDING |
| API → queue → worker → provider single trace | PENDING |
| Error span + exception event | PENDING |
| Structured log trace correlation | PENDING |
| Secret redaction | PENDING |
| Sentry external ingestion | BLOCKED — requires project/DSN |

## Decision gate

The local OpenTelemetry/logging architecture may be accepted after CI passes.

Sentry itself must remain **unapproved as the external backend** until a real project/DSN ingestion test is performed.
