# Local Bootstrap

- **Date:** 2026-09-25
- **Target:** Development only
- **Production data:** prohibited

## Prerequisites

- Git
- Node.js 24.21.0
- Corepack
- pnpm 12.6.0
- a PostgreSQL endpoint when database work is required
- a Valkey/Redis-compatible endpoint when the Worker is started

## Install

From the repository root:

```bash
corepack enable
corepack prepare pnpm@12.6.0 --activate
pnpm install --frozen-lockfile
```

## Validate the complete foundation

```bash
pnpm run ci
```

This validates:

- repository structure;
- secret baseline;
- lint;
- Foundation unit tests;
- TypeScript;
- all buildable workspaces.

## Web

```bash
pnpm --filter @saas/web dev
```

The Epic 0 Web route is only a Foundation validation surface.

## API

Set Development environment variables in the shell/IDE secret configuration, then:

```bash
pnpm --filter @saas/api build
pnpm --filter @saas/api start
```

Default local port: `4000`.

Endpoints:

- `GET /health` — process health;
- `GET /ready` — configuration readiness; returns 503 until database and queue URLs are configured.

## Worker

Set:

- `APP_ENV=development`
- `REDIS_URL`

Then:

```bash
pnpm --filter @saas/worker build
pnpm --filter @saas/worker start
```

The Epic 0 Worker intentionally starts with **zero business job handlers**. It only proves the queue/readiness foundation.

## Mobile

```bash
pnpm --filter @saas/mobile start
```

Native store signing/bundle IDs are not configured in Epic 0.

## Database migrations

The migration boundary is `packages/db`.

Domain Epics add physical schema to:

`packages/db/src/schema.ts`

Generation/migration commands require `DATABASE_URL` and are not run against Production from local bootstrap.

## Safety

- use synthetic Development data;
- never copy Production secrets into local files;
- do not commit `.env` files;
- do not reuse PoC provider IDs as product configuration.
