# POC-02 — Supabase Connection Pooling / Supavisor

## Status

IN PROGRESS.

## Goal

Validate CrewCommand's selected Drizzle/PostgreSQL access layer against the real Supabase project's three connection modes without exposing credentials:

- Direct connection;
- Shared Supavisor Session Pooler;
- Shared Supavisor Transaction Pooler.

## Target project

- Project ref: `obpncbnzwrocvgngtodg`
- Region: `us-east-1`
- PostgreSQL: `17.6`

## Security

Connection strings are stored only in GitHub Actions Secrets:

- `SUPABASE_DIRECT_DATABASE_URL`
- `SUPABASE_SESSION_DATABASE_URL`
- `SUPABASE_TRANSACTION_DATABASE_URL`

The test never prints connection strings.

## Required evidence

For Session and Transaction Poolers:

1. connection succeeds over SSL;
2. simple read succeeds;
3. Drizzle transaction succeeds;
4. transaction-local tenant context via `set_config(..., true)` succeeds;
5. 24 concurrent operations through an application pool of 8 succeed;
6. runtime behavior of named prepared statements is recorded;
7. runtime behavior of session state is recorded.

For Direct:

- success is preferred;
- GitHub-hosted runner IPv6/network reachability failure is informational rather than architectural failure;
- authentication/configuration failures remain test failures.

## Decision intent

CrewCommand's long-running Render API/Workers should prefer a connection mode appropriate for persistent services. Transaction Pooler remains relevant only for short-lived/serverless workloads and must not be used with unsupported session-level assumptions.
