# POC-01 — ORM / Query Layer

## Status

**PASS — decision accepted: Drizzle ORM + Drizzle Kit.**

## Goal

Choose the PostgreSQL query/migration layer that best fits CrewCommand's multi-tenant architecture.

## Candidates validated

- Drizzle ORM 0.45.3 + Drizzle Kit 0.31.11
- Prisma ORM 7.10.0 (stable line)

Prisma ORM 8 was intentionally excluded from the production decision while it remains a release candidate.

## Evidence

GitHub Actions run `36082481586` completed successfully against PostgreSQL 17.

Both candidates passed:

- migration execution;
- RLS read isolation using a non-superuser application role;
- denied cross-tenant writes;
- transaction rollback;
- JSONB filtering;
- PostgreSQL Full-Text Search;
- `pg_trgm` similarity search;
- raw SQL escape hatch;
- strict TypeScript compilation.

Drizzle additionally demonstrated that the RLS policy can be represented in the typed schema through `pgPolicy` and emitted into its generated migration.

Prisma's generated base migration did not include the RLS policy, so CrewCommand had to append explicit PostgreSQL SQL for RLS before applying the migration. FTS and `pg_trgm` also used Prisma's raw SQL escape hatch.

## Project-specific score

| Criterion | Weight | Drizzle | Prisma 7 |
| --- | ---: | ---: | ---: |
| PostgreSQL / RLS fit | 25 | 25 | 16 |
| Migration transparency / custom SQL | 20 | 19 | 16 |
| Type safety / developer ergonomics | 15 | 13 | 15 |
| Transaction support | 10 | 10 | 10 |
| JSONB / FTS / pg_trgm escape hatch | 10 | 10 | 9 |
| Supabase alignment | 10 | 10 | 7 |
| Operational / build complexity | 10 | 9 | 7 |
| **Total** | **100** | **96** | **80** |

The score is specific to CrewCommand's approved architecture; it is not a general ranking of the libraries.

## Decision

Use **Drizzle ORM + Drizzle Kit** as CrewCommand's primary typed PostgreSQL query and migration layer.

### Guardrails

1. PostgreSQL remains the source of truth and native database features remain first-class.
2. Raw SQL is explicitly allowed when PostgreSQL-native capabilities require it.
3. RLS policies must remain visible and reviewable in migrations.
4. The application must not distort database design to accommodate ORM limitations.
5. Multi-tenant isolation remains enforced by backend authorization plus PostgreSQL RLS defense-in-depth.
6. Migrations remain versioned in Git and are reviewed as production code.

## Supply-chain observation

pnpm 12's current dependency script policy is preserved. Only the packages required by the Prisma/esbuild PoC toolchain were explicitly allowed to execute build scripts; blanket script execution was not enabled.

## Supabase validation status

The PostgreSQL behavior required by this PoC is validated locally/CI against real PostgreSQL 17.

Live validation against the intended CrewCommand Supabase project `obpncbnzwrocvgngtodg` remains pending because the currently connected Supabase plugin does not expose that project. No other Supabase project was modified.

## ADR

Decision recorded in `docs/adr/ADR-001-drizzle-query-layer.md`.
