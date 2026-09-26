# Epic 0 — Foundation — QA e Evidências

> **ATUALIZAÇÃO VIGENTE — 2026-09-25:** a topologia Render/NestJS/BullMQ/Valkey descrita abaixo é histórica e foi **superseded por ADR-016**. O plano de dados é Supabase — PostgreSQL, Auth, Storage, Realtime, `pgmq` e `pg_cron`. A **execução HTTP de negócio é Next.js (Route Handlers e Server Actions) por ADR-017**; as Edge Functions do Supabase são transitórias e saem no Epic 0 / Fase 2. Referências antigas ao Render permanecem apenas como evidência de execuções anteriores e não orientam nova implementação.


- **Data:** 2026-09-25
- **Branch:** `epic/00-foundation`
- **Resultado final:** PASS
- **Execução final:** GitHub Actions `36161167515`

## Objetivo

Provar que a fundação definitiva é reproduzível a partir do Git, com dependências congeladas, sem depender de artefatos manuais de PoC e sem iniciar features de negócio.

## Gate final

A CI definitiva usa:

- GitHub Actions;
- permissões `contents: read`;
- Node.js 24.21.0;
- pnpm 12.6.0;
- `pnpm install --frozen-lockfile`;
- Valkey 8 em service container para smoke do Worker.

## Resultado final

| Gate | Resultado |
|---|---|
| Frozen dependency install | PASS |
| Estrutura brand-neutral do monorepo | PASS |
| Secret baseline | PASS |
| Oxlint | PASS |
| Unit tests | PASS |
| TypeScript | PASS |
| Build completo | PASS |
| API process bootstrap | PASS |
| `GET /health` | PASS |
| Readiness negativa sem dependências configuradas | PASS |
| Worker → Valkey 8 `PING` / readiness | PASS |
| Worker com zero handlers de negócio | PASS |
| Git workspace limpo após validação | PASS |

## Falhas encontradas durante o hardening

As falhas intermediárias foram mantidas no histórico do GitHub Actions. Elas não foram ocultadas.

### 1. pnpm 12 bloqueou build script não aprovado

Primeira instalação detectou:

`ERR_PNPM_IGNORED_BUILDS`

para `msgpackr-extract`.

Decisão:

- negar explicitamente `msgpackr-extract`;
- não habilitar scripts de dependência genericamente.

### 2. Sentry Node SDK typing

O baseline inicial tentou usar uma opção não suportada pelo tipo do Sentry Node 11.0.0.

Correção:

- remover a opção incompatível;
- manter redaction explícita de Authorization/Cookie;
- preservar sampling como configuração explícita por ambiente.

### 3. UI package source resolution

Next/Turbopack não resolveu o barrel com `./button.js` enquanto o package Web compartilhado entrega source TS/TSX.

Correção:

- usar resolução do source para o package Web;
- manter `transpilePackages` no Next.

### 4. Drizzle trouxe scripts `esbuild`

Ao adicionar a boundary `@saas/db`, pnpm 12 bloqueou scripts `esbuild`.

Decisão:

- autorizar explicitamente apenas `esbuild`;
- manter `msgpackr-extract` negado;
- manter CI falhando se novos scripts de build não aprovados aparecerem.

### 5. Runtime API/Worker não podia executar packages TS source

Typecheck/build passavam, mas o smoke da API não subia porque packages server-side exportavam fonte TypeScript.

Correção:

- `@saas/config` e `@saas/observability` agora geram `dist/*.js`;
- exports usam source para types e `dist` para runtime;
- a CI executa os artefatos compilados reais.

### 6. Artefatos gerados pelo Next/TypeScript

A checagem de workspace limpo encontrou:

- `apps/web/tsconfig.tsbuildinfo`;
- reescrita de `apps/web/next-env.d.ts`.

Correção:

- ignorar `*.tsbuildinfo` como cache;
- versionar `next-env.d.ts` exatamente no formato gerado pelo Next.js 16.3.6, incluindo `routes.d.ts` e `root-params.d.ts`.

## Runs relevantes

- `36157466898` — evidenciou política de build scripts do pnpm.
- `36157912648` — evidenciou resolução do package UI no build Web.
- `36158690953` — evidenciou scripts `esbuild` após inclusão de Drizzle.
- `36159008917` — evidenciou boundary incorreta de runtime dos packages server-side.
- `36160754305` — API/Worker funcionais; workspace clean identificou artefatos gerados.
- `36161167515` — **PASS final completo**.

## Conclusão

A fundação atende ao gate técnico do Epic 0 na branch.

O resultado ainda precisa de revisão/merge antes de autorizar o Epic 1.

Não houve provisionamento de Production nem uso de dados reais.

## Post-migration QA status — 2026-09-25

The Valkey/API/Worker smoke evidence in this document belongs to the superseded foundation. The current branch removes those runtime units and replaces them with versioned Supabase Edge Functions and the async-infrastructure migration. Current CI evidence is recorded on the Supabase migration PR.
