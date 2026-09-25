# ADR-015 — Deployment Topology and Environment Boundaries

- **Status:** Superseded by ADR-016
- **Date:** 2026-09-25
- **Scope:** Epic 0 infrastructure topology
- **Branding:** neutral; no final product name assumed

## Supersession notice

This decision remains historical evidence of what was validated. It is no longer the active production architecture after the Product Owner decision of 2026-09-25. The current backend runtime is defined by **ADR-016**: Supabase Edge Functions + Supabase Queues (PGMQ) + Supabase Cron, with no Render runtime dependency.

## Context

The approved TRD defined the V1 infrastructure direction as:

- Web/PWA/Portal on Vercel;
- API on Render;
- Workers on Render;
- queue/cache on Render Key Value;
- PostgreSQL/Auth/Storage/Realtime on Supabase;
- Mobile delivery through Expo/EAS;
- CI through GitHub Actions;
- Sentry + OpenTelemetry for observability.

The post-PoC architecture kept deployment topology open until Epic 0 revalidated whether these providers still support the required runtime and regional layout.

That revalidation was performed before Staging creation.

## Decision

Adopt the TRD topology for V1.

### Web

Provider: **Vercel**

Application: `apps/web`

Runtime baseline:

- Next.js 16 App Router;
- Node.js runtime for server-side Web execution;
- primary function region aligned to **US East / `iad1`** while the authoritative backend/data plane remains in North Virginia.

Static/cached delivery remains global through Vercel's edge/CDN behavior.

### API

Provider: **Render Web Service**

Application: `apps/api`

Region: **Virginia, USA**

Runtime:

- Node.js 24 line approved by the repository;
- NestJS 12 + FastifyAdapter;
- stateless HTTP service;
- horizontal scaling allowed later by measured demand.

### Worker

Provider: **Render Background Worker**

Application: `apps/worker`

Region: **Virginia, USA**

Rules:

- separate process from API;
- no public HTTP surface required for the worker process;
- consumes BullMQ jobs;
- graceful shutdown required;
- worker restart must not lose authoritative business state.

### Queue / shared cache

Provider: **Render Key Value**

Region: **Virginia, USA**

Technology: **Valkey 8 / Redis-compatible**

Rules:

- use the same region as API/Worker;
- queue workloads use persistence appropriate to the environment;
- Production queue infrastructure must not use a non-persistent configuration;
- exact memory/compute plan is not frozen by this ADR and remains capacity/cost planning;
- PostgreSQL remains the source of truth.

### Database / Auth / Storage / Realtime

Provider: **Supabase**

Primary specific region for hosted Staging/Production: **East US (North Virginia) / `us-east-1`**

Responsibilities:

- PostgreSQL;
- authentication service selected by the approved product architecture;
- private object storage;
- Realtime Broadcast.

Rules:

- separate projects/configuration by environment;
- runtime connection mode follows ADR-002;
- no Production credentials are reused in Development or Staging.

### Mobile

Provider/tooling: **Expo Application Services (EAS)**

Application: `apps/mobile`

Use:

- EAS Build;
- EAS Submit;
- EAS Update where approved by mobile release policy;
- Development/Preview/Production profiles remain separate.

Store credentials and final bundle identifiers are configured only when the distribution gate is reached.

### CI

Provider: **GitHub Actions**

Rules:

- committed lockfile;
- `--frozen-lockfile` for normal CI;
- least-privilege workflow permissions;
- no Production secret printed or committed;
- PR quality gates defined by the Implementation Plan.

### Observability

Use:

- OpenTelemetry in application/runtime boundaries;
- structured trace-correlated logs;
- Sentry for Error Monitoring + Tracing.

Observability credentials remain environment-specific.

## Environment boundaries

### Development

May use:

- local Web/API/Worker;
- local PostgreSQL/Valkey where appropriate;
- dedicated Development cloud projects only when a hosted capability is necessary;
- provider Sandbox/Test modes.

No real customer or Production financial data.

### Staging

Hosted, separate and production-like:

- Vercel Web project/environment;
- Render API;
- Render Worker;
- Render Key Value;
- Supabase project;
- provider Sandboxes;
- Sentry environment.

Staging does not process real customer payments.

### Production

Fully separate:

- provider projects/services;
- secrets;
- databases;
- queue;
- payment/accounting production credentials;
- monitoring and backup configuration.

No Sandbox IDs, PoC credentials or test callbacks are promoted.

## Region rationale

The initial US market and the approved architecture benefit from keeping dynamic compute and data close together:

- Vercel server-side Web: US East;
- Render API/Worker/Key Value: Virginia;
- Supabase: North Virginia `us-east-1`.

This minimizes avoidable cross-region latency without introducing multi-region complexity before metrics justify it.

## Not frozen by this ADR

This ADR does not choose:

- paid plan size;
- instance RAM/CPU;
- autoscaling thresholds;
- Production HA count;
- exact monthly budget;
- custom domains;
- final mobile bundle IDs;
- backup retention tier.

Those values remain capacity/release decisions driven by measured Alpha/Beta usage and the launch gates in the TRD.

## Guardrails

1. Do not create Staging before its variables, secrets ownership and bootstrap steps are documented.
2. Keep API and Worker deployable independently.
3. Keep queue infrastructure in the same Render region as API/Worker.
4. Keep Production isolated from Development/Staging.
5. No direct provider dependency may leak into business-domain models.
6. Infrastructure changes that materially replace a provider require a new ADR.
7. Region changes for stateful services require an explicit migration plan.
8. Secrets remain in provider/GitHub secret stores, never Git.

## Current-provider revalidation

At acceptance time:

- Render still supports Virginia services, Background Workers and Key Value;
- new Render Key Value instances use Valkey 8;
- Supabase still offers specific `us-east-1` North Virginia projects;
- Vercel still supports US East regional server execution;
- Expo EAS continues to provide Build, Submit and Update workflows.

This closes Epic 0 gate **G0.3**.
