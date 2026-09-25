# Epic 0 — Foundation Baseline

- **Date:** 2026-09-25
- **Status:** current baseline after Supabase backend migration
- **Authority:** ADR-016

## Runtime/tooling baseline

| Area | Baseline |
|---|---|
| Node.js | 24.21.0 |
| pnpm | 12.6.0 |
| Turborepo | 2.11.4 |
| TypeScript | 6.0.3 |
| Web | Next.js 16 + React 19 / Vercel |
| Styling | Tailwind CSS 4 + semantic CSS variables |
| Backend HTTP | Supabase Edge Functions |
| Database/Auth/Storage/Realtime | Supabase |
| Queue | Supabase Queues / PGMQ |
| Scheduling | Supabase Cron / pg_cron |
| Mobile | Expo 57 + Expo Router |
| Observability | OpenTelemetry contracts + Sentry where supported |
| Lint | Oxlint |

## Current structure

```text
apps/
  web/
  mobile/

supabase/
  functions/
    identity-me/
  migrations/

packages/
  api-client/
  config/
  db/
  design-tokens/
  domain-types/
  observability/
  ui-web/
  validation/
```

`apps/api` and `apps/worker` are no longer deployable units. Their former NestJS/Fastify and BullMQ/Valkey foundation is superseded by ADR-016.

## Environment contract

Web:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

Hosted Edge Functions receive Supabase runtime variables such as `SUPABASE_URL`, `SUPABASE_ANON_KEY` and `SUPABASE_DB_URL`. Additional provider secrets are added only by the owning Epic.

## Foundation rules

- separate Development/Staging/Production projects and secrets;
- no production secret in Git/client bundles;
- Edge Functions are bounded invocations, not persistent workers;
- Queues/PGMQ is server-side by default;
- jobs are idempotent and use PostgreSQL as authoritative state;
- no Render, Redis/Valkey or BullMQ dependency without a new ADR.
