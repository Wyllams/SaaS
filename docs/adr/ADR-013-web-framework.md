# ADR-013 — Framework Web

- **Status:** Accepted
- **Date:** 2026-09-25
- **Scope:** `apps/web`
- **Branding:** neutral; no final product name assumed

## Context

The consolidated architecture reserves `apps/web` for the SaaS Web application, but POC-04 intentionally did not approve a production Web framework.

The Web application needs:

- React 19 compatibility;
- TypeScript;
- pnpm + Turborepo monorepo compatibility;
- server-first rendering for dense authenticated SaaS screens;
- clear server/client boundaries;
- route layouts suitable for multiple application areas;
- strong accessibility and progressive loading/error boundaries;
- compatibility with the approved Tailwind CSS 4 design system;
- a clean boundary to a separate backend API;
- straightforward deployment to Vercel without making Vercel a business-layer dependency.

## Candidates reviewed

### Next.js 16.x

Current status at review time:

- Next.js 16.x is Active LTS;
- App Router is the primary modern routing model;
- React Server Components are supported by default;
- route layouts, loading/error/not-found boundaries and Route Handlers are first-class;
- official deployment support on Vercel is direct;
- Node.js 20.9+ is supported, compatible with the repository's validated Node.js 24 line.

Security note for 2026-09-25:

- 16.3.6 is the current patched Active LTS release after the 2026-09-22 security update;
- 16.3.7 is already announced for 2026-09-30 and must be evaluated immediately after release.

### React Router 8

React Router 8 is stable and uses a modern baseline with Node 22+, Vite 7+ and React 19+.

It is a technically valid option and offers strong route/data abstractions with less framework-specific server behavior.

For this SaaS, it would require more application-level assembly around SSR/server boundaries and deployment conventions that Next.js already standardizes.

### TanStack Start

TanStack Start offers type-safe routing, SSR, streaming and server functions.

At the date of this ADR it remains in Release Candidate status rather than stable v1.

It is not selected as the initial production baseline while a stable Active-LTS alternative satisfies the requirements.

## Decision

Use **Next.js 16 App Router** for `apps/web`.

Initial implementation baseline:

- Next.js 16.3.6 or newer patched 16.x Active LTS;
- React 19;
- TypeScript;
- App Router;
- Server Components by default;
- Client Components only where browser interactivity requires them;
- Tailwind CSS 4 consuming the approved semantic token layer.

When Next.js 16.3.7 is released on 2026-09-30, upgrade evaluation is mandatory before treating 16.3.6 as a longer-lived baseline.

## Architecture boundary

Next.js is the Web application framework, not the authoritative business backend.

Conceptual boundary:

```text
Browser
  ↓
apps/web — Next.js
  ↓
typed API client / approved server-side calls
  ↓
apps/api
  ↓
domain + PostgreSQL + integrations
```

Core business rules, tenant authorization and provider orchestration do not move into React components.

Next.js may host Web-specific server concerns such as:

- SSR;
- route/layout composition;
- authentication/session presentation boundary;
- BFF-style aggregation where explicitly approved;
- Web-only Route Handlers when they are genuinely Web concerns.

It must not become a second competing core API.

## Routing

Use the App Router.

Prefer route groups/layout boundaries for distinct product surfaces without forcing separate Web applications.

Exact product-area names are intentionally deferred until the product information architecture is approved.

## Server / Client rule

Default to Server Components.

Use `"use client"` only when the component actually needs browser state, browser APIs or interactive hooks.

Do not fetch sensitive authoritative data in Client Components when the same work belongs on the server/API boundary.

## Data and mutations

The Web app should consume the dedicated API through typed contracts.

Do not treat Next.js Server Actions as the default location for cross-domain business workflows merely because they are available.

Any Server Action used later must remain a thin Web boundary and call the appropriate application/API contract.

## Deployment

Next.js has first-class Vercel support, but this ADR does not lock the entire platform to Vercel.

The production deployment topology remains a separate open decision.

The application should avoid unnecessary Vercel-only assumptions where a standard Node.js deployment path is sufficient.

## Security

- follow current patched Active-LTS releases;
- do not remain on known vulnerable patch versions;
- keep secrets server-only;
- preserve CSP/header/security decisions as separate explicit configuration;
- never trust UI visibility as authorization;
- API/database authorization remains authoritative;
- avoid leaking server-only modules into client bundles.

## Consequences

### Positive

- stable Active-LTS framework;
- strong React 19 alignment;
- mature App Router;
- Server Components and streaming/loading boundaries;
- direct compatibility with Vercel;
- good fit with pnpm/Turborepo and Tailwind;
- clear route/layout model for a large SaaS interface.

### Trade-offs

- framework behavior and caching semantics require discipline;
- security patch cadence must be actively followed;
- Web/server features can tempt teams to duplicate API/domain logic if boundaries are not enforced;
- deployment is easiest on Vercel, so portability must remain intentional.

## Acceptance basis

This ADR is accepted because the approved TRD already selected Next.js App Router and the required repository validation proved:

1. installation under the approved pnpm/Turborepo monorepo;
2. Next.js production build succeeds;
3. Tailwind CSS 4 semantic-token integration compiles;
4. one Server Component route builds;
5. one intentionally isolated Client Component builds;
6. TypeScript check passes;
7. repository structure checks remain green;
8. no additional package manager or circular workspace dependency is introduced.

## Validation evidence

The technical gate was executed on branch:

`validation/web-nextjs`

Validated candidate:

- Next.js 16.3.6;
- React 19.2.0;
- Tailwind CSS 4.3.3;
- Node.js 24.21.0;
- pnpm 12.6.0;
- approved Turborepo monorepo foundation.

Evidence:

- initial dependency/bootstrap run: `36148939650` — **PASS**;
- frozen-lockfile validation run: `36149050275` — **PASS**;
- dependency lock commit: `bc2d6ac6add437f5d53dc301fe3ae50d5ae1e2df`;
- final validation workflow commit: `851542c8ed5646f5717425d4b700cf321a286030`.

The validation proved:

1. pnpm workspace dependency resolution: PASS;
2. approved monorepo structure verifier: PASS;
3. strict TypeScript check: PASS;
4. App Router production build: PASS;
5. semantic Tailwind CSS 4 token integration: PASS;
6. Server Component route build: PASS;
7. isolated Client Component build: PASS;
8. frozen lockfile install: PASS.

No production route architecture, product branding or API framework was introduced by this validation.


## Not decided here

This ADR does not decide:

- final product branding;
- final route names/product information architecture;
- API framework;
- authentication provider;
- final Vercel/project topology;
- production domain;
- caching policy per feature;
- CDN/storage architecture.


## Acceptance record

Accepted on 2026-09-25 during Epic 0 reconciliation.

Authority used:

1. approved TRD selected Next.js + React + App Router for Web/PWA/Portal;
2. validation branch `validation/web-nextjs` passed the technical gate;
3. current Next.js support policy still lists 16.x as Active LTS;
4. the patched baseline remains 16.3.6 as of 2026-09-25, with 16.3.7 scheduled for 2026-09-30.

This closes Epic 0 gate G0.1.
