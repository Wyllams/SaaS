# Local Bootstrap

- **Date:** 2026-09-25
- **Target:** Development only
- **Authority:** ADR-016

## Prerequisites

- Git
- Node.js 24.21.0
- Corepack
- pnpm 12.6.0
- Supabase local tooling only when local backend execution/database work is required

## Install and validate

```bash
corepack enable
corepack prepare pnpm@12.6.0 --activate
pnpm install --frozen-lockfile
pnpm run ci
```

## Web

```bash
pnpm --filter @saas/web dev
```

Set only browser-safe Development values for:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

## Supabase backend

Backend source lives in:

- `supabase/functions` — Edge Functions;
- `supabase/migrations` — Supabase/PostgreSQL infrastructure;
- `packages/db` — domain schema/migration tooling retained by the project.

The hosted runtime supplies `SUPABASE_URL`, `SUPABASE_ANON_KEY` and `SUPABASE_DB_URL`. Do not copy hosted database credentials into browser configuration.

Queues and schedules use PGMQ/pg_cron inside Supabase. There is no local Redis/Valkey worker requirement in the current architecture.

## Mobile

```bash
pnpm --filter @saas/mobile start
```

## Safety

Use synthetic Development data, never commit `.env` files, never reuse Production secrets and never expose server-only Supabase/provider credentials to Web/Mobile.
