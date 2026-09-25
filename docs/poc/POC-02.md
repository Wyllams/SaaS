# POC-02 — Supabase Connection Pooling / Supavisor

## Status

**PASS — connection strategy validated against the real CrewCommand Supabase project.**

## Goal

Validate CrewCommand's selected Drizzle/PostgreSQL access layer against the real Supabase project's connection modes without exposing credentials:

- Direct connection;
- Shared Supavisor Session Pooler;
- Shared Supavisor Transaction Pooler.

## Target project

- Project ref: `obpncbnzwrocvgngtodg`
- Region: `us-east-1`
- PostgreSQL: `17.6`
- Project status during validation: `ACTIVE_HEALTHY`

## Security

Connection strings are stored only in GitHub Actions Secrets:

- `SUPABASE_DIRECT_DATABASE_URL`
- `SUPABASE_SESSION_DATABASE_URL`
- `SUPABASE_TRANSACTION_DATABASE_URL`

The test never prints a connection string or password.

## Evidence

GitHub Actions run `36085782384` completed successfully against the real Supabase project.

### Direct connection

- DNS family observed: IPv6 only (`[6]`)
- GitHub-hosted runner connectivity: unavailable
- Failure stage: first/base query
- Interpretation: expected network limitation for the project Direct endpoint from this runner, not an authentication or database failure

Supabase documents the Direct endpoint as IPv6 by default unless an IPv4 add-on is enabled.

### Shared Supavisor — Session mode

- DNS family: IPv4
- Reachable: PASS
- PostgreSQL: 17.6
- Client TLS: PASS
- First query: ~360.09 ms from the GitHub-hosted runner
- Drizzle transaction: PASS
- Transaction-local Workspace context with `set_config(..., true)`: PASS
- 24 concurrent operations through application pool max 8: PASS
- Concurrent batch elapsed: ~457.68 ms
- Named prepared statement probe: observed as supported
- Session-state probe: observed as persisted

The observed capability results align with Session mode's documented session semantics.

### Shared Supavisor — Transaction mode

- DNS family: IPv4
- Reachable: PASS
- PostgreSQL: 17.6
- Client TLS: PASS
- First query: ~204.87 ms from the GitHub-hosted runner
- Drizzle transaction: PASS
- Transaction-local Workspace context with `set_config(..., true)`: PASS
- 24 concurrent operations through application pool max 8: PASS
- Concurrent batch elapsed: ~420.92 ms
- Named prepared statement probe: happened to succeed during this low-load run
- Session-state probe: happened to persist during this low-load run

**Important:** those last two observations are not treated as supported capabilities. Current Supabase documentation states that Shared Supavisor Transaction mode does not support prepared statements or session-level state semantics reliably. Backend code must not depend on those observations.

## Decision

CrewCommand will use this connection policy:

1. **Persistent API / Workers**
   - Prefer Direct connection when the deployment environment has validated IPv6 reachability and connection capacity is appropriate.
   - Use **Supavisor Session mode** as the validated IPv4-compatible default/fallback for persistent Render services.
   - Application-side pooling remains configured with conservative limits per service replica.

2. **Migrations / database administration**
   - Prefer Direct connection when reachable.
   - If the execution network is IPv4-only, use Session Pooler when the operation is supported by Supabase guidance rather than forcing Transaction mode.

3. **Serverless / short-lived workloads**
   - Use **Supavisor Transaction mode** where high transient concurrency justifies it.
   - Disable/avoid named prepared statements.
   - Never rely on session-level `SET`, temporary session state, `LISTEN/NOTIFY`, advisory locks or similar session affinity.

4. **Tenant context**
   - CrewCommand's database tenant context uses transaction-local state (`set_config(..., true)`) inside each database transaction.
   - This exact pattern was validated on both Session and Transaction poolers.

## Connection-budget guardrails

The current project reported `max_connections = 60`. Supabase platform services consume part of that budget, so CrewCommand must not allocate arbitrary large pools per API/Worker replica.

Initial pool sizes will be conservative and tuned from measured production concurrency. Horizontal scaling decisions must account for:

`replicas × app_pool_max + Supabase/platform connections <= safe database connection budget`.

## What this PoC does not claim

- It is not a production load test.
- GitHub runner latency is not representative of Render Virginia latency.
- It does not prove unlimited pooler capacity.
- It does not override documented Supavisor feature restrictions.
- It does not require or justify the Supabase IPv4 add-on.

## ADR

Decision recorded in `docs/adr/ADR-002-supabase-connection-pooling.md`.
