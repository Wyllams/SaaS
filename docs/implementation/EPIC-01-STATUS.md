# Epic 1 — Identity / Workspace / Membership / Permissions — Status

> **ATUALIZAÇÃO VIGENTE — 2026-09-25:** a topologia Render/NestJS/BullMQ/Valkey descrita abaixo é histórica e foi **superseded por ADR-016**. O backend vigente usa Supabase Edge Functions + Supabase Queues (PGMQ) + Supabase Cron, com PostgreSQL/Auth/Storage/Realtime no próprio Supabase. Referências antigas ao Render permanecem apenas como evidência do estado/testes anteriores e não orientam novas implementações.


- **Date:** 2026-09-25
- **Implementation Plan:** `docs/source-of-truth/canonical/06-IMPLEMENTATION-PLAN.md`
- **State:** Slice 01 identity handoff has been migrated to the active Supabase Edge Function `identity-me`; the Render API is historical/superseded. Successful authenticated reconciliation still requires a controlled account proof.
- **Foundation:** Product Owner reports Epic 0 integrated to `main`; this local checkout was initialized as a new empty Git repository on 2026-09-25, so that history has not been verified locally.

## Scope of the Epic

Epic 1 establishes the tenancy and authorization foundation required by all later tenant-owned domains:

- User / external identity separation;
- Workspace, Location and Membership;
- Role, Permission and scopes;
- Invite lifecycle;
- portal-access separation;
- consent/onboarding state;
- backend/database authorization and RLS;
- privileged-change security/audit events.

Primary product surfaces are `SCR-AUTH-001..008`, `SCR-ONB-001..002`, and user/workspace/location controls used by Settings and the global shell.

## Approved decomposition — first slice

### EPIC-01-SLICE-01 — Authentication and server-side identity boundary

**Objective:** implement a real email/password authentication entry point for `SCR-AUTH-001`, backed by Supabase Auth and a server-side global User identity reconciliation boundary.

**Included:**

- email/password authentication only;
- server-side session validation;
- external identity kept separate from the business User identity;
- `SCR-AUTH-001` connected to the real contract, not fixture state;
- approved authentication error behavior and tests appropriate to the implemented contract.

**Explicitly excluded:**

- Google OAuth;
- password recovery;
- trial/plan selection and billing;
- Workspace, Location, Membership, Role, Permission and scope implementation;
- RLS for tenant-owned data;
- onboarding, consent flow and invites;
- portal access;
- remote Supabase/Auth configuration and privileged credentials.

Google OAuth was deliberately deferred by the Product Owner on 2026-09-25. It cannot enter this slice without a later approved Task Packet.

## Checklist de acompanhamento

**Legenda:** `[x]` concluído com evidência registrada; `[-]` em andamento; `[ ]` ainda não iniciado; `BLOCKED` depende de decisão ou autorização externa.

### Governança e planejamento

- [x] Confirmar o Epic 1 como próximo passo pelo Implementation Plan aprovado.
- [x] Cruzar as fontes oficiais aplicáveis e registrar a precedência documental.
- [x] Criar `EPIC-01-STATUS.md`.
- [x] Criar `EPIC-01-QA.md` sem declarar testes não executados como aprovados.
- [x] Definir `EPIC-01-SLICE-01` e registrar Google OAuth como adiado.
- [x] Inicializar o repositório Git local a pedido do Product Owner, sem commit, branch remota ou histórico importado.
- [x] Aprovar o contrato de identidade: User interno separado e mapeamento dedicado para a identidade externa Supabase Auth.
- [x] Preparar o rascunho do Task Packet para `EPIC-01-SLICE-01`.
- [x] Obter aprovação explícita do Task Packet antes de implementar.

### Slice 01 — Authentication and server-side identity boundary

- [x] Arquivar os wireframes fornecidos pelo Product Owner em `docs/reference/wireframes/historical/2026-09-25/`, com manifesto e hashes de integridade; referência histórica, não fonte de autoridade.
- [x] Confirmar no código os pontos exatos de integração Web/API/DB autorizados pelo Task Packet.
- [x] Resolver a estratégia UUIDv7: geração na aplicação por dependência revisada, sem extensão nem alteração remota no PostgreSQL.
- [x] Preparar runtime local isolado: Node 24.21.0 + pnpm 12.6.0; dependências restauradas com lockfile congelado.
- [-] Implementar somente o contrato de autenticação email/password e identidade server-side autorizado. Tela, reconciliação e o handoff `identity-me` estão implementados em Supabase Edge Functions; falta exclusivamente a prova integrada com conta controlada.
- [x] Definir estado/lifecycle inicial e a representação persistida de `User`, aprovado pelo Product Owner em 2026-09-25.
- [x] Criar e aplicar a migration de identidade autorizada: `users` e `user_supabase_identities`, PKs, FK restritiva, check de status e RLS default-deny. Validação remota confirmou as duas tabelas, RLS ativo e zero policies públicas.
- [x] Implementar `SCR-AUTH-001` a partir do wireframe low-fi fornecido: e-mail, senha, submit, loading, erro genérico e estado de configuração indisponível; Google OAuth e recuperação permanecem fora do slice.
- [x] Criar boundary autenticada: token ausente/inválido é rejeitado antes da reconciliação; token verificado entrega somente sujeito e e-mail ao use case.
- [x] Implementar repositório transacional local para `subject → User`, com conflito de concorrência tratado pela chave única do mapping; typecheck do pacote de banco PASS.
- [-] Integrar `SCR-AUTH-001` à configuração Vercel/Supabase publicada: Production e Preview agora possuem URL e publishable key; erro seguro de credencial inválida foi comprovado. O caminho de sucesso permanece pendente de conta controlada e configuração server-side de identidade/database.
- [x] Definir e implementar o contrato de transporte autorizado para `GET /identity/me`: somente Bearer token, verificação server-side e retorno mínimo do User interno; sem Workspace/RBAC. O contrato está registrado no Task Packet e a API compilada devolveu 401/`UNAUTHENTICATED` para uma chamada sem credencial.
- [x] Criar e executar os testes unitários inicialmente possíveis do Slice 01: 12/12 PASS (token negativo, identidade verificada, criação, repetição, concorrência, campos não confiáveis ignorados, token vazio, parsing do Bearer e respostas HTTP 401/503/200); typecheck e build da API PASS. Web typecheck e build PASS.
- [x] Executar QA de navegador do estado seguro sem configuração: 320, 375, 768, 1024 e 1440 px sem overflow horizontal; campos e botão indisponíveis; console sem warnings/errors.
- [-] Executar QA de navegador autenticado, console e rede: Production foi verificado para configuração, erro seguro, console e responsividade; login bem-sucedido e reconciliação persistida exigem conta controlada e configuração server-side de identidade/database.
- [x] Revisar escopo, segurança e resultados; Status e QA atualizados com a migration e as evidências. `verify:structure`, `verify:secrets`, lint, testes, typecheck e build completos passaram. Diff sem erros de whitespace, baseline de secrets e alterações revisadas antes dos commits publicados em `main`.
- [x] Publicar o Web SaaS no Vercel Production após gates locais, usando o projeto `saas` e commit `105012c`.

### Obrigações restantes do Epic 1

Os itens abaixo são exigências do Implementation Plan. A ordem dos próximos slices será definida somente depois de cada Task Packet aprovado.

- [ ] Implementar métodos de autenticação aprovados restantes, quando cada um receber seu slice e autorização.
- [ ] Criar contratos de Workspace, Membership e Location scope.
- [ ] Implementar Roles, Permissions e scopes granulares.
- [ ] Implementar ciclo de vida de Invite.
- [ ] Implementar seleção e troca segura de múltiplos Workspaces.
- [ ] Aplicar RLS e autorização no backend/banco.
- [ ] Estabelecer a invariante de Primary Owner.
- [ ] Implementar resolução segura de deep links.
- [ ] Emitir eventos de segurança/auditoria para alterações privilegiadas.
- [ ] Executar e registrar todos os testes negativos obrigatórios do Epic.
- [ ] Confirmar o gate de saída: testes cross-tenant e de permissões negativas aprovados antes de qualquer mutação tenant-owned posterior.

### Ações explicitamente não autorizadas neste momento

- [x] Executar exclusivamente a migration remota revisada de identidade, autorizada pelo Product Owner em 2026-09-25; incluir RLS default-deny e validar tabelas/RLS após a aplicação.
- [x] Publicar em GitHub `main` e Vercel Production, explicitamente autorizado pelo Product Owner em 2026-09-25.
- [x] Evidência histórica: o backend NestJS chegou a ser publicado no Render. **Superseded:** ADR-016 migrou o handoff para Supabase Edge Functions; Render não é mais runtime atual.
- [ ] **Não executar sem nova decisão específica:** criação/alteração de conta Auth controlada ou qualquer mudança privilegiada fora do contrato aprovado.

## Required next artifact

The Task Packet draft is `docs/implementation/EPIC-01-SLICE-01-TASK-PACKET.md`. It requires Product Owner approval before Codex edits product code, schema, Auth configuration or a remote environment.

## Identity mapping decision

**Confirmed:** `packages/db/src/schema.ts` intentionally contains no physical domain tables, and the foundation has no Supabase Auth SDK/adapter. The Domain Model specifies a global business `User`; the TRD requires business relationships to use the internal `user.id`, not the authentication-provider ID.

**Approved by Product Owner on 2026-09-25:** Slice 01 may introduce a dedicated external-identity mapping owned by the identity domain. The internal business User remains distinct from the Supabase Auth UUID. The corresponding migration was initially local/Git only; the Product Owner subsequently authorized its one-time remote execution after review. It created only `users` and `user_supabase_identities`, enabled RLS on both, created no policy and changed no existing records. The Supabase SQL editor confirmed both tables have `rls_enabled = true` and `policy_count = 0`.

**Task Packet approval:** received from the Product Owner on 2026-09-25. Codex must not infer identity lifecycle, schema-state or provider details absent from the approved documents.

## UUIDv7 implementation blocker

The approved internal-ID direction is UUIDv7. The registered Supabase PostgreSQL version is 17.6; PostgreSQL 17 documentation does not provide native `uuidv7()`, while PostgreSQL 18 does. The Task Packet therefore blocks implementation rather than silently using UUIDv4.

**Decision required:** authorize either (a) a reviewed application-level UUIDv7 dependency for the identity domain, or (b) a reviewed PostgreSQL extension/function available in the Development environment. No remote database change is authorized by either option.

**Resolved by Product Owner on 2026-09-25:** use a reviewed application-level UUIDv7 dependency. No PostgreSQL extension/function or remote change is authorized.

## Runtime blocker — resolved

The foundation pins Node.js `>=24.21.0 <25` and pnpm `12.6.0`. The active system pnpm 12.6 wrapper fails before executing commands; the available fallback uses Node 24.19.0 and pnpm 11.19.0. The first TDD test therefore did not reach the expected missing-feature failure.

Resolved on 2026-09-25 with an isolated local Node 24.21.0 runtime and Corepack pnpm 12.6.0. Existing dependencies were restored using `pnpm install --frozen-lockfile`. This did not alter Supabase, Vercel, Git remotes or repository runtime configuration.

## Schema documentation blocker — resolved

Resolved by Product Owner on 2026-09-25: `User` has required `id` and `email`, optional `name` and `photo`, and global `status` restricted to `active` and `suspended` with `active` as initial state. The provider identity remains only in the dedicated Supabase mapping. This decision was added to the Task Packet before the schema was created.

## Mandatory Epic tests tracked for later slices

- unauthenticated;
- authenticated without membership;
- one and multiple workspaces;
- suspended membership;
- cross-workspace direct-ID attempt;
- location-scope violation;
- self-elevation;
- invite replay/expiry;
- Primary Owner transfer invariant;
- permission change during an active session.

These remain Epic-level obligations; Slice 01 covers only the authentication/identity tests supported by its approved scope.

## Boundaries and decisions

- Supabase Auth is the approved authentication provider for V1.
- The login screen is implemented at `/login`; its browser client uses only the publishable-key boundary and the API verifier uses server-only environment variables plus `auth.getUser(token)`.
- Historical wireframes are searchable in `docs/reference/wireframes/`, but must be reconciled with current decisions and the Task Packet before any visual implementation.
- Workspace remains the tenant boundary.
- Authentication is not authorization: later slices must enforce Membership, Permission and Location scope at backend/database boundaries.
- UI visibility and deep links never grant authorization.
- No Stripe, QuickBooks, Resend, SMS/Twilio, provider billing, or business domain work belongs to Epic 1 Slice 01.

## Documentation consulted

- `docs/source-of-truth/README.md`
- `docs/source-of-truth/CURRENT-DECISIONS.md`
- `docs/source-of-truth/canonical/01-PRD.md`
- `docs/source-of-truth/canonical/02-TRD-OFICIAL.md`
- `docs/source-of-truth/canonical/03-APP-FLOW-OFICIAL.md`
- `docs/source-of-truth/canonical/04-UI-UX-DESIGN.md`
- `docs/source-of-truth/canonical/05-BACKEND-SCHEMA-DOMAIN-MODEL.md`
- `docs/source-of-truth/canonical/06-IMPLEMENTATION-PLAN.md`
- `docs/architecture/TECHNICAL-ARCHITECTURE.md`
- `docs/adr/README.md` and applicable ADRs
- `docs/implementation/CHATGPT-CODEX-OPERATING-MODEL.md`
- `docs/implementation/CODEX-TASK-TEMPLATE.md`

## Current blockers

- `BLOCKED — SUCCESSFUL AUTHENTICATION EVIDENCE REQUIRED`: a conta controlada e a configuração server-side já existem, mas a prova final requer que o Product Owner envie uma vez as credenciais controladas na Web Production depois do deploy `4f912b1`. O Codex não recebe nem solicita a senha.

## Remote migration evidence

- **Target:** Supabase project `obpncbnzwrocvgngtodg` (SaaS), main/Production branch selected in the dashboard.
- **Applied:** 2026-09-25 through the Supabase SQL editor, after explicit Product Owner authorization.
- **Objects created:** `public.users`, `public.user_supabase_identities`.
- **Integrity verified:** `users_pkey`, `users_status_check`, `user_supabase_identities_subject_pk`, and `user_supabase_identities_user_id_users_id_fk` are present.
- **RLS verified:** both tables report `true`; public policy count is `0` for each table.
- **Correction recorded:** the initially generated local `CHECK` incorrectly qualified `users.status`; PostgreSQL rejected it and no tables were created. The source schema and local migration were corrected to `CHECK ("status" IN (...))`; the final remote execution used one atomic transaction and succeeded.

## Browser evidence — safe unavailable-configuration state

- **URL:** `http://localhost:3000/login`.
- **Viewports:** 320×640, 375×812, 768×900, 1024×900 and 1440×1000.
- **Observed:** `SCR-AUTH-001`, e-mail and senha labels/fields, explanatory unavailable-configuration feedback, and disabled sign-in button rendered at every viewport without horizontal overflow.
- **Console:** zero warnings and errors captured.
- **Not proved:** successful authentication, request response behavior and authenticated redirect; these require a configured Development environment.

## Production publication evidence

- **GitHub:** `main` advanced by fast-forward without force push. The identity transport contract is in `1e1cf9c` (`feat(epic-01): add identity transport boundary`).
- **Vercel project:** `wyllams-projects/saas`, root directory `apps/web`, Node.js 24.x.
- **Environment:** only `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` were added for Production and Preview; no secret/service key was used.
- **Deployment:** `https://saas-pi-one-31.vercel.app`, Ready; deployment `dpl_85kkG2rPrYRZeqhjD8idV1n6Dzk3`.
- **Live QA:** `/login` rendered configured e-mail/password inputs and enabled submit. One controlled non-existent account returned the generic message `Unable to sign in. Check your email and password.`; no console warnings/errors were captured.
- **Responsive QA:** Production `/login` had no horizontal overflow at 320×640, 375×812, 768×900, 1024×900 and 1440×1000.

## Render API deployment evidence

- **Service:** `saas-api`, Render Virginia (US East), plano Free; aviso da plataforma: instâncias Free hibernam por inatividade e podem atrasar uma solicitação por 50 segundos ou mais.
- **Source / runtime:** `Wyllams/SaaS` em `main`, commit `a8ac097`; Node 24.21.0; `APP_ENV=production`; nenhum secret foi inserido.
- **Runtime build:** os pacotes internos de runtime `@saas/config`, `@saas/db` e `@saas/observability` são compilados antes de `@saas/api`; a inicialização chama diretamente `node apps/api/dist/main.js`, evitando o consumo de memória do pnpm no boot Free.
- **Live deployment:** `dep-darek8gjo6nc73flk0eg`, `Deploy succeeded | Live`; origem `https://saas-api-0jkv.onrender.com`.
- **External checks:** `GET /health` retornou 200 `{"status":"ok","service":"api"}`; `GET /ready` retornou 503 com `database: missing` e `queue: missing`; `GET /identity/me` sem Bearer retornou 401 `UNAUTHENTICATED`. Não houve token, banco, secret ou reconciliação positiva nessas verificações.

## Final local gate evidence

- **Structure:** PASS — 12 workspaces brand-neutral verified.
- **Secrets baseline:** PASS — zero tracked implementation files scanned; no secret reported.
- **Lint:** PASS with warnings only. One warning in code novo foi corrigido; os avisos restantes pertencem ao acervo histórico imutável de wireframes.
- **Tests:** PASS — Turbo executou 12 testes da API, 3 de config e 1 de observability; todos passaram.
- **Typecheck:** PASS — 12 workspaces.
- **Build:** PASS — 12 workspaces; Next.js gerou `/login`.
- **Git review:** diff sem whitespace errors, baseline de secrets aprovada e alterações do contrato de transporte revisadas antes do commit. `1e1cf9c` foi enviado a `origin/main`; não houve force push, merge de PR nem deploy de API.

## Authenticated handoff completion — 2026-09-25

- [x] **Web handoff:** depois de `signInWithPassword`, `SCR-AUTH-001` entrega somente o access token da sessão ao `GET /identity/me` por `Authorization: Bearer`; falha de transporte permanece no erro genérico aprovado.
- [x] **CORS Production:** Render recebeu `WEB_ORIGIN` com a origem Production exata; não há wildcard nem cookies credenciados.
- [x] **API deploy:** Render publicou `4f912b1` como `dep-darfav142hec73agseng`, com estado `Deploy succeeded | Live`.
- [x] **CORS proof:** preflight de `https://saas-pi-one-31.vercel.app` para `/identity/me` retornou `204`, `Access-Control-Allow-Origin` exato, `Access-Control-Allow-Headers: authorization` e `Access-Control-Allow-Methods: GET`. Um Origin externo recebeu o cabeçalho da origem oficial e, por não corresponder à própria origem, é bloqueado pelo navegador.
- [-] **Live successful reconciliation:** pendente apenas de um novo submit da conta controlada na Web publicada e posterior inspeção de request/log/mapeamento. Nenhuma senha, token ou secret será solicitado, exibido ou registrado.

## Migração Supabase-only — 2026-09-25

- Edge Function `identity-me` versão 1: ACTIVE no projeto Supabase `obpncbnzwrocvgngtodg`.
- `pgmq`, `pg_cron` e `pg_net` habilitados.
- Web atualizado para invocar `identity-me` pelo cliente Supabase; `NEXT_PUBLIC_API_BASE_URL` removida.
- `apps/api` e `apps/worker` removidos como unidades de runtime/workspace.
- ADR-016 passa a ser a autoridade de backend.
- Antiga evidência Render permanece abaixo apenas como histórico.
