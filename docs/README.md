# Documentation map

The `main` branch is the canonical working branch for this SaaS.

## Current authority

1. `source-of-truth/CURRENT-DECISIONS.md`
2. `architecture/TECHNICAL-ARCHITECTURE.md`
3. accepted/current ADRs, especially ADR-016 for backend runtime
4. canonical product documents
5. historical PoC/validation evidence

## Directories

- `source-of-truth/` — approved product documents plus current overrides.
- `architecture/` — consolidated current technical architecture.
- `adr/` — current and superseded architecture decisions.
- `implementation/` — execution model, status/QA, environments and bootstrap.
- `repository/` — repository organization/history.
- `poc/` — historical technical evidence.

Render/NestJS/BullMQ/Valkey references in superseded ADRs or historical QA remain audit evidence only. The current backend runtime is Supabase per ADR-016.
