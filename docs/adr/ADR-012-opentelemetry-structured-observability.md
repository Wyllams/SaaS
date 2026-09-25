# ADR-012 — OpenTelemetry + Structured Observability

- **Status:** Accepted for local instrumentation architecture
- **Date:** 2026-09-25
- **Validated by:** POC-12
- **External backend status:** Open — Sentry ingestion not yet validated

## Context

The SaaS needs end-to-end observability across application requests, background jobs and external-provider operations.

The architecture must:

- preserve trace context across asynchronous boundaries;
- correlate application logs to traces;
- represent failures without leaking secrets;
- avoid hard-coding one observability vendor into application code;
- support a future external backend such as Sentry.

## Decision

Use **OpenTelemetry** as the trace instrumentation and propagation layer.

Use **structured application logs** that include active `trace_id` and `span_id` where a trace context exists.

Use W3C Trace Context for propagation across process/message boundaries.

Keep exporter/backend selection outside business logic.

## Evidence

POC-12 locally validated this trace:

`API request → queue publish → worker job → provider call`

Evidence demonstrated:

- one trace id across all spans;
- W3C `traceparent` inject/extract across the simulated queue;
- correct producer → consumer parentage;
- child provider span under worker execution;
- controlled exception recorded on the provider span;
- ERROR span status for the failed provider operation;
- JSON logs correlated with trace/span ids;
- secret redaction before log emission.

## Logs decision

Structured application logging is accepted.

Do not make the OpenTelemetry Logs SDK a required application dependency at this stage.

Reason: the current OpenTelemetry JavaScript status documents Traces as Stable while Logs remain Development.

A future logging bridge/exporter may translate the structured logs to the selected backend without changing business logging semantics.

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

## External backend boundary

This ADR does **not** select Sentry as the final observability backend.

Sentry remains a candidate because a real external validation requires:

- project creation;
- DSN;
- provider-side ingestion evidence.

No backend-specific DSN, token or project identifier belongs in source control.

Once external ingestion is validated, a follow-up ADR or amendment may approve the backend/exporter configuration.

## Consequences

### Positive

- vendor-neutral instrumentation;
- trace continuity across API and worker boundaries;
- logs can link directly to traces;
- observability security rules are explicit;
- backend replacement remains possible.

### Trade-offs

- exporter/backend configuration still needs a production decision;
- log correlation requires logging discipline;
- asynchronous propagation must be implemented consistently;
- vendor-specific features cannot be assumed until a backend is selected.

## Guardrails

1. OpenTelemetry context is infrastructure, not business state.
2. Use W3C Trace Context for propagation.
3. No secrets in logs or span attributes.
4. No full payload logging by default.
5. Structured logs include trace/span ids when active.
6. External exporter failures must not break business workflows.
7. Sampling policy must be explicit before production.
8. Sentry or another backend requires separate external validation.
