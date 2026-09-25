# POC-12 — Observability E2E

## Status

**PASS — local OpenTelemetry/structured-log contract and real Sentry error + tracing ingestion validated.**

## Goal

Validate an end-to-end observability contract for the SaaS without tying the architecture to the final product name.

The PoC proves:

- OpenTelemetry trace propagation works across asynchronous boundaries;
- application logs can be structured and correlated to traces;
- controlled errors can be represented in trace data;
- sensitive fields are redacted before logging;
- Sentry can receive a real controlled error and trace from the PoC through a DSN stored outside Git.

## Repository basis

This branch is based on **POC-04 — Monorepo Foundation**.

The experiment lives under:

`packages/observability-poc/`

No Web/API framework scaffold is introduced by this PoC.

## Validated stack

- `@opentelemetry/api` 1.9.1;
- `@opentelemetry/core` 2.11.0;
- `@opentelemetry/context-async-hooks` 2.11.0;
- `@opentelemetry/sdk-trace` 2.11.0;
- `@sentry/node` 11.0.0;
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

The OpenTelemetry Logs SDK is not a required application dependency at this stage. The application logging contract remains structured and trace-correlated without coupling business logging semantics to one exporter.

### Errors / external backend

Sentry is validated as the initial external backend for **Error Monitoring + Tracing**.

This PoC does not enable or validate Sentry Logs, Profiling or Application Metrics.

## Real Sentry evidence

A dedicated Node.js PoC project was created with:

- Error Monitoring: enabled;
- Tracing: enabled;
- Logging: disabled;
- Profiling: disabled;
- Application Metrics: disabled.

The DSN was stored only as the GitHub Actions secret:

`SENTRY_DSN`

External ingestion workflow:

- GitHub Actions run: `36141832058`;
- controlled exception sent inside an active Sentry span: PASS;
- `Sentry.flush()`: PASS;
- returned event id: `b7b35cc8e06144dc93e0dd9baba8e1a2`;
- provider-side visual confirmation: PASS — Sentry Issues displayed `POC-12 controlled Sentry ingestion test`;
- Sentry issue feed showed 1 ingested event for the synthetic PoC issue;
- DSN was not printed by the workflow;
- resolved Sentry dependency lock committed by GitHub Actions bot:
  `b99c796a2ccbda69429c0ce5d17b6c2e3ab39cd4`.

The synthetic error message used only for this PoC is:

`POC-12 controlled Sentry ingestion test`

## Security guardrails

- no Authorization headers in logs;
- no cookies, passwords, API keys, tokens or secrets in logs;
- trace attributes must not become a dumping ground for request bodies;
- customer content/PII requires explicit allowlisting before logging;
- DSNs/tokens belong in environment/secrets configuration;
- Sentry default PII collection is disabled in the external proof;
- the DSN is never committed to Git or printed in evidence logs.

## CI evidence

Local observability validation:

- GitHub Actions run: `36139191422`;
- local observability tests: PASS;
- monorepo structure: PASS;
- OpenTelemetry dependency lock:
  `4172c2f6657bcd1f43add2a3a83db8d3a54316dc`.

External Sentry validation:

- GitHub Actions run: `36141832058`;
- external error + trace ingestion: PASS;
- flush: PASS;
- Sentry dependency lock:
  `b99c796a2ccbda69429c0ce5d17b6c2e3ab39cd4`.

The permanent workflows use committed dependencies with `pnpm install --frozen-lockfile` and read-only repository permissions.

The external Sentry workflow is manual-only (`workflow_dispatch`) so normal pushes do not create synthetic Sentry issues.

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
| Sentry project created with Error Monitoring + Tracing | PASS |
| Real Sentry controlled-error ingestion | PASS |
| Real Sentry trace-enabled SDK execution | PASS |
| DSN kept outside Git | PASS |
| Sentry flush before process exit | PASS |

## Decision

Use:

- **OpenTelemetry** as the trace instrumentation/interoperability layer;
- **W3C Trace Context** for propagation across process/message boundaries;
- **structured logs** correlated with trace/span ids;
- **Sentry** as the initial external backend for Error Monitoring + Tracing.

Keep exporter/backend concerns outside business logic so the observability backend remains replaceable.

## ADR

Decision recorded in:

`docs/adr/ADR-012-opentelemetry-structured-observability.md`
