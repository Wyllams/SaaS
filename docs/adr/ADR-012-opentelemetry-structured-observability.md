# ADR-012 — OpenTelemetry + Structured Observability with Sentry

- **Status:** Accepted
- **Date:** 2026-09-25
- **Validated by:** POC-12
- **Initial external backend:** Sentry for Error Monitoring + Tracing

## Context

The SaaS needs end-to-end observability across application requests, background jobs and external-provider operations.

The architecture must:

- preserve trace context across asynchronous boundaries;
- correlate application logs to traces;
- represent failures without leaking secrets;
- avoid hard-coding vendor-specific concerns into business logic;
- support a real external monitoring backend.

## Decision

Use **OpenTelemetry** as the trace instrumentation and propagation layer.

Use **structured application logs** that include active `trace_id` and `span_id` where a trace context exists.

Use **W3C Trace Context** for propagation across process/message boundaries.

Use **Sentry** as the initial external backend for:

- Error Monitoring;
- Tracing.

Sentry Logs, Profiling and Application Metrics are not selected by this ADR.

Keep exporter/backend selection outside business logic.

## Evidence

POC-12 locally validated this trace:

`API request → queue publish → worker job → provider call`

Local evidence demonstrated:

- one trace id across all spans;
- W3C `traceparent` inject/extract across the simulated queue;
- correct producer → consumer parentage;
- child provider span under worker execution;
- controlled exception recorded on the provider span;
- ERROR span status for the failed provider operation;
- JSON logs correlated with trace/span ids;
- secret redaction before log emission.

Real Sentry evidence:

- GitHub Actions run `36141832058`;
- dedicated Node.js PoC project;
- Error Monitoring enabled;
- Tracing enabled;
- controlled exception sent inside an active Sentry span;
- `Sentry.flush()` completed successfully;
- Sentry event id `b7b35cc8e06144dc93e0dd9baba8e1a2`;
- DSN sourced only from the GitHub Actions `SENTRY_DSN` secret.

## Logs decision

Structured application logging is accepted.

Do not make the OpenTelemetry Logs SDK or Sentry Logs a required application dependency at this stage.

Application logs remain structured and trace-correlated so a future log exporter/backend can be added without changing business logging semantics.

## Sensitive data

Observability data must be treated as a data-exfiltration surface.

At minimum, redact:

- Authorization values;
- cookies;
- passwords;
- API keys;
- secrets;
- access/refresh tokens;
- DSNs where exposed through server configuration.

Do not log full request/response bodies by default.

Customer PII requires an explicit approved logging policy.

Sentry initialization should keep default PII collection disabled unless a future explicit requirement justifies changing it.

## Async propagation

Background work must preserve distributed trace context.

When queue jobs or other messages cross execution boundaries, propagate standard OpenTelemetry/W3C context metadata rather than application-specific trace identifiers.

Consumer/worker spans must continue the originating trace when valid context exists.

## Error handling

Expected error observability includes:

- exception/event representation on the relevant span;
- error status where the operation itself failed;
- structured error logs containing operational identifiers, not secrets.

A parent operation that successfully accepted asynchronous work may remain successful even when a later background operation fails.

## Sentry boundary

Sentry is the initial external backend, not a business-layer dependency.

Requirements:

- DSN stored only in environment/secret configuration;
- no DSN in Git;
- no Sentry project identifiers required in business models;
- exporter/client failure must not break business workflows;
- synthetic external checks run manually, not on every push;
- production sampling policy must be explicitly configured before launch.

## Consequences

### Positive

- vendor-neutral trace instrumentation;
- trace continuity across API and worker boundaries;
- logs can link directly to traces;
- real external error/tracing visibility is proven;
- observability security rules are explicit;
- future backend replacement remains possible.

### Trade-offs

- Sentry configuration adds an external operational dependency;
- log correlation requires logging discipline;
- asynchronous propagation must be implemented consistently;
- production sampling and retention/cost policies still need explicit values.

## Guardrails

1. OpenTelemetry context is infrastructure, not business state.
2. Use W3C Trace Context for propagation.
3. No secrets in logs or span attributes.
4. No full payload logging by default.
5. Structured logs include trace/span ids when active.
6. External exporter failures must not break business workflows.
7. Sampling policy must be explicit before production.
8. Keep Sentry SDK initialization/configuration outside business-domain logic.
9. Store `SENTRY_DSN` only in secure environment/secret configuration.
10. Do not enable additional Sentry products implicitly; validate them separately if needed.

## Revisit Trigger

> Campo acrescentado em 2026-09-25. É obrigatório pelo §20 do Technical Validation &
> PoC Plan, mas os ADRs anteriores ao 017 foram escritos sem ele.

Reavaliar se ocorrer **qualquer** um destes:

1. o custo por span ultrapassar o orçamento de observabilidade;
2. o backend de ingestão deixar de aceitar OTLP sem tradução;
3. a correlação entre log e trace deixar de funcionar na fronteira serverless, onde o contexto de execução é diferente do de um processo persistente.
