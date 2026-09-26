# Decisões vigentes que sobrepõem trechos históricos

Este arquivo não altera os documentos originais. Ele registra decisões posteriores que devem ser aplicadas ao consultá-los.

## Reorientação de produto e stack — 2026-09-25

Decisões do Product Owner que **prevalecem sobre os documentos canônicos e sobre ADRs
anteriormente Accepted**. Os ADRs afetados precisam ser formalmente superseded por novos
ADRs antes da próxima implementação que dependa deles.

### ICP

O produto atende **exterior contractors**: Roofing, Gutters, Siding, Windows, Doors,
Decks e Landscaping de instalação. Roofing lidera.

Verticais de chamado avulso — limpeza, pool service, handyman, HVAC, encanamento e
elétrica — estão **fora do ICP**. Referências a elas no PRD v1.0 são superseded.

### Papéis

Sete papéis: **Owner, Admin, Salesperson, Supervisor, Crew, Accounting e Client**.

Substitui os oito perfis do App Flow Oficial. `Supervisor` assume o papel antes chamado
Gerente de Projeto. `Super Admin` deixa de ser aplicação separada na V1.

Crew pode ser própria ou **parceira (subcontratada)**, com controle de seguro, validade,
W-9 e licença.

### Stack

| Decisão | Escolha | ADR afetado |
|---|---|---|
| Lógica de negócio | Next.js Route Handlers + Server Actions na Vercel, com Drizzle | supersede ADR-014 (NestJS + Fastify) |
| Background jobs e filas | **pgmq + pg_cron** no Supabase | supersede ADR-005 (BullMQ + Valkey) |
| Infraestrutura | **Supabase + Vercel + GitHub** apenas | supersede ADR-015 (Render) |
| Campo / mobile | **PWA instalável** na Vercel | supersede ADR-011 (Expo/EAS) na V1 |
| E-mail | Resend como provider único, inclusive SMTP do Supabase Auth | fecha ADR-010, outbound apenas |

Consequência do pgmq: o registro de negócio, o evento de Outbox e o enfileiramento
ocorrem na **mesma transação**. Nenhuma implementação deve reintroduzir fila externa
sem nova decisão.

Domínio próprio será adquirido apenas na entrada em produção.

### Imposto (novo)

Sales tax é **configurado pela empresa**, não calculado por motor genérico: alíquota por
Location com override por Estimate, separação entre mão de obra e material, e isenção por
Customer com certificado e validade. Implementação atrás de um contrato `TaxProvider`.

### Assinatura da Plataforma (novo)

**Stripe Billing completo** na V1: Trial de 14 dias com cartão, cobrança recorrente,
Grace de 3 dias, Read-only e Suspended.

É **independente do Stripe Connect** usado para os pagamentos dos clientes finais. Duas
integrações distintas no mesmo provider; não compartilham código de domínio.

### Escopo da V1

Incluído: Identidade e Workspace, Assinatura, CRM, Sales e Estimates, Jobs e Services,
Schedule com capacidade e Escadinha, Field em PWA, Change Orders, **Materiais e Compras**,
Financial com Invoice/Payment/AR/Commissions, Client Portal e as integrações Stripe,
QuickBooks e Resend.

Fora da V1: Chat interno, Automation Engine, Reports como módulo, Public API, Webhooks de
saída, MCP, Super Admin como aplicação separada, Financing, e-mail inbound e serviços
recorrentes.

Esses itens estão **adiados, não cancelados**. Retornam por decisão explícita.

## Nome do produto

**CrewCommand é nome histórico/provisório.** A marca final ainda não foi definida. Não propagar o nome automaticamente para novos packages, namespaces, domínios ou documentação.

## Backend / infraestrutura — Supabase como plataforma única

**Decisão do Product Owner em 2026-09-25:** tudo que estava previsto ou implementado no Render deixa de fazer parte da arquitetura vigente. O backend passa a usar **Supabase** como plataforma única de runtime e dados.

Arquitetura vigente:

- Web/PWA/Portal: Vercel;
- Mobile: Expo/EAS;
- PostgreSQL, Auth, Storage e Realtime: Supabase;
- endpoints server-side e lógica HTTP: Supabase Edge Functions;
- filas assíncronas: Supabase Queues (PGMQ);
- agendamentos/retries periódicos: Supabase Cron (`pg_cron`) e, quando necessário, `pg_net`;
- CI: GitHub Actions;
- observabilidade: Sentry/OpenTelemetry conforme os limites do runtime usado.

Consequências:

- Render Web Service, Render Background Worker e Render Key Value deixam de ser dependências atuais;
- `apps/api` (NestJS/Fastify) e `apps/worker` (BullMQ/Valkey) deixam de ser unidades de deploy atuais;
- ADR-005, ADR-014 e ADR-015 permanecem somente como histórico técnico e são superseded por ADR-016;
- POC-05 continua válido como evidência de semântica de retry/idempotência, mas BullMQ/Valkey não é mais a implementação escolhida;
- workloads assíncronos devem ser curtos, idempotentes e processados em lotes compatíveis com Edge Functions;
- PostgreSQL continua sendo a fonte de verdade transacional;
- Queues não devem ser expostas ao cliente por padrão;
- Development, Staging e Production continuam separados.

A migração inicial habilitou `pgmq`, `pg_cron` e `pg_net` no projeto Supabase e moveu o handoff `identity-me` para Edge Functions.

## SMS / Twilio

**SMS/Twilio está fora do escopo atual por decisão do proprietário em 2026-09-25.**

Consequências:

- não implementar envio ou recebimento SMS;
- não introduzir Twilio no runtime atual;
- não tratar A2P/10DLC, sender pool, delivery callbacks ou webhooks Twilio como requisito atual;
- referências a SMS/Twilio dentro de PRD, App Flow, Domain Model, UI/UX, TRD ou Technical Validation Plan são **históricas e superseded**;
- a branch `poc/09-twilio-messaging` permanece somente como evidência histórica.

SMS só retorna com nova decisão explícita e nova validação.

## Resend webhook

A validação de webhook HTTPS público real do Resend foi **deferida e não bloqueia** a continuação do planejamento documental. As demais evidências do POC-10 permanecem válidas dentro dos limites registrados.

## PoCs

O ciclo técnico 01–12 foi executado no repositório `Wyllams/SaaS`, com POC-09 cancelado pelo escopo atual. Resultados e ADRs nas branches de PoC devem ser usados para atualizar decisões técnicas originalmente marcadas como pendentes no TRD.

A visão consolidada pós-PoCs está em:

`docs/architecture/TECHNICAL-ARCHITECTURE.md`

## Implementation Plan

O arquivo antigo `PLAN-20260917-005 - Plano mestre de implementação do CrewCommand.md` pertence a uma linha de implementação anterior e **não substitui** o `Implementation Plan v1.0` previsto pelo TRD e pelo Technical Validation & PoC Plan.

O Implementation Plan v1.0 foi criado a partir das fontes oficiais e dos resultados dos PoCs, aprovado pelo proprietário em 2026-09-25 e mergeado na `main` pela PR #13.

A implementação foi autorizada a iniciar pelo **Epic 0 — Foundation**. Nenhum Epic posterior é autorizado a pular os gates definidos no próprio Implementation Plan.
