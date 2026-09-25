# POC-05 — BullMQ + Valkey

## Status

**PASS — BullMQ + Valkey accepted for background job infrastructure.**

## Goal

Validate BullMQ with a Redis-compatible Valkey runtime for CrewCommand background jobs without treating the queue store as the system of record.

## Versions validated

- BullMQ 6.3.4
- Valkey 8.1.10
- ioredis 6.0.0
- Node.js 24.21.0

## Evidence

GitHub Actions run `36083099188` completed successfully against a real `valkey/valkey:8.1.10-alpine` service container.

Validated:

1. transient failures retried with backoff until success;
2. application-level idempotency prevented duplicate side effects;
3. delayed jobs executed after the configured delay;
4. worker concurrency respected the configured limit, reaching `maxActive = 3`;
5. jobs queued before a worker existed were recovered and processed later;
6. permanently failing jobs remained persisted in failed state for inspection;
7. strict TypeScript compilation succeeded;
8. the server identified itself as `server_name: valkey` and `valkey_version: 8.1.10`.

Runtime result:

```json
{
  "candidate": "bullmq-valkey",
  "bullmq": "6.3.4",
  "valkey": "8.1.10",
  "retryBackoff": "PASS",
  "idempotency": "PASS",
  "delayedJobs": "PASS",
  "concurrency": { "status": "PASS", "maxActive": 3 },
  "recovery": "PASS",
  "permanentFailurePersistence": "PASS"
}
```

## Decision

Use **BullMQ** for background job orchestration and a **Redis-compatible Valkey/Redis service** as the queue/cache transport.

The architecture depends on BullMQ's Redis protocol requirements, not on Redis being a source of truth.

## Guardrails

1. PostgreSQL remains the authoritative business-data store.
2. Queue payloads carry identifiers and immutable execution context, not canonical business state.
3. Jobs that can be delivered more than once must be idempotent.
4. External side effects require application-level idempotency keys.
5. Retry/backoff policies are explicit per job category.
6. Permanently failing jobs remain inspectable and must surface operational alerts.
7. Redis/Valkey eviction must never cause loss of authoritative business records.
8. Delayed/scheduled work uses BullMQ only when the operational semantics fit; critical durable schedules must also be reconstructable from PostgreSQL.
9. Queue connectivity must use TLS/authentication in hosted environments.

## Render / hosted validation status

The protocol/runtime behavior is validated against Valkey 8.1.10 in CI. A specific hosted Render Key Value instance is not required to accept the architecture; provider-specific networking/TLS is a deployment configuration check.

## ADR

Decision recorded in `docs/adr/ADR-005-bullmq-valkey-background-jobs.md`.
