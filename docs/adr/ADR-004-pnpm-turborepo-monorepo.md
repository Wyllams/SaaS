# ADR-004 — pnpm + Turborepo Monorepo

- **Status:** Accepted
- **Date:** 2026-09-24
- **Decision owner:** CrewCommand Architecture
- **Validated by:** POC-04

## Context

CrewCommand requires multiple deployable applications—Web, API, Workers and Mobile—plus shared TypeScript packages for API contracts, design tokens, validation, types and configuration.

The architecture must reduce duplication without forcing Web and React Native to share inappropriate UI implementation details. It must also support independent application deployments and predictable CI task execution.

## Decision

Use a **pnpm workspace monorepo orchestrated by Turborepo**.

Initial topology:

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

Internal package dependencies use the `workspace:*` protocol.

The package manager and Turborepo versions are pinned in the repository and the lockfile is committed.

## Rationale

POC-04 demonstrated that:

- pnpm correctly resolves all internal workspace dependencies;
- Turborepo models dependency-aware task execution across the package graph;
- all nine package/app tasks execute successfully;
- a second identical build produces full local cache reuse;
- the repository can preserve deployable app boundaries while sharing explicit packages.

## Consequences

### Positive

- One repository and one dependency graph for the TypeScript platform.
- Shared contracts and tokens can evolve atomically with consuming apps.
- CI can run affected/dependency-aware tasks.
- API, Worker, Web and Mobile remain independently deployable.

### Trade-offs

- Repository-level tooling becomes critical infrastructure.
- Package boundaries require discipline to avoid accidental coupling.
- Mobile and Web may share tokens/contracts but should not be forced to share all UI components.

## Guardrails

1. Business applications live under `apps/*`; reusable packages live under `packages/*`.
2. Internal dependencies use `workspace:*`.
3. Critical business rules remain backend authoritative even when types/validation are shared.
4. Do not introduce circular package dependencies.
5. Do not add a second package manager.
6. Framework-specific decisions remain separate ADRs/PoCs.

## Evidence

- POC document: `docs/poc/POC-04.md`
- GitHub Actions run `36081203499`: 9/9 builds, 9/9 checks, 9/9 cache hits on second build.
- Lockfile commit: `0fc803f6baef0e4569fd6494cd8e291c0e3d05ee`.

## Revisit Trigger

> Campo acrescentado em 2026-09-25. É obrigatório pelo §20 do Technical Validation &
> PoC Plan, mas os ADRs anteriores ao 017 foram escritos sem ele.

Reavaliar se ocorrer **qualquer** um destes:

1. **revisão já agendada:** os itens 5, 6 e 7 do Epic 0 alteram a topologia — criam `packages/domain` e `packages/i18n`, reavaliam `api-client` e `domain-types`, e decidem o destino de `apps/mobile`. O ADR precisa ser atualizado quando isso fechar;
2. o tempo de CI ultrapassar o orçamento definido, apesar do cache do Turborepo;
3. o pnpm deixar de suportar a versão de Node fixada na fundação.
