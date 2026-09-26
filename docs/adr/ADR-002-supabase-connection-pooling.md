# ADR-002 — Supabase Connection Modes and Pooling

- **Status:** Accepted
- **Date:** 2026-09-24
- **Validated by:** POC-02
- **Depends on:** ADR-001 (Drizzle ORM + Drizzle Kit)

## Context

CrewCommand's V1 architecture uses:

- Supabase PostgreSQL;
- Drizzle as the typed PostgreSQL query/migration layer;
- long-running NestJS API and BullMQ Workers on Render;
- Vercel/other short-lived execution contexts where applicable;
- Workspace-scoped RLS as defense in depth.

The selected Supabase project currently runs PostgreSQL 17.6 in `us-east-1` with a `max_connections` value of 60.

Supabase exposes three relevant connection approaches:

1. Direct Postgres;
2. Shared Supavisor Session mode;
3. Shared Supavisor Transaction mode.

## Evidence

POC-02 tested the three connection strings using GitHub Actions secrets against project `obpncbnzwrocvgngtodg`.

Successful run: `36085782384`.

### Direct

The Direct endpoint resolved only IPv6 and was not reachable from the GitHub-hosted runner. This matches Supabase's documented networking model for Direct connections without the IPv4 add-on.

### Session Pooler

Validated successfully over IPv4 and TLS:

- PostgreSQL query execution;
- Drizzle transactions;
- transaction-local tenant context;
- application pool concurrency;
- session semantics.

### Transaction Pooler

Validated successfully over IPv4 and TLS for:

- normal queries;
- Drizzle transactions;
- transaction-local tenant context;
- concurrent short-lived operations.

A prepared statement and session state happened to succeed in the test, but those observations are explicitly **not** accepted as supported behavior. Supabase documents those capabilities as unsupported/unreliable in Shared Supavisor Transaction mode.

## Decision

### Persistent CrewCommand API and Workers

Use this preference order:

1. Direct connection if the deployment network has validated IPv6 reachability and direct Postgres connection usage fits the connection budget.
2. Otherwise use **Shared Supavisor Session mode** for persistent IPv4-connected services.

Session mode is the validated safe choice for the initial Render backend if Direct networking is unavailable.

### Short-lived / serverless connections

Use **Shared Supavisor Transaction mode** only for workloads whose lifecycle and concurrency pattern benefit from transaction pooling.

Code using Transaction mode must:

- avoid named prepared statements;
- avoid session-level assumptions;
- scope tenant state inside each transaction using transaction-local `set_config`.

### Migrations and operational tooling

Prefer Direct connection. When the execution environment cannot reach the IPv6 Direct endpoint, use Session Pooler only where the operation is supported and documented.

## Rationale

This policy preserves the advantages of Direct Postgres for persistent infrastructure when available while providing a proven IPv4-compatible path through Session mode. It avoids treating Transaction mode as a universal connection string and protects CrewCommand from subtle bugs caused by session-state assumptions.

## Consequences

### Positive

- Works with the current Supabase network topology.
- Supports persistent Render services without buying an IPv4 add-on solely for initial connectivity.
- Tenant transaction context is validated.
- Separates persistent and transient workload connection strategies.
- Prevents accidental dependency on unsupported Transaction-mode features.

### Trade-offs

- Runtime/deployment configuration has more than one connection mode.
- Application pool sizes must be coordinated with horizontal replica counts.
- Direct connectivity must be revalidated in the actual Render environment.
- Session Pooler adds a network hop compared with Direct Postgres.

## Guardrails

1. Never place database URLs in source control.
2. Production credentials live only in secret management.
3. TLS is required for external database connectivity.
4. Pool sizes are explicit and conservative.
5. Transaction mode must not use named prepared statements or rely on session affinity.
6. Tenant context is set inside the transaction, not once per pooled connection.
7. Observe database and pooler connections before increasing replica or pool counts.
8. Migrations remain versioned in Git regardless of connection mode.

## Evidence reference

- POC: `docs/poc/POC-02.md`
- Functional run: `36085782384`
- Supabase project: `obpncbnzwrocvgngtodg`

## Revisit Trigger

> Campo acrescentado em 2026-09-25. É obrigatório pelo §20 do Technical Validation &
> PoC Plan, mas os ADRs anteriores ao 017 foram escritos sem ele.

Reavaliar se ocorrer **qualquer** um destes:

1. **gatilho já disparado em parte:** esta decisão foi escrita para uma API e workers persistentes no Render, que o ADR-016 removeu. A execução agora é serverless no Vercel, cujo perfil de conexão é outro. A ordem de preferência abaixo precisa ser reavaliada no Epic 0, item 8, ao configurar Drizzle Kit com conexão direta para migration e pooler transaction para runtime;
2. o orçamento de conexões ser excedido sob carga real;
3. a latência acrescentada pelo pooler passar a aparecer no p95 de uma rota de produto.
