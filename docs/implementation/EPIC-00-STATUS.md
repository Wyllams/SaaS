# Epic 0 — Fundação e migração — Status de Continuidade

- **Última reconciliação:** 2026-09-25
- **Implementation Plan vigente:** `docs/source-of-truth/canonical/06-IMPLEMENTATION-PLAN.md`
- **Estado:** **Fase 1 concluída e superseded · Fase 2 NÃO INICIADA**
- **Task Packet da Fase 2:** ainda não emitido
- **CI da Fase 1:** PASS — GitHub Actions run `36161167515` (evidência histórica; ver §7)

---

## 1. Aviso de leitura — este Epic tem duas fases

O Epic 0 foi redefinido pela base documental v2.0 (commit `76ad33b`). A versão anterior deste
arquivo declarava o Epic 0 **concluído**, o que hoje é falso: concluída está a **Fase 1**, cuja
arquitetura foi revogada. A **Fase 2** é o Epic 0 vigente e está inteiramente aberta.

| | Fase 1 — Fundação Render/NestJS | Fase 2 — Fundação e migração |
|---|---|---|
| **Fonte** | Implementation Plan v1.0 | Implementation Plan v2.0, seção "Epic 0" |
| **Arquitetura** | Render + NestJS + BullMQ + Valkey + Expo | Vercel + Next.js + Supabase + pgmq/pg_cron + PWA |
| **Estado** | Concluída, CI PASS, mergeada | **Não iniciada** |
| **Autoridade** | Histórica. Não orienta implementação. | **Vigente** |
| **Revogada por** | ADR-016, ADR-017, ADR-018 | — |

Nada da Fase 1 pode ser reintroduzido por leitura isolada deste arquivo. A precedência é a do
`AGENTS.md` §3.

---

## 2. Autoridade documental obrigatória

Antes de qualquer decisão ou código, consultar nesta ordem:

1. `docs/source-of-truth/README.md`
2. `docs/source-of-truth/CURRENT-DECISIONS.md`
3. `docs/source-of-truth/canonical/06-IMPLEMENTATION-PLAN.md`
4. `docs/architecture/TECHNICAL-ARCHITECTURE.md`
5. `docs/adr/README.md` + ADRs aplicáveis
6. este arquivo e `EPIC-00-QA.md`

Fontes canônicas por domínio: `01-PRD.md`, `02-TRD-OFICIAL.md`, `03-APP-FLOW-OFICIAL.md`,
`04-UI-UX-DESIGN.md`, `05-BACKEND-SCHEMA-DOMAIN-MODEL.md`.

---

## 3. Decisões vigentes que restringem este Epic

- marca final do produto ainda **não definida**; todo identificador permanece brand-neutral;
- root `saas-platform`, scope `@saas/*`;
- SMS/Twilio fora de escopo;
- webhook público real do Resend deferido;
- código de PoC é evidência, não código de produção;
- PostgreSQL é a fonte de verdade transacional; Realtime é entrega, não verdade;
- autorização é server-side; visibilidade de UI nunca é autorização;
- secrets nunca entram no Git;
- Production não reutiliza recursos ou credenciais de Development/Staging;
- nenhuma feature de negócio pertence ao Epic 0.

---

## 4. Gates arquiteturais — estado revisado

| Gate | Decisão | Estado |
|---|---|---|
| G0.1 | Framework Web: Next.js App Router | **Vigente** — ADR-013 Accepted |
| G0.2 | ~~Framework API: NestJS 12 + Fastify~~ | **MORTO** — ADR-014 Superseded by ADR-016; a camada de aplicação é Next.js por ADR-017 |
| G0.3 | ~~Topologia de deploy Render~~ | **MORTO** — ADR-015 Superseded by ADR-016 |
| G0.4 | Naming brand-neutral | **Vigente** |
| G0.5 | Runtime de backend: Supabase | **Vigente** — ADR-016 Accepted |
| G0.6 | Execução HTTP de negócio: Route Handlers / Server Actions em `apps/web` | **Vigente** — ADR-017 Accepted, emenda ADR-016 |
| G0.7 | Superfície de campo: PWA; `apps/mobile` fora da V1 | **Vigente** — ADR-018 Accepted |

---

## 5. Checklist da Fase 2 — Epic 0 vigente

Derivado do Implementation Plan v2.0, seção "Epic 0 — Fundação e migração".

**Legenda:** `[x]` concluído com evidência · `[-]` em andamento · `[ ]` não iniciado · `BLOCKED` depende de decisão externa.

### Já concluído pelo ADR-016 — não repetir

- [x] `apps/api` e `apps/worker` removidos como unidades de runtime/workspace.
- [x] Dependências de NestJS, BullMQ, Valkey e Render removidas dos manifests.
- [x] `pgmq`, `pg_cron` e `pg_net` habilitados por migration versionada.
- [x] Contrato de identidade do Slice 01 migrado para a Edge Function `identity-me`.

### Trabalho da Fase 2

- [-] **1.** Migrar a Edge Function `identity-me` para **Route Handler** em `apps/web`. Implementado e testado em 2026-09-26, com 14 testes cobrindo o contrato; falta apenas a prova autenticada ao vivo, que depende de `SUPABASE_DB_URL` ser provisionada na Vercel. Ver §11.
- [ ] **2.** Remover a Edge Function do Supabase **somente após** a paridade. Ver §6.1 — remover o arquivo quebra a CI se os verificadores não forem atualizados no mesmo commit.
- [ ] **3.** Implementar o worker de fila como **rota protegida acionada por Vercel Cron**, substituindo o dispatch por `pg_net`.
- [ ] **4.** Avaliar a remoção de `pg_net`, que deixa de ser necessário para fila.
- [ ] **5.** Criar `packages/domain` e `packages/i18n`.
- [ ] **6.** Reavaliar `packages/api-client` e `packages/domain-types`. Ver §6.2 — ambos são exigidos por `verify-structure`.
- [x] **7.** Destino de `apps/mobile` decidido pelo Product Owner em 2026-09-26: **removido** do Git, do workspace e da CI. Ver §6.3.
- [ ] **8.** Configurar Drizzle Kit com conexão direta para migration e pooler transaction para runtime.
- [ ] **9.** Estabelecer o contrato de configuração por ambiente e a política de secret.
- [ ] **10.** Ativar observabilidade: `request_id`, logs estruturados, Sentry e OpenTelemetry.
- [ ] **11.** Rota de health e readiness.
- [ ] **12.** Manter todo identificador brand-neutral.

### CI exigida pelo gate

- [x] Integridade de dependências — `pnpm install --frozen-lockfile`
- [x] Lint — Oxlint
- [x] Type-check
- [x] Testes
- [ ] **Cobertura por módulo** — não existe na CI atual; limiares definidos no TRD §12.1
- [ ] **Validação de migration** — não existe na CI atual
- [x] Build
- [x] Verificação de secret

### Gate de saída da Fase 2

- [x] um único app implantável, construído a partir de lockfile commitado — `apps/web`, verificado em 2026-09-26 com `--frozen-lockfile` e `pnpm run ci` completos;
- [x] nenhum vestígio de NestJS, BullMQ ou Valkey nos manifests versionados — verificado 2026-09-25;
- [ ] `identity-me` servido por Route Handler, com a Edge Function desativada;
- [ ] worker de fila acionado por Vercel Cron, verificado sob falha e reinício;
- [ ] CI verde com os gates acima;
- [x] ADRs 017 a 023 aceitos — verificado 2026-09-25;
- [ ] nenhum secret ou ID de PoC vazado para configuração de produto.

---

## 6. Estado real do repositório — verificado em 2026-09-25

Verificação feita no commit `76ad33b` por inspeção direta de `git ls-files`,
`pnpm-workspace.yaml`, `scripts/verify-structure.mjs` e `.github/workflows/ci.yml`.

**Workspaces versionados: 9.**

```text
apps/
  web/       Next.js App Router — único app implantável

packages/
  api-client/      domain-types/     observability/
  config/          design-tokens/    ui-web/
  db/              validation/
```

`apps/web` versionado contém somente `layout.tsx`, `page.tsx`, `login/page.tsx`, `globals.css`,
`lib/supabase/browser.ts` e configuração. **Não existe nenhum Route Handler.**

**Backend Supabase versionado:**

```text
supabase/config.toml
supabase/functions/identity-me/index.ts
supabase/migrations/20260925230745_enable_supabase_async_infrastructure.sql
supabase/migrations/20260925232430_index_identity_mapping_user_id.sql
```

### 6.1 Armadilha — remover a Edge Function quebra a CI

`identity-me` é exigido em **dois** verificadores. O item 2 da Fase 2 falha a CI se o arquivo
for removido sem alterar ambos no mesmo commit:

| Local | Asserção |
|---|---|
| `scripts/verify-structure.mjs` | `access(resolve(root, "supabase/functions/identity-me/index.ts"))` |
| `.github/workflows/ci.yml` | `test -f supabase/functions/identity-me/index.ts` |

O Task Packet do item 2 precisa autorizar explicitamente a edição desses dois arquivos e
substituir a asserção pelo caminho do novo Route Handler. A alternativa — manter um arquivo
morto no Git só para satisfazer a CI — contradiz o gate de saída.

### 6.2 Armadilha — `verify-structure` congela a lista de packages

`scripts/verify-structure.mjs` exige **exatamente** os 9 workspaces atuais, com nome e
`private: true`. Os itens 5 e 6 da Fase 2 ainda alteram essa lista: criam `packages/domain` e
`packages/i18n`, e podem remover `packages/api-client` e `packages/domain-types`. Cada uma dessas
mudanças exige atualizar o script no mesmo commit.

O item 7 já passou por aqui: a remoção de `apps/mobile` em 2026-09-26 levou o script de 10 para
9 workspaces, no mesmo commit da remoção — exatamente o procedimento que esta seção exige.

### 6.3 `apps/mobile` — removido em 2026-09-26

O ADR-018 tirou `apps/mobile` do escopo da V1, mas ele permanecia versionado, no workspace e
exigido pela CI — o repositório afirmava duas coisas incompatíveis. O Product Owner decidiu
**remover**, e a remoção foi executada: 7 arquivos versionados apagados, entrada retirada de
`pnpm-workspace.yaml` e de `scripts/verify-structure.mjs`, e `pnpm-lock.yaml` regenerado.

Nada ficou órfão: `@saas/api-client` e `@saas/design-tokens` continuam consumidos por
`apps/web` e por `@saas/ui-web`. O `turbo.json` e o workflow de CI nunca referenciaram mobile.

Recuperar o app, se um dia voltar, é `git show` no commit anterior à remoção.

### 6.4 Resíduo local, não versionado

`apps/api/` e `apps/worker/` ainda existem em checkouts locais contendo apenas `.turbo`, `dist`
e `node_modules`. **Zero arquivos versionados** nos dois diretórios. Não é erro de documentação
nem de repositório — é sobra de build local, e pode ser apagada.

---

## 7. Histórico — Fase 1 (concluída, superseded)

Tudo nesta seção é **evidência histórica**. Não orienta implementação.

### 7.1 Estrutura criada na Fase 1

```text
apps/web · apps/api (NestJS 12 + Fastify) · apps/worker (BullMQ/Valkey) · apps/mobile (Expo 57)
packages/api-client · config · db · design-tokens · domain-types · observability · ui-web · validation
```

`apps/api` e `apps/worker` foram removidos pelo ADR-016.

### 7.2 Baseline técnico da Fase 1

Permanece válido: Node.js 24.21.0 · pnpm 12.6.0 · Turborepo 2.11.4 · TypeScript 6.0.3 ·
Oxlint 1.85.0 · Next.js 16.3.6 · React 19.2.x · Tailwind CSS 4.3.3 · Drizzle ORM 0.45.3 ·
Drizzle Kit 0.31.11 · Sentry Node 11.0.0 · contratos OpenTelemetry validados no POC-12.

**Saiu do stack:** NestJS 12.1.0 · Fastify 5.12.5 · BullMQ 6.3.4 · ioredis 6.0.0 ·
Expo SDK 57 (fora da V1 por ADR-018).

### 7.3 CI final da Fase 1 — run `36161167515`

PASS em: frozen lockfile · foundation structure · secret baseline · lint · unit tests ·
TypeScript · build · API `/health` · API readiness-negative · Worker readiness contra Valkey 8 ·
zero business handlers no Worker · repository clean after build.

As evidências de API, Worker e Valkey pertencem a runtimes que **não existem mais**. A CI atual
não executa nenhuma delas.

### 7.4 Entregas documentais da Fase 1 — ainda vigentes

- `docs/implementation/EPIC-00-FOUNDATION-BASELINE.md`
- `docs/implementation/ENVIRONMENTS.md`
- `docs/implementation/SECRETS.md`
- `docs/implementation/LOCAL-BOOTSTRAP.md`
- `docs/implementation/STAGING-BOOTSTRAP.md`
- `docs/implementation/EPIC-00-QA.md`

Os itens 8, 9 e 11 da Fase 2 podem exigir revisão de `ENVIRONMENTS.md`, `SECRETS.md` e
`LOCAL-BOOTSTRAP.md`, que ainda descrevem a topologia Render.

---

## 8. O que NÃO foi feito em nenhuma das fases

- nenhuma feature de negócio;
- nenhuma tabela de domínio além de `users` e `user_supabase_identities` (Epic 1 Slice 01);
- nenhum ambiente Staging provisionado;
- nenhum secret de Production criado ou copiado;
- nenhum custom domain — o domínio será comprado por último, antes da produção;
- nenhum sizing, autoscaling ou budget de Production;
- nenhum SMS/Twilio;
- nenhum webhook público real do Resend;
- nenhuma cobertura por módulo configurada na CI.

---

## 9. Modelo operacional ChatGPT × Codex

Regras obrigatórias de execução:

- `AGENTS.md` — regras de repositório e política de não invenção;
- `docs/implementation/CHATGPT-CODEX-OPERATING-MODEL.md` — separação de responsabilidades;
- `docs/implementation/CODEX-TASK-TEMPLATE.md` — formato obrigatório de toda tarefa.

Fluxo padrão: `ChatGPT planeja/documenta → Codex implementa/testa → ChatGPT revisa → gate de merge`.

Nenhuma decisão crítica deve existir apenas na conversa.

---

## 11. Slice 01 — Route Handler de identidade, 2026-09-26

Executado sob `docs/implementation/EPIC-00-SLICE-01-TASK-PACKET.md`, aprovado pelo Product Owner.

### O que foi entregue

| Arquivo | Papel |
|---|---|
| `apps/web/src/lib/identity/handle-identity-request.ts` | Handler puro, recebe dependências por parâmetro |
| `apps/web/src/lib/identity/runtime.ts` | Fábrica das dependências reais, com cache de módulo |
| `apps/web/src/app/api/identity/me/route.ts` | Rota fina, runtime Node, `force-dynamic` |
| `apps/web/tests/identity-contract.test.mjs` | 14 testes cobrindo as sete linhas do contrato |

O build confirma a rota como dinâmica: `ƒ /api/identity/me`.

### Reuso, conforme o Packet exigia

`createIdentityRepository` de `@saas/db` foi reusado sem alteração. A reconciliação, com transação
e tratamento de corrida por chave única de `subject`, **não foi reimplementada**. A Edge Function
duplicara a lógica em SQL cru apenas porque Deno não importa workspace package.

Testes passaram de **4 para 18** no repositório inteiro.

### Diferenças autorizadas em relação à Edge Function

1. **CORS removido.** A rota é same-origin com o `SCR-AUTH-001`; o wildcard
   `Access-Control-Allow-Origin: *` não tem mais razão de existir e manter seria degradar a
   segurança. Há teste afirmando que nenhum header de CORS é emitido.
2. **`OPTIONS` passa a devolver 405** em vez de 200. É consequência direta de (1): sem CORS não há
   preflight. Chamada cross-origin agora é bloqueada pelo navegador, que é o comportamento desejado.

### Decisão de configuração

O Packet não fixava nomes de variável. A Edge Function lia `SUPABASE_URL`, `SUPABASE_ANON_KEY` e
`SUPABASE_DB_URL`, das quais **nenhuma existe na Vercel**. A rota passou a ler:

- `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` para verificar o token — são
  valores públicos por definição, como o `SECRETS.md` registra, e **já estão provisionados**;
- `SUPABASE_DB_URL` para o banco — **server-only, ainda não provisionada**.

Assim o Product Owner precisa criar **uma** variável, não três. Faltando qualquer uma, a rota
devolve o `503` de serviço não configurado previsto no contrato — o código está completo, o
ambiente é que está pendente.

### Achados registrados, não alterados

1. **`max` do `Pool` em `packages/db/src/database.ts`.** Vale 5, escolhido para um processo
   persistente. Em serverless cada instância abre o seu, e o total cresce com a concorrência. O
   Packet mandava registrar em vez de alterar por conta própria. Pertence ao item 8 do Epic 0,
   junto com a configuração de pooler transaction do ADR-002 emendado.
2. **`packages/domain` não existe.** O ADR-017 põe Application Service lá, mas criá-lo é o item 5,
   fora deste escopo. A composição ficou em `apps/web/src/lib/identity/`, como o próprio Packet
   previu. **Mover quando o item 5 rodar.**
3. **Deriva de e-mail não é reconciliada.** Se o e-mail mudar no Supabase Auth, a resposta continua
   devolvendo o e-mail gravado no `User` de negócio, porque o repositório retorna o registro
   existente. A Edge Function tinha exatamente o mesmo comportamento, então a paridade está
   preservada — mas é questão de produto em aberto para o Epic 1.
4. **`uuidv7()` é gerado mesmo quando o usuário já existe.** A assinatura do repositório exige o
   `id` antecipado. Desperdício irrelevante, sem efeito de correção. Não alterei a assinatura
   porque mexer em `@saas/db` além do reuso não estava autorizado.

### Não entregue — testes de repositório

O Packet listava testes do repositório de identidade como obrigatórios. **Não foram entregues**,
por dois impedimentos que não são contornáveis dentro deste escopo:

1. `packages/db/src/*.ts` importa com extensão `.js`, e o type stripping do Node **não** reescreve
   `.js` para `.ts` — verificado empiricamente. Importar do `dist` exigiria `test` depender de
   `build` no `turbo.json`, e hoje a CI roda `test` **antes** de `build`;
2. os casos que importam — primeira reconciliação, repetição e corrida — exigem PostgreSQL vivo, e
   a CI não tem service container de banco.

Ambos exigem mudança de infraestrutura de CI não autorizada por este Packet. O contrato HTTP, que é
a exigência de paridade desta fatia, está coberto pelos 14 testes.

**Para destravar:** autorizar `dependsOn: ["^build"]` na task `test` e um Postgres em service
container na CI, em Task Packet próprio.

---

## 10. Próximo passo exato

**Emitir o Task Packet do Epic 0 / Fase 2 / item 1** — migrar `identity-me` para Route Handler
em `apps/web`, preservando o contrato do Slice 01 com paridade comprovada por teste.

O Task Packet precisa autorizar explicitamente:

- criação do Route Handler em `apps/web`;
- teste de paridade contra o contrato atual da Edge Function;
- **não** remover a Edge Function nesta tarefa — a remoção é o item 2 e depende da paridade;
- nenhuma mudança de schema, secret ou ambiente remoto.

### Blockers

**Nenhum em aberto.**

Resolvidos em 2026-09-26:

- **destino de `apps/mobile`** — Product Owner decidiu remover; executado. Ver §6.3.
- **ADR-002 descrevia o Render como runtime** — emendado. O ramo "Persistent API and Workers"
  foi marcado como não aplicável e o ramo serverless passou a ser o operativo, coerente com o
  item 8. Sem essa emenda, o item 8 pararia por conflito entre plano e ADR.
