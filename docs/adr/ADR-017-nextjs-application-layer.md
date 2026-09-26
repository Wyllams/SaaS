# ADR-017 — Next.js como camada de aplicação

- **Status:** Accepted
- **Data:** 2026-09-25
- **Decision owner:** Product Owner
- **Supersede:** ADR-014 (NestJS + FastifyAdapter)
- **Emenda:** ADR-016 — **apenas** a linha "HTTP/server business execution"

## Context

O ADR-016 consolidou o backend no Supabase e removeu o Render. Naquela decisão, a execução
HTTP de negócio foi atribuída a **Supabase Edge Functions**, e a função `identity-me` foi
migrada e publicada, com `apps/api` e `apps/worker` removidos do workspace.

Posteriormente, ainda em 2026-09-25, ao definir o escopo e a stack da V1, o Product Owner
decidiu que a lógica de negócio deve viver no **Next.js**, com Drizzle, na Vercel.

As duas decisões coexistiam em conflito. Este ADR resolve o conflito e registra qual vale.

## Options Considered

| Opção | Avaliação |
|---|---|
| **Next.js Route Handlers + Server Actions** | Um runtime e um deploy; regra em TypeScript testável com Vitest; preserva ADR-001 (Drizzle) e ADR-013 (Next.js); Server Components eliminam camada de transporte |
| Manter Edge Functions (ADR-016) | Já implementado para `identity-me`; runtime Deno separado, com ferramental de teste próprio e integração menos direta com o Drizzle e com o Design System |
| Híbrido | Regra no Next.js e webhooks em Edge Functions; dois runtimes, com tendência de o domínio vazar para o lado Deno |

## Decision

A regra de negócio vive em **Application Services** em `packages/domain`, invocados por três
entradas do `apps/web`:

1. **Server Actions** — mutações originadas na própria interface;
2. **Route Handlers** — contrato HTTP, incluindo recepção de webhook;
3. **Worker de fila** — rota protegida acionada por Vercel Cron.

Persistência por repositórios com Drizzle.

### O que muda em relação ao ADR-016

| Item | ADR-016 | Agora |
|---|---|---|
| Execução HTTP de negócio | Supabase Edge Functions | **Next.js Route Handlers e Server Actions** |
| Consumo de fila | Edge Function acionada por `pg_net` | **Vercel Cron → rota protegida de worker** |
| `pg_net` | Dispatch DB → HTTP | Deixa de ser necessário para este fim |

### O que do ADR-016 permanece intacto

PostgreSQL, Auth, Storage e Realtime no Supabase · **`pgmq` para fila durável** ·
**`pg_cron` para agendamento** · Render fora da topologia · PostgreSQL como autoridade ·
fronteiras de ambiente separadas · e todos os sete guardrails do ADR-016.

## Migration record

A migração pendente é o caminho inverso do registrado no ADR-016:

- a Edge Function `identity-me` passa a ser Route Handler em `apps/web`, **preservando o
  contrato do Slice 01**;
- a função só é removida do Supabase após paridade comprovada por teste;
- `apps/api` e `apps/worker` já haviam sido removidos pelo ADR-016 e **não retornam**.

## Evidence

ADR-013 e ADR-001 aceitos. A Edge Function `identity-me` existe e funciona — é a base de
comparação para a paridade exigida acima.

## Consequences

**Positivas:** um runtime, um deploy, um ferramental de teste; regra escrita uma vez e
chamada de três lugares; preview por PR cobre a aplicação inteira, não só a interface.

**Trade-offs:** o runtime é serverless com limite de execução — trabalho longo vai
obrigatoriamente para a fila; sem conexão persistente, o acesso ao banco depende do pooler
em modo transaction (ADR-002); o webhook passa a compartilhar o ciclo de release da web, ao
contrário da Edge Function, que era independente.

## Guardrails

- Componente, Server Action e Route Handler **não contêm regra de negócio**.
- `packages/domain` não importa nada de `apps/web`.
- Tipo de SDK de provider não atravessa a fronteira do domínio.
- Autorização verificada no Application Service, antes de qualquer efeito.
- Nenhuma consulta a banco direto de componente.
- **Edge Function não retorna** para execução de negócio sem nova decisão explícita.
- Os guardrails do ADR-016 continuam valendo integralmente.

## Revisit Trigger

Reavaliar se ocorrer **qualquer** um destes:

1. um webhook crítico ser perdido por indisponibilidade durante deploy da web, o que
   justificaria devolver apenas a recepção de webhook a uma Edge Function;
2. um workload legítimo não couber no limite de execução da função nem puder ser fatiado
   em fila;
3. surgir consumidor externo que exija contrato versionado, independente do ciclo de
   release da web;
4. o cold start passar a violar o alvo de p95 de 500 ms em rota simples.
