# Epic 0 — Foundation Baseline

- **Date:** 2026-09-25
- **Branch:** `epic/00-foundation`
- **Status:** implementation in progress
- **Business features:** not started

## Approved runtime/tooling baseline

| Area | Baseline |
|---|---|
| Node.js | 24.21.0 |
| pnpm | 12.6.0 |
| Turborepo | 2.11.4 |
| TypeScript | 6.0.3 |
| Web | Next.js 16.3.6 + React 19.2.0 |
| Web styling | Tailwind CSS 4.3.3 + semantic CSS variables |
| API | NestJS 12.1.0 + Fastify 5.12.5 |
| Queue | BullMQ 6.3.4 + ioredis 6.0.0 + Valkey-compatible service |
| Mobile | Expo 57 + Expo Router 57 + React Native 0.86.3 |
| Realtime | Supabase Realtime Broadcast (ADR-006) |
| Observability | OpenTelemetry contracts + Sentry 11.0.0 server baseline |
| Lint | Oxlint 1.85.0 |

## Why TypeScript 6.0.3

Some isolated PoCs used TypeScript 7.x while testing libraries in isolation.

The deployable application validations provide a stronger cross-application compatibility signal:

- validated Next.js candidate: TypeScript 6.0.3;
- validated NestJS/Fastify candidate: TypeScript 6.0.3;
- validated Expo mobile foundation: TypeScript ~6.0.3.

Therefore the initial definitive monorepo standardizes on TypeScript 6.0.3.

A future TypeScript-major upgrade requires a repository-wide compatibility pass rather than independent package drift.

## Naming

Production scaffold names are neutral:

- root: `saas-platform`;
- workspace scope: `@saas/*`.

The historical working product name remains only in source evidence/legacy documents.

## Current package boundaries

```text
apps/
  web/
  api/
  worker/
  mobile/

packages/
  api-client/
  config/
  design-tokens/
  domain-types/
  observability/
  ui-web/
  validation/
```

The observability package is an additional shared boundary justified by ADR-012 and cross-process trace/log requirements.

## Environment variable contract

No values or secrets are committed.

### Shared

- `APP_ENV` = development | staging | production
- `LOG_LEVEL`

### Web

- `NEXT_PUBLIC_API_BASE_URL`

Only values intentionally safe for browser exposure may use `NEXT_PUBLIC_*`.

### API

- `PORT`
- `HOST`
- `DATABASE_URL`

### Worker / queue

- `REDIS_URL`

### Observability

- `SENTRY_DSN`
- `SENTRY_TRACES_SAMPLE_RATE`

The Production trace sample rate is deliberately **not** chosen in this baseline. It remains an explicit operations/capacity decision.

## Rules

- Development, Staging and Production use separate provider resources/secrets.
- Production secrets never enter Git.
- PoC/Sandbox IDs are never promoted into Production configuration.
- API and Worker are independently deployable.
- Worker contains no business job handlers in Epic 0.
- Web/Mobile contain only foundation validation surfaces in Epic 0.
- Domain schemas and feature contracts enter through their owning Epics.
