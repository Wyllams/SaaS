# Staging Bootstrap Contract

- **Date:** 2026-09-25
- **Authority:** ADR-016
- **Purpose:** production-like validation with synthetic/test data

## Required topology

1. isolated Supabase Staging project in `us-east-1`;
2. PostgreSQL/Auth/Storage/Realtime in that project;
3. Edge Functions deployed from `supabase/functions`;
4. PGMQ + pg_cron (+ pg_net when required) enabled through versioned migrations;
5. Vercel Staging/Preview Web configured with the Staging Supabase URL + publishable key;
6. Sentry Staging configuration where observability is enabled;
7. Expo EAS Preview when mobile validation is required;
8. GitHub Actions as CI.

No Render API, Render Worker, Render Key Value, Redis or Valkey resource is required.

## Order

### 1. Supabase project

Create/identify isolated Staging. Keep secrets in secret stores.

### 2. Database modules and migrations

Apply reviewed migrations. Verify required extensions and RLS/constraints. Never create business schema manually as an undocumented dashboard-only change.

### 3. Edge Functions

Deploy approved functions. Verify auth behavior, error safety and logs without secrets.

### 4. Queues/Cron

Create only queues/schedules owned by an implemented business handler. Do not expose queues to client-side Data API by default.

### 5. Web

Configure Vercel with:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

There is no separate backend base URL.

## Acceptance

- CI passes from committed lockfile;
- Web/Mobile builds are reproducible;
- Supabase migrations are versioned;
- required Edge Functions are deployed;
- queues/schedules match implemented handlers only;
- secrets are isolated;
- no Production credentials or real customer/payment data are used.
