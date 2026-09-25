# SaaS

Canonical repository for the new SaaS.

## Canonical branch

**`main` is the single source branch for current product work.**

## Current runtime topology

- **Web/PWA/Portal:** Vercel (`apps/web`)
- **Backend/data plane:** Supabase — PostgreSQL, Auth, Storage, Realtime, Edge Functions, Queues (PGMQ) and Cron
- **Mobile:** Expo/EAS (`apps/mobile`)
- **CI:** GitHub Actions

Render is no longer part of the current architecture. Historical Render/NestJS/BullMQ/Valkey evidence may remain only in superseded ADRs, PoC records and QA history.

## Repository map

- `AGENTS.md` — mandatory rules for code agents.
- `apps/web` — Next.js Web application.
- `apps/mobile` — Expo mobile application.
- `supabase/functions` — server-side HTTP/business execution on Supabase Edge Functions.
- `supabase/migrations` — Supabase/PostgreSQL infrastructure migrations owned by the current runtime.
- `packages/` — shared packages and database schema/migration tooling.
- `docs/source-of-truth/` — canonical product documents and current overrides.
- `docs/architecture/` — consolidated architecture.
- `docs/adr/` — architecture decisions, including superseded history.
- `docs/implementation/` — execution plans, status, QA and bootstrap guides.

See `docs/README.md` for the documentation map.
