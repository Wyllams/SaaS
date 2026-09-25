# POC-01 — ORM / Query Layer

## Status

IN PROGRESS.

## Goal

Choose the PostgreSQL query/migration layer that best fits CrewCommand's multi-tenant architecture.

## Candidates

- Drizzle ORM 0.45.3 + Drizzle Kit 0.31.11
- Prisma ORM 7.10.0 (stable line)

Prisma ORM 8 is intentionally excluded from the production decision while it remains a release candidate.

## Required evidence

Both candidates execute against real PostgreSQL 17 in GitHub Actions and must demonstrate:

1. versioned migration workflow;
2. Row-Level Security isolation using a non-superuser application role;
3. denied cross-tenant write;
4. transaction rollback;
5. JSONB filtering;
6. PostgreSQL Full-Text Search;
7. pg_trgm similarity search;
8. raw SQL escape hatch;
9. strict TypeScript compilation.

## Supply-chain policy

pnpm 12's dependency build-script policy is enabled. Only the packages required by the Prisma/esbuild toolchain are explicitly allowlisted under `onlyBuiltDependencies`. The first CI attempt stopped at dependency installation until this allowlist was made explicit; no ORM test had executed yet.

## Decision criteria

| Criterion | Weight |
| --- | ---: |
| PostgreSQL/RLS fit | 25 |
| Migration transparency and custom SQL | 20 |
| Type safety / developer ergonomics | 15 |
| Transaction support | 10 |
| JSONB/FTS/pg_trgm escape hatch | 10 |
| Supabase alignment | 10 |
| Operational/build complexity | 10 |

The final score and ADR are recorded only after the CI evidence passes.
