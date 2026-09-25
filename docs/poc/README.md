# PoC archive index

The PoCs were technical validation work. Their accepted decisions are already consolidated into `main` through `docs/architecture/` and `docs/adr/`.

Experimental PoC code remains on its historical branch for audit and must not be copied into production code unless a future approved task explicitly requires it.

| PoC | Historical branch | Current consolidated status |
|---|---|---|
| POC-01 ORM / Query Layer | `poc/01-orm-query-layer` | PASS — ADR-001 |
| POC-02 Supabase Pooling | `poc/02-supabase-pooling` | PASS — ADR-002 |
| POC-03 Design System | `poc/03-design-system-code` | PASS — ADR-003 |
| POC-04 Monorepo | `poc/04-monorepo-foundation` | PASS — ADR-004 |
| POC-05 BullMQ / Valkey | `poc/05-bullmq-valkey` | PASS — ADR-005 |
| POC-06 Supabase Realtime | `poc/06-supabase-realtime` | PASS — ADR-006 |
| POC-07 Stripe Connect | `poc/07-stripe-connect` | PASS — ADR-007 |
| POC-08 QuickBooks Online | `poc/08-quickbooks-online` | PASS — ADR-008 |
| POC-09 Twilio Messaging | `poc/09-twilio-messaging` | Historical only — SMS/Twilio is outside current scope |
| POC-10 Resend Email | `poc/10-resend-email` | Partial/deferred — no accepted final ADR for the deferred webhook portion |
| POC-11 Expo Mobile | `poc/11-expo-mobile` | PASS — ADR-011 |
| POC-12 Observability E2E | `poc/12-observability-e2e` | PASS — ADR-012 |

Current decisions in `docs/source-of-truth/CURRENT-DECISIONS.md` always override historical PoC assumptions.
