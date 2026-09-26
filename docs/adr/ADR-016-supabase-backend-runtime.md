# ADR-016 — Supabase-only Backend Runtime

- **Status:** Accepted
- **Date:** 2026-09-25
- **Scope:** backend runtime, asynchronous processing and deployment topology
- **Decision owner:** Product Owner

## Context

The previous V1 topology used Render for the NestJS API, background Worker and Valkey/Redis-compatible queue infrastructure, while Supabase already hosted PostgreSQL, Auth, Storage and Realtime.

The Product Owner explicitly decided to remove Render from the current architecture and consolidate backend runtime and data services in Supabase.

At the time of the change, the Render API foundation exposed the Slice 01 identity handoff, while the Worker had zero business job handlers. BullMQ/Valkey had been technically validated but no business workload depended on it.

## Decision

Use Supabase for the complete backend/data plane:

| Capability | Current implementation |
|---|---|
| PostgreSQL | Supabase Postgres |
| Authentication | Supabase Auth |
| Object storage | Supabase Storage |
| Realtime | Supabase Realtime |
| HTTP/server business execution | Supabase Edge Functions |
| Durable asynchronous queue | Supabase Queues / PGMQ |
| Schedules / periodic dispatch | Supabase Cron / `pg_cron` |
| Async DB→HTTP dispatch when required | `pg_net` |
| Web hosting | Vercel |
| Mobile delivery | Expo/EAS |
| CI | GitHub Actions |

**Render is not part of the current runtime topology.**

## Superseded decisions

This ADR supersedes the active production choices in ADR-005, ADR-014 and ADR-015. Those ADRs remain historical records and must not be used to reintroduce Render, BullMQ/Valkey or a persistent Node API/Worker without a later explicit decision.

## HTTP boundary

Business HTTP endpoints run as Edge Functions. They authenticate/authorize server-side, use stable error contracts, keep PostgreSQL authoritative, avoid persistent-process assumptions and preserve idempotency for external side effects.

The first migrated endpoint is `identity-me`, preserving the Slice 01 contract while removing the Render API dependency.

## Background work

Use Supabase Queues (PGMQ) for durable queued work:

- payloads contain IDs/minimal immutable context;
- consumers are idempotent;
- visibility timeout provides retry/re-delivery semantics;
- successful work explicitly deletes or archives messages;
- failed work remains inspectable/retryable;
- critical workflow state remains reconstructable from PostgreSQL;
- queues stay server-only unless a later decision explicitly exposes them.

Use Supabase Cron to schedule dispatch/maintenance only when an owning business handler exists.

## Runtime constraints

Edge Functions are bounded invocations, not persistent workers. Batch queue messages, split large workloads, avoid infinite polling loops and keep retries finite/observable.

A future workload that cannot fit these constraints requires a new architecture decision instead of silently reintroducing an external worker.

## Environment boundaries

Development, Staging and Production remain isolated, with separate Supabase projects/configuration and provider credentials.

## Migration record

On 2026-09-25:

- `pgmq`, `pg_cron` and `pg_net` were enabled;
- Edge Function `identity-me` was deployed;
- Web handoff was changed to invoke the Supabase function;
- active `apps/api` and `apps/worker` deploy units were removed from the workspace;
- Render-specific environment variables and CI smoke tests were removed.

## Guardrails

1. PostgreSQL remains authoritative.
2. No client-side business authorization.
3. Queues/Realtime are delivery mechanisms, not business truth.
4. External side effects require idempotency.
5. Secrets remain server-side.
6. No Render dependency may be added without a new explicit ADR.
7. Historical Render/Valkey evidence is not current implementation guidance.

## Revisit Trigger

> Campo acrescentado em 2026-09-25. É obrigatório pelo §20 do Technical Validation &
> PoC Plan, mas os ADRs anteriores ao 017 foram escritos sem ele.

Reavaliar se ocorrer **qualquer** um destes:

1. um limite do Supabase — conexões, duração de função, tamanho de storage — bloquear um requisito da V1;
2. surgir exigência de residência de dados que o projeto contratado não atenda;
3. o custo do plano crescer além do previsto com o volume real de tenants.
