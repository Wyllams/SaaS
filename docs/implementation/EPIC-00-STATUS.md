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

- [ ] **1.** Migrar a Edge Function `identity-me` para **Route Handler** em `apps/web`, preservando o contrato do Slice 01, com paridade comprovada por teste.
- [ ] **2.** Remover a Edge Function do Supabase **somente após** a paridade. Ver §6.1 — remover o arquivo quebra a CI se os verificadores não forem atualizados no mesmo commit.
- [ ] **3.** Implementar o worker de fila como **rota protegida acionada por Vercel Cron**, substituindo o dispatch por `pg_net`.
- [ ] **4.** Avaliar a remoção de `pg_net`, que deixa de ser necessário para fila.
- [ ] **5.** Criar `packages/domain` e `packages/i18n`.
- [ ] **6.** Reavaliar `packages/api-client` e `packages/domain-types`. Ver §6.2 — ambos são exigidos por `verify-structure`.
- [ ] **7.** Decidir e registrar o destino de `apps/mobile` — fora da V1 pelo ADR-018. Ver §6.3. **BLOCKED**.
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

- [ ] um único app implantável, construído a partir de lockfile commitado;
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

**Workspaces versionados: 10.**

```text
apps/
  web/       Next.js App Router — único app implantável
  mobile/    Expo — AINDA versionado e no workspace; fora da V1 pelo ADR-018

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

`scripts/verify-structure.mjs` exige **exatamente** os 10 workspaces atuais, com nome e
`private: true`. Os itens 5, 6 e 7 da Fase 2 alteram essa lista: criam `packages/domain` e
`packages/i18n`, podem remover `packages/api-client` e `packages/domain-types`, e podem remover
`apps/mobile`. Cada uma dessas mudanças exige atualizar o script no mesmo commit.

### 6.3 `apps/mobile` contradiz o ADR-018

O ADR-018 tira `apps/mobile` do escopo da V1, mas ele permanece versionado (7 arquivos), listado
em `pnpm-workspace.yaml` e **exigido** por `verify-structure.mjs`. O item 7 existe para resolver
isso. Enquanto não houver decisão registrada, o repositório afirma duas coisas incompatíveis.
O `AGENTS.md` §1 proíbe o Codex escolher sozinho entre remover, arquivar ou congelar.

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

## 10. Próximo passo exato

**Emitir o Task Packet do Epic 0 / Fase 2 / item 1** — migrar `identity-me` para Route Handler
em `apps/web`, preservando o contrato do Slice 01 com paridade comprovada por teste.

O Task Packet precisa autorizar explicitamente:

- criação do Route Handler em `apps/web`;
- teste de paridade contra o contrato atual da Edge Function;
- **não** remover a Edge Function nesta tarefa — a remoção é o item 2 e depende da paridade;
- nenhuma mudança de schema, secret ou ambiente remoto.

### Blockers

`BLOCKED — DOCUMENTATION DECISION REQUIRED` · **destino de `apps/mobile`**

1. **Decisão faltante:** remover do Git, arquivar fora do workspace, ou manter congelado com justificativa registrada.
2. **Documentos consultados:** ADR-018, ADR-011, `06-IMPLEMENTATION-PLAN.md` item 7 do Epic 0, `pnpm-workspace.yaml`, `scripts/verify-structure.mjs`.
3. **Conflito:** o ADR-018 exclui `apps/mobile` da V1, mas ele segue versionado, no workspace e exigido pela CI.
4. **Bloqueia:** item 7 da Fase 2 e o gate de saída "um único app implantável". Arquivos afetados: `apps/mobile/**`, `pnpm-workspace.yaml`, `scripts/verify-structure.mjs`.
