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

### Idiomas

**English (US) e Español, ambos completos**, no produto inteiro.

PT-BR **sai do escopo**: não tem comprador num produto para o mercado americano. A
referência a três idiomas no App Flow v1.0 é superseded.

O TRD precisa definir a arquitetura de i18n, que nunca existiu em documento algum.

### Dashboard

**Uma única tela**, com blocos exibidos conforme a permissão de quem entra. Substitui os
cinco dashboards por papel do App Flow v1.0 (`SCR-DASH-002` a `005` ficam reservados e
sem uso).

O Crew não usa o dashboard; sua entrada é `SCR-FIELD-001`.

### Acesso do cliente ao Portal

**Magic link para aprovar, senha opcional.**

O cliente recebe link assinado com validade e aprova Estimate ou Change Order **sem criar
conta**. Definir senha é opcional e serve para acompanhamento recorrente.

Razão: exigir cadastro do dono do imóvel no momento da assinatura é atrito no ponto exato
de conversão. O link revalida autorização no servidor e nunca dá acesso a dado de outro
cliente.

Substitui a exigência de e-mail e senha do App Flow v1.0 e do PRD v1.0.

### Comunicação com o cliente na V1

Sem inbound, não existe conversa bidirecional — portanto **não há módulo de Inbox na V1**.

O histórico de envio aparece como aba Communications dentro do Customer e do Job, com
estado de entrega. As telas `SCR-INB-001` a `004` ficam reservadas.

Consentimento e opt-out por contato e por canal são registrados **desde a V1**, mesmo sem
SMS, porque consentimento retroativo é impossível de reconstruir.

## Decisões em aberto

**Esta é a lista autoritativa.** O PRD §15 e o App Flow §18 a reproduzem com os mesmos
rótulos; qualquer divergência entre as três resolve-se a favor desta.

Nenhum destes itens pode ser resolvido por inferência durante a implementação. O
`AGENTS.md` §1 exige parar e registrar `BLOCKED — DOCUMENTATION DECISION REQUIRED`.

| Item | Situação |
|---|---|
| Marca do produto | Não definida. Todo identificador permanece brand-neutral; o UI/UX usa o placeholder `[MARCA]` |
| Valores e limites dos planos | Estrutura definida, números em aberto. Não bloqueia o Epic 4: limite é dado em `Entitlement`, nunca condicional por nome de plano |
| Extensão da UI de multi-location | `location_id` permanece no modelo; o alcance na interface da V1 está em aberto |
| Período de exportação e retenção | Em aberto — é o motivo de `SCR-SET-013` estar adiada |

Idiomas **não** estão nesta lista: foram decididos em 2026-09-25 pelo ADR-023 — `en-US`
e `es-US`, ambos completos. O escopo exato da administração da plataforma também saiu:
`SCR-SA-001` e `SCR-SA-002` são superfícies de operador da plataforma, não de tenant.

---

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
