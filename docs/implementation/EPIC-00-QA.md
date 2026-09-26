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

---

## Slice 01 — Route Handler de identidade — 2026-09-26

### Testes

| Escopo | Resultado |
|---|---|
| `@saas/web` — contrato de identidade | **14/14 PASS** |
| `@saas/config` | 3/3 PASS |
| `@saas/observability` | 1/1 PASS |
| **Total do repositório** | **18 PASS** — eram 4 |

Cobertura do contrato, um teste por linha da tabela do Task Packet: método diferente de GET, sem
`Authorization`, `Authorization` malformada em sete variações, esquema Bearer sem distinguir
maiúsculas, ambiente não configurado, token inválido, falha de reconciliação e sucesso.

Além do contrato: `Cache-Control: no-store` e `Content-Type` em todas as respostas, ausência de
qualquer header de CORS, e o token repassado íntegro ao verificador.

### Testes de segurança

| Caso | O que verifica |
|---|---|
| Headers `x-user-id` e `x-user-email` injetados | A reconciliação usa **somente** `subject` e `email` vindos do token verificado |
| Sem credencial contra ambiente não configurado | Devolve `401`, não `503` — o estado de configuração não vaza para quem não se identificou |
| Erro de driver com host e mensagem de autenticação | O corpo devolvido não contém nenhum detalhe do driver |
| Token presente durante falha de reconciliação | O log registrado não contém o token |

### Gates

```
pnpm run ci    9/9 tarefas
build          Route (app):  ƒ /api/identity/me   dinâmica, server-rendered on demand
git status     limpo após build
```

Nenhum arquivo de `supabase/`, `scripts/` ou `.github/` foi tocado: a Edge Function permanece
versionada e ativa, como o Task Packet exige. A desativação é o item 2 do Epic 0.

### Não provado

A reconciliação autenticada ao vivo. Depende de `SUPABASE_DB_URL` ser provisionada na Vercel,
ação que este Task Packet não autoriza. Sem ela a rota devolve o `503` de serviço não configurado,
que é o comportamento correto previsto no contrato.

### Não entregue

Testes do repositório de identidade. Dois impedimentos, ambos fora do escopo deste Packet:

1. `packages/db/src/*.ts` importa com extensão `.js`, e o type stripping do Node não reescreve
   `.js` para `.ts` — verificado empiricamente. Importar do `dist` exigiria `test` depender de
   `build` no `turbo.json`, e a CI hoje roda `test` **antes** de `build`;
2. os casos que importam — primeira reconciliação, repetição e corrida — exigem PostgreSQL vivo, e
   a CI não tem service container de banco.

O contrato HTTP, que é a exigência de paridade desta fatia, está integralmente coberto.
