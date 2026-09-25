# ADRs consolidados dos PoCs

Este diretório reúne as decisões arquiteturais aceitas a partir dos PoCs técnicos.

| ADR | PoC | Decisão | Status |
|---|---|---|---|
| ADR-001 | POC-01 | Drizzle ORM + Drizzle Kit | Accepted |
| ADR-002 | POC-02 | Supabase connection modes / pooling | Accepted |
| ADR-003 | POC-03 | Tailwind CSS 4 + semantic tokens | Accepted |
| ADR-004 | POC-04 | pnpm + Turborepo monorepo | Accepted |
| ADR-005 | POC-05 | BullMQ + Valkey/Redis-compatible | Accepted |
| ADR-006 | POC-06 | Supabase Realtime Broadcast | Accepted |
| ADR-007 | POC-07 | Stripe Connect Accounts v2 + Direct Charges | Accepted |
| ADR-008 | POC-08 | QuickBooks Online Accounting integration | Accepted |
| ADR-009 | POC-09 | SMS / Twilio | Não criado — POC cancelado / fora do escopo atual |
| ADR-010 | POC-10 | Resend email | Não Accepted — validação parcial/deferida |
| ADR-011 | POC-11 | Expo mobile foundation | Accepted |
| ADR-012 | POC-12 | OpenTelemetry + structured observability + Sentry | Accepted |
| ADR-013 | Epic 0 / Web validation | Next.js 16 App Router | Accepted |
| ADR-014 | Epic 0 / API validation | NestJS 12 + FastifyAdapter | Accepted |
| ADR-015 | Epic 0 | Deployment topology and environment boundaries | Accepted |

## Regras

- ADR-009 ausente não é lacuna a preencher automaticamente; SMS/Twilio está fora do escopo atual.
- ADR-010 não deve ser inferido como Accepted. O POC-10 possui evidência parcial e o webhook externo real foi deferido.
- Os textos dos ADRs preservam o nome de trabalho histórico usado quando foram produzidos. Isso não define a marca final do SaaS.
- Decisões posteriores em `docs/source-of-truth/CURRENT-DECISIONS.md` prevalecem sobre referências históricas conflitantes.
- Evidências experimentais permanecem nas branches `poc/*`.
