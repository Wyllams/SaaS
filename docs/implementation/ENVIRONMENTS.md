# Environments — Development, Staging and Production

- **Authority:** ADR-016
- **Date:** 2026-09-25
- **Status:** approved current contract

## Principles

1. Development, Staging and Production are separate security boundaries.
2. Production credentials are never reused elsewhere.
3. PostgreSQL remains authoritative.
4. Supabase is the backend/data platform in every hosted environment.
5. Web remains on Vercel and Mobile on Expo/EAS.
6. Render is not part of the current topology.

## Development

- Web may run locally.
- Supabase may run locally through Supabase tooling or use a dedicated Development project.
- Edge Functions are developed under `supabase/functions`.
- Queues/Cron are PostgreSQL modules, not external Redis/worker services.
- Use synthetic data and Sandbox/Test provider modes.

## Staging

| Capability | Provider / region |
|---|---|
| Web | Vercel / US East |
| PostgreSQL/Auth/Storage/Realtime | Supabase / `us-east-1` |
| HTTP/backend | Supabase Edge Functions |
| Queue | Supabase Queues / PGMQ |
| Schedules | Supabase Cron / pg_cron |
| Mobile preview | Expo EAS |
| CI | GitHub Actions |
| Error monitoring/tracing | Sentry + OpenTelemetry where supported |

## Production

Production uses separate Supabase/Vercel/provider resources, secrets, backup/restore configuration, monitoring and runbooks. No Staging/Sandbox credential is promoted.

## Variable contract

| Variable | Surface | Classification |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Web | public configuration |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Web | public/publishable configuration |
| `SUPABASE_URL` | Edge Functions | provided by Supabase runtime |
| `SUPABASE_ANON_KEY` | Edge Functions | provided by Supabase runtime |
| `SUPABASE_DB_URL` | Edge Functions | server-only, provided by Supabase runtime |
| `SENTRY_DSN` | server/runtime when enabled | secret/config |
| `SENTRY_TRACES_SAMPLE_RATE` | observability | non-secret explicit per environment |

There is no current `NEXT_PUBLIC_API_BASE_URL`, `REDIS_URL`, Render `PORT` or Render `HOST` contract.

## Capacity decisions still open

Instance/compute sizing, budgets, custom domains, backup retention, mobile bundle IDs and final tracing sample rates remain release/capacity decisions.
