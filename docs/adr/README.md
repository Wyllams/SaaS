# ADRs consolidados

| ADR | Origem | Decisão | Status |
|---|---|---|---|
| ADR-001 | POC-01 | Drizzle ORM + Drizzle Kit | Accepted |
| ADR-002 | POC-02 | Modos de conexão e pooling no Supabase | Accepted; runtime atualizado por ADR-016 e ADR-017 |
| ADR-003 | POC-03 | Tailwind CSS 4 + tokens semânticos | Accepted |
| ADR-004 | POC-04 | pnpm + Turborepo | Accepted |
| ADR-005 | POC-05 | BullMQ + Valkey/Redis-compatible | **Superseded por ADR-016** |
| ADR-006 | POC-06 | Supabase Realtime Broadcast | Accepted |
| ADR-007 | POC-07 | Stripe Connect Accounts v2 + Direct Charges | Accepted |
| ADR-008 | POC-08 | QuickBooks Online | Accepted |
| ADR-009 | POC-09 | SMS / Twilio | Não criado — fora do escopo |
| ADR-010 | POC-10 | Resend email | Substituído por **ADR-021** |
| ADR-011 | POC-11 | Expo mobile foundation | **Superseded por ADR-018** na V1 |
| ADR-012 | POC-12 | OpenTelemetry + observabilidade + Sentry | Accepted |
| ADR-013 | Epic 0 | Next.js App Router | Accepted |
| ADR-014 | Epic 0 | NestJS + FastifyAdapter | **Superseded por ADR-016 e ADR-017** |
| ADR-015 | Epic 0 | Topologia de deploy no Render | **Superseded por ADR-016** |
| ADR-016 | Product Owner | **Supabase-only backend runtime** | Accepted — **emendado por ADR-017 e ADR-018** |
| ADR-017 | Product Owner | **Next.js como camada de aplicação** | Accepted |
| ADR-018 | Product Owner | **PWA como superfície de campo** | Accepted |
| ADR-019 | Product Owner | `TaxProvider` e tratamento fiscal | Accepted |
| ADR-020 | Product Owner | Stripe Billing para a assinatura | Accepted |
| ADR-021 | Product Owner | Resend como provider único de e-mail | Accepted |
| ADR-022 | Product Owner | Portal por magic link | Accepted |
| ADR-023 | Product Owner | Arquitetura de i18n | Accepted |

## Como ler a cadeia de backend

Três ADRs se sobrepõem no mesmo assunto. A leitura correta é esta:

1. **ADR-016** removeu o Render e consolidou o backend no Supabase. Vale integralmente,
   **exceto** nos dois pontos emendados abaixo.
2. **ADR-017** move a execução HTTP de negócio de Edge Functions para **Next.js Route
   Handlers e Server Actions**, e o consumo de fila de `pg_net` para **Vercel Cron**.
   `pgmq` e `pg_cron`, decididos no ADR-016, permanecem.
3. **ADR-018** move a superfície de campo de Expo/EAS para **PWA**.

Tudo o mais do ADR-016 — PostgreSQL como autoridade, Auth, Storage, Realtime, ausência do
Render, fronteiras de ambiente e os sete guardrails — continua valendo.

## Regras

- ADR-009 ausente não é lacuna a preencher; SMS está fora do escopo atual.
- ADR Superseded permanece como registro histórico e **não pode ser usado** para reintroduzir
  a decisão revogada.
- Os textos dos ADRs anteriores a 2026-09-25 preservam o nome de trabalho histórico. Isso não
  define a marca final.
- Decisões em `../source-of-truth/CURRENT-DECISIONS.md` prevalecem sobre referência histórica
  conflitante.
- Evidência experimental permanece nas branches `poc/*`.

## Formato obrigatório

A partir do ADR-017, todo ADR segue o formato exigido pelo Technical Validation Plan §20:
Context · Options Considered · Decision · Evidence · Consequences · Guardrails ·
**Revisit Trigger**.

O campo **Revisit Trigger** está ausente nos ADRs de 001 a 016 e deve ser preenchido quando
cada um for revisitado.
