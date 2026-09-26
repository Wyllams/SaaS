# ADR-014 — API Framework

- **Status:** Superseded by ADR-016 e ADR-017
- **Nota:** o ADR-016 removeu o Render e o runtime NestJS; o **ADR-017** substituiu
  explicitamente a camada de API por Route Handlers e Server Actions no `apps/web`
- **Date:** 2026-09-25
- **Scope:** `apps/api`
- **Validated by:** Epic 0 API framework validation
- **Branding:** neutral for production implementation

## Supersession notice

This decision remains historical evidence of what was validated. It is no longer the active production architecture after the Product Owner decision of 2026-09-25. The current backend runtime is defined by **ADR-016**: Supabase Edge Functions + Supabase Queues (PGMQ) + Supabase Cron, with no Render runtime dependency.

## Context

The approved TRD selected **NestJS + FastifyAdapter** for the shared backend API.

The post-PoC consolidated architecture intentionally required this choice to be revalidated before the definitive `apps/api` scaffold because POC-04 only proved the monorepo structure and did not itself validate the API framework.

The API framework must support:

- TypeScript;
- the approved pnpm + Turborepo monorepo;
- Node.js 24;
- modular-monolith boundaries;
- thin HTTP controllers with application/use-case logic outside the transport layer;
- REST/OpenAPI;
- authorization and tenant-scoped backend enforcement;
- health/readiness endpoints;
- structured logging and OpenTelemetry integration;
- separate deployment from Web;
- compatibility with BullMQ Workers and shared internal packages.

## Decision

Use **NestJS 12 + FastifyAdapter** for `apps/api`.

Validated baseline:

- NestJS 12.1.0;
- `@nestjs/platform-fastify` 12.1.0;
- Fastify 5.12.5;
- TypeScript 6.0.3;
- Node.js 24.21.0;
- pnpm 12.6.0;
- Turborepo 2.11.4.

Do not use Fastify 6 pre-release packages for the production baseline while the stable NestJS adapter line depends on Fastify 5.12.5.

## Architecture boundary

```text
Web / Mobile
    ↓
typed API contracts
    ↓
apps/api — NestJS + Fastify
    ↓
application use cases
    ↓
domain
    ↓
PostgreSQL / queues / provider adapters
```

Rules:

- controllers remain thin;
- business rules do not live in Fastify hooks or controllers;
- provider SDK objects do not become domain contracts;
- authorization is enforced in backend/application/database boundaries, never by UI visibility alone;
- external API calls do not remain inside long PostgreSQL transactions.

## Fastify rule

Fastify is the HTTP adapter selected for the API.

Use Fastify-compatible middleware/plugins when transport-specific behavior is required. Do not install Express-specific middleware by habit.

## Module format

NestJS 12 packages are ESM.

The validated candidate used an ESM application layout with TypeScript NodeNext module resolution.

The production scaffold should preserve this modern ESM-compatible baseline unless a documented incompatibility requires another choice.

## Validation evidence

Validation branch:

`validation/api-nest-fastify`

Initial bootstrap run:

`36155893953` — PASS

Validated:

- dependency resolution;
- approved monorepo structure;
- strict TypeScript check;
- production TypeScript build;
- NestJS application bootstrap through FastifyAdapter;
- real HTTP `GET /health` smoke response;
- lockfile generation.

Frozen dependency run:

`36155986445` — PASS

Validated again with:

`pnpm install --frozen-lockfile`

and repository permission:

`contents: read`

Validation commits:

- candidate scaffold: `2eb3ce4e654b138c342978c37a3f7eb84e126291`;
- dependency lock: `d0a3e389cd0d83345b65923fc89b61572069eaea`;
- frozen validation workflow: `9c1b0da5bd0a21bd1e3c30117027b8a62d128191`.

The validation branch is a technical harness based on the historical POC-04 monorepo. Its historical package naming is not authorization to use that product name in the new production scaffold.

## Security and operational guardrails

- validate external payloads server-side;
- use stable machine-readable error codes;
- never expose stack traces/secrets to clients;
- bind deploy listeners explicitly for container environments;
- health endpoints must not reveal sensitive configuration;
- keep request/correlation IDs available for observability;
- keep framework-specific objects outside domain models;
- follow patched stable framework releases.

## Consequences

### Positive

- preserves the TRD decision after real validation;
- strong modular structure for a large backend;
- Fastify-compatible performance/HTTP model;
- fits Node 24 + TypeScript 6;
- compatible with Vitest-oriented modern NestJS workflows;
- clean integration point for OpenAPI, authorization and observability.

### Trade-offs

- framework/module upgrades require active maintenance;
- Fastify-specific ecosystem differences must be respected;
- Nest abstractions must not be allowed to hide domain/database boundaries;
- application modularity must be enforced by dependency rules, not assumed from folders.

## Not decided here

This ADR does not decide:

- final deployment provider for API/Worker;
- authentication provider implementation details;
- physical domain schema;
- API endpoint catalogue;
- production scaling values;
- final product branding.

This closes Epic 0 gate **G0.2**.

## Revisit Trigger

> Campo acrescentado em 2026-09-25. É obrigatório pelo §20 do Technical Validation &
> PoC Plan, mas os ADRs anteriores ao 017 foram escritos sem ele.

**Não se aplica.** Esta decisão já foi superseded por ADR-016 e ADR-017. Reabri-la exige um ADR novo,
não a reavaliação desta.
