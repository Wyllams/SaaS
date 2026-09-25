# ADR-005 — BullMQ + Valkey/Redis for Background Jobs

- **Status:** Accepted
- **Date:** 2026-09-24
- **Validated by:** POC-05

## Context

CrewCommand needs background processing for work that should not block HTTP request latency, including notifications, webhook handling, document/media processing, integration syncs and retryable external calls.

The architecture also requires:

- retries and backoff;
- delayed jobs;
- concurrency control;
- idempotency;
- recoverability after workers restart;
- inspection of permanently failed work;
- PostgreSQL remaining the source of truth.

## Decision

Use **BullMQ** as the background job framework and a **Redis-compatible Valkey/Redis service** as its queue/cache infrastructure.

Valkey compatibility is explicitly accepted because the PoC validated BullMQ 6.3.4 against Valkey 8.1.10.

## Rationale

POC-05 demonstrated:

- retry/backoff to eventual success;
- application-level idempotency under duplicate delivery;
- delayed execution;
- configured worker concurrency;
- processing recovery when workers start after jobs were enqueued;
- persistence/inspection of permanently failed jobs;
- strict TypeScript compatibility.

The queue system therefore satisfies the core V1 execution semantics without becoming an authoritative data store.

## Consequences

### Positive

- mature retry, delay and concurrency primitives;
- independent API and worker scaling;
- compatibility with Redis-protocol infrastructure including Valkey;
- clear operational model for failed jobs.

### Trade-offs

- introduces a second stateful infrastructure dependency in addition to PostgreSQL;
- queue data needs operational monitoring and backup/reconstruction thinking;
- at-least-once-style delivery requires idempotent job design;
- provider-specific TLS/auth/network configuration remains deployment work.

## Guardrails

- PostgreSQL is authoritative.
- Queue payloads prefer IDs over embedded mutable domain state.
- Idempotency keys are required for externally visible side effects.
- Retry policies are finite and explicit.
- Failed jobs are observable and actionable.
- Business workflows that must survive queue loss must be reconstructable from PostgreSQL.

## Evidence

- GitHub Actions run `36083099188`;
- BullMQ 6.3.4;
- Valkey 8.1.10;
- all retry/idempotency/delay/concurrency/recovery/failure checks passed.
