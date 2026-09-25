# Repository branch inventory

Updated: 2026-09-25

## Canonical branch

- `main` — only canonical working branch. Epic 0 foundation, source-of-truth documents, accepted ADRs and implementation guidance live here.

## Safety backup

- `backup/pre-main-consolidation-20260925` — snapshot of `main` immediately before Epic 0 was merged during repository consolidation.

## Already consolidated into main

These branches produced work that is already represented in `main`:

- `architecture/consolidated-technical-architecture`
- `docs/import-official-product-documents`
- `docs/consolidate-poc-adrs`
- `docs/implementation-plan-v1`
- `epic/00-foundation`

## Historical PoC branches — evidence only

These branches contain experimental validation code and evidence. They are retained for audit/history but are **not** the production baseline:

- `poc/01-orm-query-layer`
- `poc/02-supabase-pooling`
- `poc/03-design-system-code`
- `poc/04-monorepo-foundation`
- `poc/05-bullmq-valkey`
- `poc/06-supabase-realtime`
- `poc/07-stripe-connect`
- `poc/08-quickbooks-online`
- `poc/09-twilio-messaging`
- `poc/10-resend-email`
- `poc/11-expo-mobile`
- `poc/12-observability-e2e`

Accepted decisions from the applicable PoCs are recorded under `docs/adr/` and `docs/architecture/`.

Current source-of-truth decisions override historical PoC assumptions. In particular, SMS/Twilio is outside current scope and the real public Resend webhook remains deferred.

## Historical framework validation branches

- `architecture/web-framework-decision`
- `validation/web-nextjs`
- `validation/api-nest-fastify`

Their final framework decisions are represented by the Epic 0 foundation and ADR-013 / ADR-014 in `main`.

## Rule

Do not merge historical PoC/validation code into product code simply to make every branch disappear. That would reintroduce experimental packages, lockfiles and workflows that were superseded by the definitive Epic 0 foundation.

Nothing is deleted by this organization. Git history and branches remain available for audit.
