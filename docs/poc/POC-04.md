# POC-04 — Monorepo pnpm + Turborepo

## Status

IN PROGRESS — awaiting GitHub Actions evidence.

## Hypothesis

CrewCommand can use a single `pnpm` workspace orchestrated by Turborepo for Web, API, Worker, Mobile and shared packages while preserving explicit package boundaries and workspace dependencies.

## Versions validated by the PoC

- Node.js 24.21.0 LTS
- pnpm 12.6.0
- Turborepo 2.11.4

## Scope

The PoC intentionally does **not** scaffold Next.js, NestJS or Expo yet. It validates repository shape, workspace dependency linking, task graph orchestration and local Turborepo caching without coupling POC-04 to framework-specific decisions.

## Acceptance criteria

1. `pnpm install` resolves all workspaces and `workspace:*` dependencies.
2. `scripts/verify-monorepo.mjs` validates all expected workspaces and boundaries.
3. `turbo run build --dry=json` produces a valid task graph.
4. `turbo run build` executes package builds respecting `^build` dependencies.
5. A second `turbo run build` demonstrates local cache hits in CI logs.
6. `turbo run check` succeeds across all workspaces.
7. Generated build artifacts exist for all workspaces.
8. The generated `pnpm-lock.yaml` is captured as PoC evidence and must be committed before the PoC is marked final PASS.

## Evidence

GitHub Actions workflow: `.github/workflows/poc-04-monorepo.yml`.

After validation, this document will be updated with the run ID, commit SHA, cache evidence and final decision.
