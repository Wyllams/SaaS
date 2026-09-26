# Epic 1 — Identidade, Workspace, Membership e Permissões — Status de Continuidade

- **Última reconciliação:** 2026-09-25
- **Implementation Plan vigente:** `docs/source-of-truth/canonical/06-IMPLEMENTATION-PLAN.md`
- **Estado:** Slice 01 **parcialmente concluído**; demais fatias não iniciadas
- **Dependência bloqueante:** o Slice 01 só encerra **depois** do Epic 0 / Fase 2 / item 1 — ver §3
- **Runtime atual do handoff:** Edge Function `identity-me` (transitória, será substituída por Route Handler)

---

## 1. Aviso de leitura — duas revogações sucessivas

Este arquivo acumulou evidência de três runtimes diferentes. A ordem real é:

```
NestJS no Render  →  Edge Function no Supabase  →  Route Handler em apps/web
  (Fase 1)              (ADR-016, atual)              (ADR-017, alvo)
  histórico             transitório                   vigente
```

- A topologia **Render/NestJS/BullMQ/Valkey** é histórica, revogada pelo ADR-016.
- A **Edge Function `identity-me`** é o runtime que está no ar hoje, mas **não é o destino**:
  o ADR-017 coloca a execução HTTP de negócio em Route Handlers dentro do `apps/web`, e o
  Epic 0 / Fase 2 / item 1 é exatamente essa migração.
- Evidência de Render e de Edge Function permanece registrada porque é prova real do que foi
  executado. Nenhuma das duas orienta implementação nova.

A versão anterior deste arquivo tratava a Edge Function como estado final. Isso está corrigido.

---

## 2. Escopo do Epic — conforme Implementation Plan v2.0

Epic 1 estabelece a fundação de tenancy e autorização exigida por todos os domínios posteriores.

**Superfícies:** `SCR-AUTH-001`, `005`, `006` · `SCR-ONB-001`, `002` · `SCR-SET-001` a `004`.

**Trabalho definido no plano:**

1. Autenticação por e-mail e senha via Supabase Auth.
2. Separar identidade externa (`UserAuthIdentity`) do `User` de negócio.
3. Workspace, Location, Membership e `UserLocation`.
4. **Sete papéis de sistema** com permissões e escopos: Owner, Admin, Salesperson, Supervisor, Crew, Accounting, Client.
5. Função única de autorização chamada pelos Application Services.
6. **RLS default-deny** em toda tabela de tenant.
7. Ciclo de convite com expiração e proteção contra replay.
8. Seleção e troca de Workspace, com invalidação de contexto.
9. Invariante de Primary Owner e transferência auditada.
10. Resolução de deep link que revalida autorização.
11. Eventos de auditoria para mudança privilegiada.
12. Onboarding com checklist persistente, **incluindo a etapa de imposto**.

### Mudanças de escopo trazidas pela base v2.0

| Item | Antes | Agora |
|---|---|---|
| Papéis | não enumerados | **sete**, nomeados no PRD v2.0 e no Domain Model v2.0 |
| Acesso do cliente | "portal-access separation" genérico | **magic link** por `PortalGrant` — ADR-022; pertence ao **Epic 10**, não ao Epic 1 |
| Onboarding | checklist genérico | inclui **etapa de imposto** — TaxTreatment e nexus |
| Identidade externa | mapping ad hoc do Slice 01 | entidade `UserAuthIdentity` do Domain Model v2.0 §A |

O acesso do Cliente saiu do Epic 1. A separação portal-access continua sendo obrigação de
modelagem aqui, mas a implementação do portal é Epic 10.

---

## 3. Dependência entre Slice 01 e o Epic 0

O Slice 01 tem exatamente uma obrigação em aberto: **provar uma reconciliação autenticada
bem-sucedida de ponta a ponta**. Essa prova estava pendente contra o Render, depois passou a
pender contra a Edge Function, e a Edge Function está para ser substituída.

O Epic 0 / Fase 2 / item 1 exige migrar `identity-me` para Route Handler *"preservando o
contrato do Slice 01, com paridade comprovada por teste"*. Essa paridade **é** a prova que falta.

**Decisão de sequenciamento registrada aqui:** não repetir a prova autenticada contra a Edge
Function. Executá-la uma única vez, contra o Route Handler, como critério de aceite do Epic 0 /
Fase 2 / item 1. O Slice 01 é encerrado por esse mesmo teste.

Isso evita gastar uma credencial controlada validando um runtime que será desligado no item 2.

---

## 4. Fatia aprovada — EPIC-01-SLICE-01

**Objetivo:** ponto de entrada real de autenticação e-mail/senha para `SCR-AUTH-001`, com
Supabase Auth e uma boundary server-side de reconciliação da identidade global `User`.

**Incluído:** somente e-mail/senha · validação de sessão server-side · identidade externa
separada da identidade de negócio · `SCR-AUTH-001` ligado ao contrato real, não a fixture ·
comportamento de erro aprovado e testes do contrato implementado.

**Explicitamente fora:** Google OAuth · recuperação de senha · trial/plano/billing · Workspace,
Location, Membership, Role, Permission e scopes · RLS de dados de tenant · onboarding, consent
e convites · portal access · configuração remota de Supabase/Auth e credenciais privilegiadas.

Google OAuth foi deferido pelo Product Owner em 2026-09-25 e não entra sem novo Task Packet.

---

## 5. Checklist de acompanhamento

**Legenda:** `[x]` concluído com evidência · `[-]` em andamento · `[ ]` não iniciado · `BLOCKED` depende de decisão ou autorização externa.

### Governança e planejamento

- [x] Confirmar o Epic 1 como próximo passo pelo Implementation Plan aprovado.
- [x] Cruzar as fontes oficiais aplicáveis e registrar a precedência documental.
- [x] Criar `EPIC-01-STATUS.md` e `EPIC-01-QA.md` sem declarar como aprovado teste não executado.
- [x] Definir `EPIC-01-SLICE-01` e registrar Google OAuth como adiado.
- [x] Aprovar o contrato de identidade: `User` interno separado, com mapeamento dedicado para a identidade externa do Supabase Auth.
- [x] Obter aprovação explícita do Task Packet antes de implementar.
- [ ] **Reconciliar o Slice 01 com a base documental v2.0** — o contrato de `User` precisa ser confrontado com `UserAuthIdentity` do Domain Model v2.0 §A antes de as fatias seguintes começarem.

### Slice 01 — autenticação e boundary de identidade server-side

- [x] Arquivar os wireframes do Product Owner em `docs/reference/wireframes/historical/2026-09-25/`, com manifesto e hashes. Referência histórica, não fonte de autoridade.
- [x] Confirmar no código os pontos de integração Web/API/DB autorizados pelo Task Packet.
- [x] Resolver a estratégia UUIDv7: geração na aplicação por dependência revisada, sem extensão nem alteração remota no PostgreSQL.
- [x] Preparar runtime local isolado: Node 24.21.0 + pnpm 12.6.0, dependências com lockfile congelado.
- [x] Definir o lifecycle e a representação persistida de `User`, aprovados em 2026-09-25.
- [x] Criar e aplicar a migration de identidade autorizada: `users` e `user_supabase_identities`, PKs, FK restritiva, check de status e RLS default-deny. Validação remota confirmou as duas tabelas, RLS ativo e zero policies.
- [x] Implementar `SCR-AUTH-001` a partir do wireframe low-fi: e-mail, senha, submit, loading, erro genérico e estado de configuração indisponível.
- [x] Criar boundary autenticada: token ausente ou inválido é rejeitado antes da reconciliação; token verificado entrega somente sujeito e e-mail ao use case.
- [x] Implementar repositório transacional para `subject → User`, com conflito de concorrência tratado pela chave única do mapping.
- [x] Definir e implementar o contrato de transporte de `GET /identity/me`: somente Bearer token, verificação server-side, retorno mínimo do `User` interno, sem Workspace/RBAC.
- [x] Criar e executar os testes unitários possíveis do Slice 01 — 12/12 PASS. Ver §8.
- [x] Executar QA de navegador do estado seguro sem configuração — ver §10.
- [x] Publicar o Web SaaS no Vercel Production após gates locais.
- [-] **Migrar o handoff para o runtime vigente.** Implementado em Edge Function `identity-me` v1 ACTIVE. Destino final é Route Handler — Epic 0 / Fase 2 / item 1.
- [ ] **BLOCKED** — Reconciliação autenticada bem-sucedida comprovada de ponta a ponta. Ver §3 e §13.

### Obrigações restantes do Epic 1

Ordem das próximas fatias definida somente após cada Task Packet aprovado.

- [ ] Métodos de autenticação restantes, cada um com sua fatia e autorização.
- [ ] Contratos de Workspace, Membership, Location e `UserLocation`.
- [ ] **Sete papéis de sistema** com permissions e scopes granulares.
- [ ] Função única de autorização chamada pelos Application Services.
- [ ] Ciclo de vida de Invite com expiração e proteção contra replay.
- [ ] Seleção e troca segura de múltiplos Workspaces, com invalidação de contexto.
- [ ] RLS default-deny em toda tabela de tenant.
- [ ] Invariante de Primary Owner e transferência auditada.
- [ ] Resolução segura de deep links que revalida autorização.
- [ ] Eventos de auditoria para alterações privilegiadas.
- [ ] Onboarding com checklist persistente, incluindo a **etapa de imposto**.
- [ ] Todos os testes negativos obrigatórios do Epic — ver §6.
- [ ] Gate de saída: testes cross-tenant e de permissão negativa aprovados antes de qualquer mutação tenant-owned.

### Ações não autorizadas neste momento

- [x] Migration remota de identidade — autorizada e executada uma única vez em 2026-09-25, com RLS default-deny e validação posterior.
- [x] Publicação em GitHub `main` e Vercel Production — autorizada explicitamente em 2026-09-25.
- [ ] **Não executar sem nova decisão:** criação ou alteração de conta Auth controlada, e qualquer mudança privilegiada fora do contrato aprovado.

---

## 6. Testes obrigatórios do Epic

Rastreados para as fatias posteriores. O Slice 01 cobre apenas os testes de autenticação e
identidade do seu escopo.

Não autenticado · autenticado sem Membership · um Workspace · vários Workspaces · Membership
suspensa · **tentativa cross-workspace por ID direto** · violação de escopo de Location ·
tentativa de auto-elevação · convite expirado e reusado · invariante de Primary Owner ·
permissão alterada durante sessão ativa.

---

## 7. Decisões de identidade registradas

**Mapeamento de identidade.** `packages/db/src/schema.ts` não continha tabela física de domínio
e a fundação não tinha adapter de Supabase Auth. O Domain Model especifica um `User` de negócio
global; o TRD exige que relações de negócio usem o `user.id` interno, nunca o ID do provedor.

Aprovado em 2026-09-25: o Slice 01 introduz um mapeamento dedicado de identidade externa, de
posse do domínio de identidade. O `User` interno permanece distinto do UUID do Supabase Auth.
A migration correspondente foi inicialmente local/Git; a execução remota foi autorizada depois,
uma única vez, após revisão. Criou somente `users` e `user_supabase_identities`, habilitou RLS
em ambas, não criou policy e não alterou registro existente.

**Pendência de reconciliação:** o Domain Model v2.0 §A nomeia essa entidade `UserAuthIdentity`.
A tabela criada chama-se `user_supabase_identities`. A diferença precisa ser resolvida — por
renomeação ou por registro explícito do nome físico — antes das fatias de Workspace/RBAC.

**UUIDv7 — resolvido.** O PostgreSQL 17.6 do projeto não oferece `uuidv7()` nativo (PG 18
oferece). O Task Packet bloqueou em vez de cair silenciosamente em UUIDv4. Resolvido em
2026-09-25: dependência de aplicação revisada, sem extensão e sem mudança remota.

**Runtime — resolvido.** A fundação fixa Node `>=24.21.0 <25` e pnpm `12.6.0`; o wrapper de
sistema falhava antes de executar. Resolvido com runtime local isolado Node 24.21.0 e Corepack
pnpm 12.6.0, restaurando dependências com `--frozen-lockfile`. Não alterou Supabase, Vercel,
remotes nem configuração de runtime do repositório.

**Schema — resolvido.** `User` tem `id` e `email` obrigatórios, `name` e `photo` opcionais, e
`status` global restrito a `active` e `suspended`, com `active` como estado inicial. A identidade
do provedor permanece apenas no mapping dedicado.

---

## 8. Evidência — testes e gates locais

**Testes unitários do Slice 01: 12/12 PASS** — token negativo, identidade verificada, criação,
repetição, concorrência, campos não confiáveis ignorados, token vazio, parsing do Bearer e
respostas HTTP 401/503/200.

**Gate local final da época:**

| Gate | Resultado |
|---|---|
| Structure | PASS — **12 workspaces** brand-neutral |
| Secrets baseline | PASS — nenhum secret reportado |
| Lint | PASS com warnings; o warning em código novo foi corrigido, os demais pertencem ao acervo imutável de wireframes |
| Tests | PASS — 12 da API, 3 de config, 1 de observability |
| Typecheck | PASS — 12 workspaces |
| Build | PASS — 12 workspaces; Next.js gerou `/login` |
| Git review | diff sem whitespace errors; sem force push, sem merge de PR |

> **Contagem desatualizada:** a evidência acima registra **12 workspaces**, correto na data. Com
> a remoção de `apps/api` e `apps/worker` pelo ADR-016, o repositório tem **10**. Qualquer
> reexecução deve reportar 10 até o Epic 0 / Fase 2 alterar a lista de novo.

---

## 9. Evidência — migration remota

- **Alvo:** projeto Supabase `obpncbnzwrocvgngtodg`, branch main/Production.
- **Aplicada:** 2026-09-25 pelo SQL editor, após autorização explícita do Product Owner.
- **Objetos criados:** `public.users`, `public.user_supabase_identities`.
- **Integridade:** `users_pkey`, `users_status_check`, `user_supabase_identities_subject_pk` e `user_supabase_identities_user_id_users_id_fk` presentes.
- **RLS:** `true` nas duas tabelas; contagem de policies públicas `0` em ambas.
- **Correção registrada:** o `CHECK` gerado inicialmente qualificava `users.status` de forma incorreta; o PostgreSQL rejeitou e nenhuma tabela foi criada. Schema e migration local foram corrigidos para `CHECK ("status" IN (...))` e a execução final rodou em uma transação atômica.

---

## 10. Evidência — QA de navegador, estado seguro sem configuração

- **URL:** `http://localhost:3000/login`
- **Viewports:** 320×640, 375×812, 768×900, 1024×900, 1440×1000
- **Observado:** `SCR-AUTH-001` com labels e campos de e-mail e senha, feedback explicativo de configuração indisponível e botão desabilitado, em todos os viewports, sem overflow horizontal.
- **Console:** zero warnings e errors.
- **Não provado:** autenticação bem-sucedida, comportamento de resposta e redirect autenticado.

---

## 11. Evidência — publicação em Production

- **GitHub:** `main` avançada por fast-forward, sem force push. Contrato de transporte de identidade em `1e1cf9c`.
- **Projeto Vercel:** `wyllams-projects/saas`, root `apps/web`, Node.js 24.x.
- **Ambiente:** somente `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` em Production e Preview. Nenhum secret ou service key.
- **Deployment:** `https://saas-pi-one-31.vercel.app`, Ready.
- **QA ao vivo:** `/login` renderizou inputs configurados e submit habilitado. Uma conta controlada inexistente retornou a mensagem genérica aprovada. Sem warnings ou errors no console.
- **QA responsivo:** sem overflow horizontal nos cinco viewports.

---

## 12. Evidência histórica — runtimes revogados

### 12.1 Render / NestJS — revogado pelo ADR-016

- **Serviço:** `saas-api`, Render Virginia, plano Free. Instâncias Free hibernam por inatividade.
- **Origem:** `Wyllams/SaaS` em `main`, commit `a8ac097`; Node 24.21.0; `APP_ENV=production`; nenhum secret inserido.
- **Deploy:** `dep-darek8gjo6nc73flk0eg`, `Deploy succeeded | Live`.
- **Checks externos:** `GET /health` 200 `{"status":"ok","service":"api"}` · `GET /ready` 503 com `database: missing` e `queue: missing` · `GET /identity/me` sem Bearer 401 `UNAUTHENTICATED`. Não houve token, banco, secret nem reconciliação positiva.
- **Handoff autenticado:** `SCR-AUTH-001` passou a entregar o access token por `Authorization: Bearer`; Render recebeu `WEB_ORIGIN` com a origem exata, sem wildcard e sem cookies credenciados; deploy `4f912b1` ficou Live; preflight retornou `204` com `Access-Control-Allow-Origin` exato, `Allow-Headers: authorization` e `Allow-Methods: GET`.

Nada disso é runtime atual.

### 12.2 Edge Function Supabase — transitória

- Edge Function `identity-me` versão 1: **ACTIVE** no projeto `obpncbnzwrocvgngtodg`.
- `pgmq`, `pg_cron` e `pg_net` habilitados.
- Web atualizado para invocar `identity-me` pelo cliente Supabase; `NEXT_PUBLIC_API_BASE_URL` removida.
- `apps/api` e `apps/worker` removidos como unidades de runtime/workspace.
- ADR-016 é a autoridade de backend; **ADR-017 move a execução HTTP de negócio para Route Handlers**, e é por isso que este runtime é transitório.

---

## 13. Blockers

`BLOCKED — SUCCESSFUL AUTHENTICATION EVIDENCE REQUIRED`

1. **Decisão/ação faltante:** uma reconciliação autenticada bem-sucedida, comprovada por inspeção de request, log e mapeamento persistido.
2. **Documentos consultados:** `EPIC-01-SLICE-01-TASK-PACKET.md`, `06-IMPLEMENTATION-PLAN.md` Epic 0 item 1 e Epic 1, ADR-016, ADR-017.
3. **Situação em 2026-09-26:** o Route Handler que serve o contrato foi implementado no `EPIC-00-SLICE-01`, com 14 testes cobrindo as sete linhas do contrato. **Falta uma ação de ambiente:** provisionar `SUPABASE_DB_URL` no projeto Vercel. Sem ela a rota devolve o `503` de serviço não configurado, que é o comportamento correto do contrato, mas impede a prova. Depois disso a prova depende de o Product Owner submeter uma única vez as credenciais controladas na Web publicada. O Codex não recebe, exibe, registra nem solicita a senha.
4. **Sequenciamento:** conforme §3, essa prova deve ser executada **contra o Route Handler**, como critério de aceite do Epic 0 / Fase 2 / item 1 — não contra a Edge Function, que será desativada no item 2.
5. **Bloqueia:** encerramento do Slice 01 e, por consequência, o início das fatias de Workspace/Membership/RBAC.

---

## 14. Boundaries e decisões em vigor

- Supabase Auth é o provedor de autenticação aprovado para a V1.
- A tela de login está em `/login`; o cliente de navegador usa somente a boundary de publishable key, e o verificador server-side usa variáveis server-only mais `auth.getUser(token)`.
- Wireframes históricos são pesquisáveis em `docs/reference/wireframes/`, mas precisam ser reconciliados com as decisões atuais e com o Task Packet antes de qualquer implementação visual.
- Workspace é a fronteira de tenant.
- **Autenticação não é autorização:** as fatias seguintes precisam impor Membership, Permission e escopo de Location nas boundaries de backend e banco.
- Visibilidade de UI e deep link nunca concedem autorização.
- Nenhum trabalho de Stripe, QuickBooks, Resend, SMS/Twilio, billing de provedor ou domínio de negócio pertence ao Epic 1.
- O acesso do Cliente por magic link (`PortalGrant`, ADR-022) pertence ao **Epic 10**.

---

## 15. Documentação consultada

`docs/source-of-truth/README.md` · `CURRENT-DECISIONS.md` · `canonical/01-PRD.md` ·
`02-TRD-OFICIAL.md` · `03-APP-FLOW-OFICIAL.md` · `04-UI-UX-DESIGN.md` ·
`05-BACKEND-SCHEMA-DOMAIN-MODEL.md` · `06-IMPLEMENTATION-PLAN.md` ·
`docs/architecture/TECHNICAL-ARCHITECTURE.md` · `docs/adr/README.md` e ADRs aplicáveis ·
`docs/implementation/CHATGPT-CODEX-OPERATING-MODEL.md` · `CODEX-TASK-TEMPLATE.md` ·
`EPIC-00-STATUS.md`

---

## 16. Próximo passo exato

O Epic 1 **não avança** antes do Epic 0 / Fase 2. A ordem é:

1. Task Packet do Epic 0 / Fase 2 / item 1 — Route Handler com paridade testada.
2. A prova autenticada do Slice 01 é o critério de aceite desse item (§3).
3. Item 2 do Epic 0 — desativar a Edge Function e atualizar os dois verificadores de CI.
4. Só então emitir o Task Packet da fatia de Workspace/Membership/Location, já reconciliada com
   `UserAuthIdentity` do Domain Model v2.0 (§7).
