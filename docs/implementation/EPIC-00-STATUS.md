# Epic 0 — Foundation — Status de Continuidade

> **ATUALIZAÇÃO VIGENTE — 2026-09-25:** a topologia Render/NestJS/BullMQ/Valkey descrita abaixo é histórica e foi **superseded por ADR-016**. O backend vigente usa Supabase Edge Functions + Supabase Queues (PGMQ) + Supabase Cron, com PostgreSQL/Auth/Storage/Realtime no próprio Supabase. Referências antigas ao Render permanecem apenas como evidência do estado/testes anteriores e não orientam novas implementações.


- **Data:** 2026-09-25
- **Branch:** `epic/00-foundation`
- **Implementation Plan:** `docs/source-of-truth/canonical/06-IMPLEMENTATION-PLAN.md`
- **Estado:** implementação técnica concluída; aguardando revisão/merge da branch
- **Feature implementation:** ainda não iniciada
- **CI final:** PASS — GitHub Actions run `36161167515`

## Autoridade documental obrigatória

Antes de qualquer decisão ou código posterior, consultar:

1. `docs/source-of-truth/README.md`
2. `docs/source-of-truth/CURRENT-DECISIONS.md`
3. `docs/source-of-truth/canonical/01-PRD.md`
4. `docs/source-of-truth/canonical/02-TRD-OFICIAL.md`
5. `docs/source-of-truth/canonical/03-APP-FLOW-OFICIAL.md`
6. `docs/source-of-truth/canonical/04-UI-UX-DESIGN.md`
7. `docs/source-of-truth/canonical/05-BACKEND-SCHEMA-DOMAIN-MODEL.md`
8. `docs/source-of-truth/canonical/06-IMPLEMENTATION-PLAN.md`
9. `docs/architecture/TECHNICAL-ARCHITECTURE.md`
10. `docs/adr/README.md` + ADRs aplicáveis
11. este arquivo e `EPIC-00-QA.md`

## Decisões vigentes importantes

- marca final do produto ainda não definida; novos nomes devem ser neutros;
- scaffold definitivo usa root `saas-platform` e scope `@saas/*`;
- SMS/Twilio está fora do escopo atual;
- webhook público real do Resend está deferido e não bloqueia o Epic 0;
- código de PoC é evidência, não código de produção;
- nenhuma feature de negócio foi criada no Epic 0.

## Gates arquiteturais

- [x] G0.1 — Framework Web: **Next.js 16 App Router / ADR-013 Accepted**.
- [x] G0.2 — Framework API: **NestJS 12 + FastifyAdapter / ADR-014 Accepted**.
- [x] G0.3 — Topologia de deploy/ambientes: **ADR-015 Accepted**.
- [x] G0.4 — Naming neutro preservado enquanto a marca final não é definida.

## Checklist do Epic 0

- [x] Implementation Plan v1.0 aprovado e mergeado na `main`.
- [x] Branch `epic/00-foundation` criada a partir da `main` aprovada.
- [x] Estrutura definitiva `apps/web`, `apps/api`, `apps/worker`, `apps/mobile`.
- [x] Packages compartilhados aprovados criados.
- [x] Boundary de migrations `@saas/db` criado com Drizzle ORM + Drizzle Kit, sem antecipar tabelas de domínio.
- [x] Runtime/package manager/versões validadas fixadas.
- [x] Lockfile versionado.
- [x] CI baseline configurada em modo read-only + `--frozen-lockfile`.
- [x] Contrato Development/Staging/Production documentado.
- [x] Política de secrets documentada + verificação automática baseline.
- [x] Baseline de observabilidade instalado.
- [x] Health/readiness contracts de API/Worker criados.
- [x] Bootstrap local documentado.
- [x] Bootstrap de Staging documentado antes de provisionar Staging.
- [x] Testes unitários mínimos da fundação criados.
- [x] Smoke real da API executado em CI.
- [x] Smoke real do Worker contra Valkey 8 executado em CI.
- [x] Build deixa o repositório limpo.
- [x] Gates finais do Epic 0 executados.

## Estrutura definitiva criada

```text
apps/
  web/       Next.js 16 App Router
  api/       NestJS 12 + Fastify
  worker/    Node + BullMQ/Valkey foundation
  mobile/    Expo 57 + Expo Router

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

## Baseline técnico

- Node.js 24.21.0
- pnpm 12.6.0
- Turborepo 2.11.4
- TypeScript 6.0.3
- Oxlint 1.85.0
- Next.js 16.3.6
- React 19.2.x conforme app validado
- Tailwind CSS 4.3.3
- NestJS 12.1.0
- Fastify 5.12.5
- Drizzle ORM 0.45.3
- Drizzle Kit 0.31.11
- BullMQ 6.3.4
- ioredis 6.0.0
- Expo SDK 57
- OpenTelemetry contracts validados no POC-12
- Sentry Node 11.0.0

## CI final — evidência

GitHub Actions run:

`36161167515`

Resultado:

- committed dependencies / frozen lockfile: PASS
- foundation structure: PASS
- secret baseline: PASS
- lint: PASS
- unit tests: PASS
- TypeScript: PASS
- build: PASS
- API `/health`: PASS
- API readiness-negative contract: PASS
- Worker readiness contra Valkey 8: PASS
- zero business handlers no Worker: confirmado
- repository clean after build/tests: PASS

## Documentos operacionais produzidos

- `docs/implementation/EPIC-00-FOUNDATION-BASELINE.md`
- `docs/implementation/ENVIRONMENTS.md`
- `docs/implementation/SECRETS.md`
- `docs/implementation/LOCAL-BOOTSTRAP.md`
- `docs/implementation/STAGING-BOOTSTRAP.md`
- `docs/implementation/EPIC-00-QA.md`

## O que NÃO foi feito

- nenhuma feature de negócio;
- nenhuma tabela de domínio;
- nenhuma migration de domínio;
- nenhum ambiente Staging/Production foi provisionado;
- nenhum secret de Production foi criado ou copiado;
- nenhum bundle ID/mobile store signing definitivo;
- nenhum custom domain;
- nenhum sizing/autoscaling/budget de Production;
- nenhum SMS/Twilio;
- nenhum webhook público real do Resend.

## Modelo operacional ChatGPT × Codex

Antes do início do Epic 1 foram adicionadas regras obrigatórias de execução:

- `AGENTS.md` — regras de repositório e política rígida de não invenção para o Codex;
- `docs/implementation/CHATGPT-CODEX-OPERATING-MODEL.md` — separação de responsabilidades;
- `docs/implementation/CODEX-TASK-TEMPLATE.md` — formato obrigatório para toda tarefa enviada ao Codex.

A partir do Epic 1, o fluxo padrão será:

`ChatGPT planeja/documenta → Codex implementa/testa → ChatGPT revisa → gate de merge`.

Nenhuma decisão crítica deve existir apenas na conversa.

## Próximo passo conforme Implementation Plan

Após revisão e merge do Epic 0, a próxima etapa documental/técnica é:

**Epic 1 — Identity / Workspace / Membership / Permissions**

Não iniciar Epic 1 antes do merge/aprovação da fundação.

## Supabase-only foundation update — 2026-09-25

ADR-016 replaces the former Render API/Worker/Key Value topology. Current foundation uses Vercel for Web, Supabase for the entire backend/data plane, Expo/EAS for Mobile and GitHub Actions for CI. The old API/Worker/Valkey CI evidence above remains historical only.
