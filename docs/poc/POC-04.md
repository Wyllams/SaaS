# POC-04 — Monorepo pnpm + Turborepo

## Status

**PASS — technical hypothesis validated.**

## Decision

CrewCommand will use a single `pnpm` workspace orchestrated by Turborepo for Web, API, Worker, Mobile and shared packages.

This PoC validates repository structure and task orchestration only. Framework-specific scaffolding remains owned by the PoCs/implementation steps that validate Next.js, NestJS and Expo.

## Versions validated

- Node.js 24.21.0 LTS
- pnpm 12.6.0
- Turborepo 2.11.4

## Validated repository shape

```text
apps/
  web/
  api/
  worker/
  mobile/
packages/
  api-client/
  design-tokens/
  types/
  validation/
  config/
```

## Acceptance criteria and evidence

| Criterion | Result |
| --- | --- |
| pnpm resolves the workspace and `workspace:*` dependencies | PASS |
| Expected app/package boundaries are present | PASS |
| Turborepo produces a valid task graph | PASS |
| First build executes all package tasks successfully | PASS — 9/9 |
| Workspace checks execute successfully | PASS — 9/9 |
| Build artifacts are generated for all workspaces | PASS — 9/9 |
| Second build demonstrates Turborepo cache reuse | PASS — 9/9 cache hits, FULL TURBO |
| `pnpm-lock.yaml` is committed | PASS — commit `0fc803f6baef0e4569fd6494cd8e291c0e3d05ee` |
| Final CI uses the committed lockfile with `--frozen-lockfile` | Required final verification on this branch |

## CI evidence

Initial validation:

- GitHub Actions run: `36081203499`
- Source commit: `04808a7e779d4c5da500b38d7d3bb1e9409ede95`
- Build: 9 successful / 9 total
- Checks: 9 successful / 9 total
- Second build: 9 cached / 9 total — `FULL TURBO`
- Evidence artifact: `poc-04-evidence` (artifact ID `10842340652`)

Lockfile bootstrap validation:

- GitHub Actions run: `36081323597`
- Workflow conclusion: success
- Generated lockfile persisted by GitHub Actions bot in commit `0fc803f6baef0e4569fd6494cd8e291c0e3d05ee`

## Risks / observations

- The PoC intentionally uses lightweight package tasks rather than framework builds. This avoids conflating monorepo validation with framework-specific PoCs.
- Turborepo remote cache is not required for the V1 foundation; local task caching was validated. Remote cache can be enabled later if CI timings justify it.
- Package versions are pinned for repeatability during the PoC. Future upgrades must pass normal CI gates.

## ADR

Decision recorded in:

`docs/adr/ADR-004-pnpm-turborepo-monorepo.md`
