# Staging Bootstrap Contract

- **Date:** 2026-09-25
- **Authority:** ADR-015
- **Status:** documented; external provisioning requires its own execution/review
- **Purpose:** production-like validation with synthetic/test data

## Required topology

1. Supabase project in North Virginia (`us-east-1`).
2. Render Key Value in Virginia.
3. Render API Web Service in Virginia.
4. Render Background Worker in Virginia.
5. Vercel Web environment/project using US East server execution.
6. Sentry Staging environment/project configuration.
7. Expo EAS Preview profile for mobile validation when required.
8. GitHub Actions as CI source.

## Order

### 1. Data plane

Create/identify the isolated Staging Supabase project.

Record only non-secret identifiers in documentation. Keep connection credentials in secret stores.

### 2. Queue

Create Staging Render Key Value in Virginia.

Provide `REDIS_URL` only to server/worker environments that require it.

### 3. API

Create Render Web Service for `apps/api`.

Required configuration includes:

- `APP_ENV=staging`
- `DATABASE_URL`
- `REDIS_URL`
- `SENTRY_DSN` when enabled
- explicit `SENTRY_TRACES_SAMPLE_RATE` when tracing is enabled

Verify:

- `/health` returns success;
- `/ready` returns success only after required dependencies are configured.

### 4. Worker

Create Render Background Worker for `apps/worker`.

Verify its readiness log after a successful Valkey connection.

No business queue handlers exist in Epic 0.

### 5. Web

Configure Vercel for `apps/web`.

Set:

- `NEXT_PUBLIC_API_BASE_URL` to the Staging API public origin.

No secret belongs in this variable.

### 6. Observability

Use Staging-specific Sentry configuration.

Verify error/tracing behavior without real customer data.

### 7. Mobile preview

Use the EAS `preview` profile when a mobile release candidate needs device validation.

Final App Store / Play Store credentials are not part of this bootstrap.

## Staging acceptance

Before Staging is considered usable:

- CI passes from committed lockfile;
- Web/API/Worker builds are reproducible;
- API health/readiness are verified;
- Worker reaches queue readiness;
- environment secrets are isolated;
- no Production provider credential is present;
- no real customer/payment data is used.

## Rollback / disposal

Staging resources are disposable relative to Production.

Deleting or recreating a Staging provider resource must still be deliberate and documented; this file does not authorize external deletion.
