# Arquitetura Técnica Consolidada do SaaS

- **Status:** baseline técnico vigente
- **Data:** 2026-09-25
- **Autoridade atual:** CURRENT-DECISIONS + ADR-016
- **Marca:** indefinida

## 1. Topologia vigente

```text
Web (Next.js / Vercel)       Mobile (Expo/EAS)
          \                   /
           \                 /
            Supabase Edge Functions
                     |
          application/domain rules
                     |
      +--------------+--------------+
      |              |              |
  PostgreSQL      Queues/PGMQ    Storage
      |              |
     RLS         Cron/pg_cron
      |
 Auth / Realtime
```

Supabase é a plataforma única do backend atual. Render não faz parte da topologia vigente.

## 2. Responsabilidades do Supabase

- PostgreSQL: fonte de verdade transacional;
- Auth: autenticação;
- Storage: objetos/arquivos;
- Realtime Broadcast: atualização de UX, nunca fonte de verdade;
- Edge Functions: endpoints server-side, webhooks e casos de uso;
- Queues/PGMQ: trabalho assíncrono durável;
- Cron/pg_cron: schedules e despacho periódico;
- pg_net: invocação HTTP assíncrona a partir do banco quando explicitamente necessária.

## 3. Repositório

```text
apps/
  web/
  mobile/

supabase/
  functions/
  migrations/

packages/
  api-client/
  config/
  db/
  design-tokens/
  domain-types/
  observability/
  ui-web/
  validation/
```

`apps/api` e `apps/worker` deixaram de ser unidades de deploy. NestJS/Fastify e BullMQ/Valkey permanecem apenas no histórico superseded.

## 4. Banco e acesso a dados

PostgreSQL continua autoritativo. Drizzle ORM + Drizzle Kit permanecem aprovados para schema/migrations/tooling quando apropriado, com SQL PostgreSQL explícito permitido.

RLS é defesa em profundidade. Workloads Edge/serverless não dependem de estado de sessão ou prepared statements nomeados. Conexões são pequenas/bounded e transações não ficam abertas durante chamadas externas lentas.

## 5. HTTP e casos de uso

Endpoints server-side são Supabase Edge Functions:

1. autenticação e autorização server-side;
2. UI nunca é boundary de autorização;
3. erros estáveis sem vazamento de detalhes;
4. funções pequenas e orientadas ao domínio;
5. efeitos externos idempotentes;
6. sem pressuposto de processo persistente;
7. workloads grandes divididos em jobs/lotes.

O primeiro endpoint migrado é `identity-me`.

## 6. Background jobs

A implementação vigente é **Supabase Queues (PGMQ)**.

- mensagens duráveis;
- visibility timeout;
- retry por reentrega;
- delete/archive após sucesso;
- backlog/falhas observáveis;
- payload mínimo com IDs;
- idempotency keys para side effects.

Supabase Cron agenda consumidores/manutenções quando houver handler de negócio. Não criar polling infinito nem schedules sem owner.

POC-05 continua evidência histórica dos requisitos de retry/idempotência; BullMQ/Valkey foi superseded.

## 7. Realtime

Usar Supabase Realtime Broadcast privado:

`persistir PostgreSQL → publicar sinal → atualizar UX → refetch/reconnect recupera estado`.

Tópicos são tenant/resource scoped e autorização é obrigatória.

## 8. Web

- Next.js 16 App Router;
- React;
- Tailwind CSS 4 + semantic tokens;
- Vercel;
- somente configuração browser-safe em `NEXT_PUBLIC_*`.

O Web chama Supabase Auth/Functions diretamente conforme contratos autorizados; não existe API base URL do Render.

## 9. Mobile

React Native + Expo SDK 57 + Expo Router, distribuído via EAS. Secrets nunca entram em configuração pública.

## 10. Integrações

Mantêm-se as decisões vigentes: Stripe Connect, QuickBooks Online atrás de adapter e Resend dentro do escopo validado/deferido. SMS/Twilio segue fora do escopo.

Webhooks e chamadas externas executam em Edge Functions ou jobs Supabase conforme duração/retry.

## 11. Observabilidade

OpenTelemetry, logs estruturados correlacionados e Sentry continuam aprovados conforme suporte do runtime. Nunca logar Authorization, cookies, passwords, API keys, tokens ou PII não aprovada.

O antigo trace `API → BullMQ → Worker → provider` é histórico. O caminho vigente é `Edge Function → PostgreSQL/Queue → Edge Function/provider`.

## 12. Segurança

PostgreSQL é autoritativo; tenant isolation não depende do navegador; RLS é defesa em profundidade; secrets não entram no Git; webhooks validam assinatura/raw body quando aplicável; side effects são idempotentes; queues/realtime não substituem persistência.

## 13. Limites de runtime

Edge Functions têm limites de CPU, memória e wall-clock. Processamento assíncrono é bounded, em batches, sem loops eternos. Necessidade futura de processo persistente exige nova ADR explícita.

## 14. Deployment

- Web: Vercel;
- Backend/data: Supabase;
- Mobile: Expo/EAS;
- CI: GitHub Actions.

Development, Staging e Production permanecem isolados.

## 15. Histórico superseded

ADR-005, ADR-014 e ADR-015 permanecem para auditabilidade, mas ADR-016 é a decisão vigente.

## 16. Regra de promoção

POC não é production code. Implementação parte das decisões vigentes, contratos atuais, segurança, testes e documentação.
