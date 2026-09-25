# Environments — Development, Staging and Production

- **Authority:** ADR-015
- **Date:** 2026-09-25
- **Status:** approved contract
- **External Staging provisioning:** not executed by this document

## Principles

1. Development, Staging and Production are separate security boundaries.
2. Production credentials are never reused in Development or Staging.
3. Sandbox/Test provider identities are never promoted to Production.
4. Stateful region changes require an explicit migration plan.
5. Final product branding is not encoded in infrastructure names until branding is approved.

## Development

Purpose:

- local implementation;
- automated tests;
- synthetic data;
- provider Sandbox/Test use when needed.

Expected execution:

- Web, API and Worker may run locally;
- PostgreSQL/Valkey may be local or dedicated Development resources;
- no real customer data;
- no Production financial credentials.

## Staging

Purpose:

- production-like integration;
- end-to-end validation;
- release gate before Production.

Topology from ADR-015:

| Capability | Provider / region |
|---|---|
| Web | Vercel / US East |
| API | Render Web Service / Virginia |
| Worker | Render Background Worker / Virginia |
| Queue | Render Key Value / Virginia |
| PostgreSQL/Auth/Storage/Realtime | Supabase / North Virginia `us-east-1` |
| Mobile preview | Expo EAS |
| CI | GitHub Actions |
| Error Monitoring / Tracing | Sentry + OpenTelemetry |

Staging uses provider Sandbox/Test modes and does not process real customer payments.

## Production

Production is a fully separate environment with:

- separate provider resources;
- separate secrets;
- separate database/storage/queue;
- Production payment/accounting credentials only after their release gates;
- monitoring/alerts;
- backup/restore policy;
- runbooks and incident response.

## Variable contract

| Variable | Surface | Classification |
|---|---|---|
| `APP_ENV` | API / Worker | non-secret |
| `LOG_LEVEL` | API / Worker | non-secret |
| `NEXT_PUBLIC_API_BASE_URL` | Web | public browser configuration |
| `PORT` | API | non-secret/runtime |
| `HOST` | API | non-secret/runtime |
| `DATABASE_URL` | API / migrations | secret |
| `REDIS_URL` | Worker / queue clients | secret |
| `SENTRY_DSN` | server observability | environment configuration; store as secret/config, never hard-code |
| `SENTRY_TRACES_SAMPLE_RATE` | observability | non-secret, explicit per environment |

Future provider credentials are added only by the Epic that owns the integration.

## Production values deliberately not decided in Epic 0

- instance sizes;
- autoscaling thresholds;
- HA counts;
- monthly budgets;
- custom domains;
- backup retention tiers;
- final mobile bundle identifiers;
- Production tracing sample rate.

These require measured capacity/release decisions, as defined by the TRD.
