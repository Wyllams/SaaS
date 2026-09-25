# ADR-001 — Drizzle ORM + Drizzle Kit for PostgreSQL Access

- **Status:** Accepted
- **Date:** 2026-09-24
- **Validated by:** POC-01

## Context

CrewCommand is PostgreSQL-first, multi-tenant and relies on database capabilities that are central to the architecture rather than incidental:

- Row-Level Security;
- PostgreSQL transactions;
- JSONB;
- Full-Text Search;
- `pg_trgm`;
- versioned SQL migrations;
- Supabase/PostgreSQL alignment.

The TRD explicitly requires that native PostgreSQL features remain available even when a typed query layer is used.

## Options evaluated

### Drizzle ORM 0.45.3 + Drizzle Kit 0.31.11

Validated successfully against PostgreSQL 17. RLS policy was represented in the schema through `pgPolicy` and emitted into the generated migration.

### Prisma ORM 7.10.0

Validated successfully against PostgreSQL 17 for transactions, RLS runtime behavior, JSONB and raw SQL. However, the tested generated migration did not represent CrewCommand's RLS policy directly, requiring explicit custom SQL to be appended. PostgreSQL FTS and `pg_trgm` also relied on raw SQL.

## Decision

Use **Drizzle ORM + Drizzle Kit** as the primary typed query and migration layer.

## Rationale

Drizzle fits CrewCommand's PostgreSQL-first and Supabase/RLS-heavy architecture with less impedance between database design and application code. It preserves explicit SQL visibility while still providing TypeScript inference and typed queries.

Prisma remains a technically capable alternative but scored lower for this product because RLS is a first-class architectural requirement, not an occasional advanced feature.

## Consequences

### Positive

- RLS can be represented alongside PostgreSQL schema definitions.
- Generated migrations remain transparent SQL.
- Native SQL escape hatches stay natural.
- Strong alignment with a PostgreSQL-first architecture.

### Trade-offs

- Developers need stronger PostgreSQL knowledge than with a more abstract ORM.
- Some higher-level conveniences may require explicit query composition.
- SQL migrations must remain carefully reviewed.

## Guardrails

- Do not bypass RLS assumptions casually with privileged connections.
- Use application roles for tenant-scoped runtime paths.
- Keep admin/service connections isolated to controlled backend operations.
- Raw SQL must remain parameterized and reviewed.
- Migrations are immutable after release except through new corrective migrations.

## Evidence

- Successful CI run: `36082481586`.
- Runtime tests: Drizzle and Prisma both passed RLS, transaction, JSONB, FTS and `pg_trgm` scenarios.
- Project-specific score: Drizzle 96/100, Prisma 7 80/100.
