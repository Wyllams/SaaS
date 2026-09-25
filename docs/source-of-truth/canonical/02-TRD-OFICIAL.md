**CrewCommand**

**TECHNICAL REQUIREMENTS DOCUMENT**

**TRD Oficial — v1.0**

Arquitetura técnica consolidada a partir do PRD, App Flow, Backend Domain Model e UI/UX Design Document aprovados.

| **Status**            | Aprovado                                            |
|-----------------------|-----------------------------------------------------|
| **Mercado inicial**   | Estados Unidos                                      |
| **Arquitetura**       | Modular Monolith + Event-driven internamente        |
| **Infraestrutura V1** | Vercel + Render + Supabase + Render Key Value + EAS |

# 1. Controle do Documento

| **Campo**             | **Definição**                                                       |
|-----------------------|---------------------------------------------------------------------|
| Documento             | Technical Requirements Document (TRD)                               |
| Versão                | 1.0                                                                 |
| Status                | Aprovado para orientar implementação                                |
| Idioma do documento   | PT-BR; nomes técnicos e código em inglês                            |
| Mercado da V1         | Estados Unidos                                                      |
| Documentos de entrada | PRD, App Flow Oficial, Backend Domain Model e UI/UX Design Document |
| Próximo documento     | Implementation Plan                                                 |

# 2. Objetivo e Escopo Técnico

Este TRD define como o CrewCommand será construído e operado tecnicamente. Ele consolida as decisões de arquitetura, stack, autenticação, multi-tenancy, persistência, APIs, filas, realtime, integrações, mobile, segurança, observabilidade, testes, CI/CD, infraestrutura, escalabilidade e operação da V1.

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><strong>Princípio central<br />
</strong>CrewCommand começa com uma arquitetura simples de operar, modular e escalável, evitando complexidade distribuída prematura, mas mantendo limites claros para evolução futura.</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

## 2.1 Fora do escopo deste TRD

- Definição comercial de preços e limites exatos dos planos.

- Design visual detalhado das telas, já definido no UI/UX Design Document.

- Ordem de implementação por sprint/épico, que será definida no Implementation Plan.

- SLA contratual Enterprise; o TRD define apenas SLOs técnicos iniciais.

- Certificações formais como SOC 2 ou PCI; a arquitetura será preparada para requisitos compatíveis, sem declarar certificação antes de auditoria formal.

# 3. Stack Técnica Aprovada

| **Camada**          | **Tecnologia / Provider**                  | **Decisão**                                |
|---------------------|--------------------------------------------|--------------------------------------------|
| Linguagem           | TypeScript                                 | Principal no Web, API, Workers e Mobile    |
| Web/PWA/Portal      | Next.js + React + App Router               | Vercel                                     |
| API                 | NestJS + FastifyAdapter                    | Modular Monolith                           |
| Mobile              | React Native + Expo + Expo Router          | iOS e Android nativos via EAS              |
| Banco               | PostgreSQL                                 | Fonte de verdade transacional              |
| BaaS                | Supabase                                   | PostgreSQL, Auth, Storage e Realtime       |
| Filas               | BullMQ                                     | Workers assíncronos                        |
| Queue/Cache         | Render Key Value (Valkey/Redis-compatible) | Persistência para filas; cache seletivo    |
| API/Workers Hosting | Render                                     | Containers separados                       |
| Web Hosting         | Vercel                                     | Web/PWA/Portal                             |
| Mobile CI/CD        | EAS                                        | Build, Update, Submit                      |
| CI principal        | GitHub Actions                             | Monorepo                                   |
| Logs                | Pino/Fastify                               | JSON estruturado                           |
| Tracing/Metrics     | OpenTelemetry                              | Backend vendor-neutral                     |
| Error Monitoring    | Sentry                                     | Web/API/Workers/Mobile                     |
| Unit/Integration    | Vitest                                     | Coverage V8                                |
| E2E Web             | Playwright                                 | Fluxos críticos                            |
| E2E Mobile          | Maestro                                    | Builds reais de staging/preview            |
| Performance         | k6                                         | API/load tests                             |
| SMS                 | Twilio Programmable Messaging              | Bidirecional + A2P 10DLC                   |
| E-mail              | Resend                                     | Envio, inbound e webhooks                  |
| Payments            | Stripe Connect                             | Card + ACH; PayPal como provider adicional |
| Accounting          | QuickBooks Online                          | OAuth 2.0                                  |

## 3.1 Decisões intencionalmente pendentes

| **Item**                        | **Estado**         | **Critério de fechamento**                                                                                      |
|---------------------------------|--------------------|-----------------------------------------------------------------------------------------------------------------|
| ORM / typed query layer         | PoC obrigatório    | Comparar transactions, RLS, migrations, JSONB, FTS, pg_trgm, raw SQL e typing; não distorcer o schema pelo ORM. |
| Styling Web                     | PoC obrigatório    | Validar Design System com abordagem token-based; opções como Tailwind/CSS Modules permanecem abertas.           |
| Monorepo task runner            | Direção: Turborepo | Validar no bootstrap do repositório.                                                                            |
| Node.js                         | Usar LTS ativa     | Fixar a versão no início real do desenvolvimento e versioná-la no projeto.                                      |
| Supabase pooling mode           | PoC                | Escolher direct/session/transaction conforme driver e ORM selecionados.                                         |
| Tamanhos de instâncias / planos | Capacity planning  | Definir com Alpha/Beta e métricas reais.                                                                        |

# 4. Arquitetura de Alto Nível

A V1 utiliza um Modular Monolith para regras de negócio, com efeitos externos e workloads pesados desacoplados por eventos, Outbox, BullMQ e Workers. Web, API e Workers são implantados separadamente. PostgreSQL permanece a fonte de verdade.

<img src="media/image1.png" style="width:6.8in;height:3.60235in" />

A camada Web não é a autoridade das regras críticas. Web e Mobile consomem a API compartilhada; o backend valida autorização, transições, cálculos financeiros, capacidade de Crew e invariantes de negócio.

## 4.1 Princípios arquiteturais

- Modular Monolith na V1; sem microservices prematuros.

- Sem Kubernetes na V1.

- Managed services first.

- API e Workers independentes.

- Backend como fonte de verdade das regras críticas.

- PostgreSQL como fonte de verdade dos dados transacionais.

- REST como API principal; OpenAPI como contrato/documentação.

- Event-driven internamente para automações, integrações, notificações e realtime.

- Idempotência obrigatória em operações críticas e efeitos externos.

- Realtime melhora UX, mas nunca substitui persistência.

# 5. Monorepo e Organização do Código

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><strong>Estrutura aprovada<br />
</strong>Monorepo com pnpm workspaces. Turborepo é a direção inicial para task orchestration/cache, sujeito a PoC no bootstrap.</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

Estrutura conceitual:

> crewcommand/  
> apps/  
> web/  
> mobile/  
> api/  
> worker/  
> packages/  
> api-client/  
> design-tokens/  
> ui-web/  
> domain-types/  
> validation/  
> config/

## 5.1 Backend por domínios

| **Módulo**       | **Responsabilidades principais**                                                 |
|------------------|----------------------------------------------------------------------------------|
| identity         | Users, WorkspaceMemberships, roles, permissions, scopes, portal access.          |
| crm              | Customers, contacts, properties, tags e custom fields relacionados.              |
| sales            | Leads/opportunities, pipelines, estimates, versions, appointments e follow-ups.  |
| jobs             | Jobs, services, milestones, progress e change orders.                            |
| scheduling       | Schedule entries, recurrence, crew assignment, conflicts, capacity e Stair-Step. |
| field-operations | Daily Logs, checklists, field issues, material requests e field actions.         |
| financial        | Invoices, payments, AR, financing, commissions e purchases.                      |
| communications   | Inbox, e-mail, SMS, chat, templates e consent.                                   |
| tasks            | Tasks, subtasks, recurrence e watchers.                                          |
| automations      | Definitions, triggers, conditions, actions e execution history.                  |
| integrations     | Provider adapters, OAuth connections, mappings e synchronization.                |
| audit            | Audit Log, Activity projection e security events.                                |

# 6. Autenticação, Workspaces e Autorização

Supabase Auth será o provider de autenticação da V1. CrewCommand continua proprietário do modelo de Workspace, Membership, Locations, Roles, Permissions e scopes.

<img src="media/image2.png" style="width:6.5in;height:2.6868in" />

## 6.1 Identidade

- Métodos V1: Email + Password e Continue with Google.

- E-mail verificado antes da ativação plena do cadastro por senha.

- Senhas não são persistidas em tabelas CrewCommand.

- User é identidade global; o mesmo User pode participar de múltiplos Workspaces.

- Relações de negócio usam user.id interno, não IDs diretos do auth provider.

- MFA não faz parte da V1, porém ações críticas podem exigir reauthentication.

## 6.2 Multi-workspace / tenancy

- Workspace é o tenant principal.

- Shared Database + Shared Schema.

- Entidades tenant-owned carregam workspace_id.

- Todo request de negócio valida WorkspaceMembership no backend.

- Troca de Workspace invalida contexto/cache e recarrega permissões/Locations.

- Uma empresa possui um Primary Owner único; transferência exige confirmação forte, reauthentication e Audit Log.

## 6.3 Roles, Permissions e scopes

Roles são conjuntos de permissions; o backend verifica permissions e scopes, não nomes de Role hard-coded.

| **Conceito** | **Exemplo**                                            |
|--------------|--------------------------------------------------------|
| Permission   | crm.clients.view, jobs.edit, financial.payments.record |
| Scope        | own, assigned, location, workspace                     |
| Salesperson  | clients:view com scope assigned                        |
| Owner        | clients:view com scope workspace                       |
| Field Worker | Jobs/Services atribuídos ao usuário/Crew               |

## 6.4 Client Portal

- Client Portal Access é separado de WorkspaceMembership.

- Portal não utiliza Roles internos.

- Acesso é derivado do client contact, properties relacionadas, Customer Visible e portal settings.

- Uma pessoa pode ser employee de um Workspace e cliente de outro usando a mesma identidade global.

# 7. Banco de Dados e Data Architecture

PostgreSQL é o banco transacional principal. A arquitetura é PostgreSQL-first; ORM/query layer será escolhido por PoC e SQL nativo continuará permitido quando recursos do PostgreSQL exigirem.

## 7.1 Convenções e integridade

- snake_case no banco; camelCase no TypeScript.

- Nomes técnicos em inglês.

- UUIDv7 como direção para IDs internos; geração na aplicação se o provider não oferecer suporte nativo.

- IDs amigáveis por Workspace: JOB-1054, EST-1048 etc.

- Foreign Keys reais nas relações principais.

- timestamptz para instantes; date para datas civis.

- Soft delete apenas onde fizer sentido.

- Versioned migrations em Git; nenhuma alteração manual de schema em Production como prática normal.

## 7.2 Dinheiro e precisão

- Nunca usar floating point comum para dinheiro.

- Preferir integer minor units quando a moeda permitir; numeric/decimal quando a precisão exigir.

- Currency code presente ou inequivocamente inferível nos registros financeiros.

- Percentuais usam decimal controlado/basis points conforme o caso.

## 7.3 JSONB, Custom Fields, Tags e Pipelines

- JSONB apenas para dados naturalmente flexíveis; não substituir modelagem relacional principal.

- Custom Fields: definitions + values tipados; nenhuma coluna física nova por campo criado pelo cliente.

- Tags são entidades + assignments, permitindo rename/archive/filter/automation.

- Sales e Job Pipeline usam pipelines + pipeline_stages configuráveis; estados técnicos invariáveis podem usar enums controlados.

## 7.4 Snapshots e versionamento

- Estimate aprovado preserva snapshot imutável da versão aceita.

- Change Order aprovado/assinado preserva snapshot equivalente.

- Invoice sincronizado preserva snapshot/metadados relevantes.

- Alterações posteriores do Customer/Property não mudam retroativamente documentos assinados.

- estimate_versions mantém histórico; a versão aprovada é imutável.

# 8. Storage, Search, Audit e Arquivos

## 8.1 Object Storage

- Supabase Storage é a primeira opção da V1, atrás de uma abstração FileService.

- Fotos, documentos, receipts e áudio de chat vivem em Object Storage, não no PostgreSQL.

- Banco guarda metadata: storage key, owner, workspace, category, visibility, checksum, size e MIME.

- Arquivos privados usam signed URLs temporárias; signed URL nunca é persistida como URL permanente.

- Imagens podem ter original, optimized e thumbnail; documentos oficiais preservam original imutável.

- Upload valida tipo/tamanho e pode passar por malware scanning.

## 8.2 Busca

- Global Search V1 dentro do PostgreSQL.

- B-tree + Full-Text Search + pg_trgm + normalização adequada.

- Search sempre workspace-scoped e também permission/location-scoped quando aplicável.

- Entidades iniciais: Customer/Contact, Property, Job, Estimate e Invoice.

- Sem OCR/full-text de PDFs na V1.

- Telefones e e-mails terão campos/representações normalizadas para busca.

## 8.3 Audit Log vs Activity

Activity Feed é amigável ao usuário; Audit Log é o registro técnico/administrativo estruturado e append-only para a aplicação normal.

| **Audit Log mínimo**     | **Descrição**                        |
|--------------------------|--------------------------------------|
| actor_id                 | Usuário/agente responsável           |
| workspace_id             | Tenant                               |
| action                   | Ação estruturada                     |
| entity_type / entity_id  | Registro afetado                     |
| before_json / after_json | Com redaction de dados confidenciais |
| occurred_at              | Timestamp                            |
| request_id / source      | Correlação e origem                  |

# 9. API, Transactions e Domain Events

## 9.1 API REST

- REST é a API principal; GraphQL não faz parte da V1.

- Endpoints de domínio explícitos para transições relevantes: POST /estimates/:id/approve, POST /services/:id/complete etc.

- Schemas de request/response explícitos e OpenAPI.

- Erros padronizados: code, message, details e request_id.

- Códigos estáveis: SCHEDULE_CONFLICT, PLAN_LIMIT_REACHED, INSUFFICIENT_PERMISSION etc.

- Paginação backend; cursor quando beneficia consistência/performance, offset quando contagem de páginas for relevante.

- Filtros/ordenação com whitelist; nunca interpolar campos SQL arbitrários vindos do cliente.

- Bulk operations com use cases/endpoints próprios; grandes volumes vão para Background Job.

## 9.2 Application Services e transações

- Controllers finos; regras vivem em Application Services / Use Cases.

- Use Cases podem ser reutilizados por REST, Automation Engine, Workers, MCP e Public API quando apropriado.

- Operações atômicas usam transactions PostgreSQL.

- Não manter transação aberta aguardando API externa lenta.

- Efeitos externos não essenciais à transação são assíncronos.

## 9.3 Transactional Outbox e Event Flow

<img src="media/image3.png" style="width:6.7in;height:0.49102in" />

- Business data e evento Outbox são gravados na mesma transaction.

- Outbox processor publica/enfileira posteriormente.

- Eventos internos são versionados e carregam event_id, workspace_id, entity_id, actor, occurred_at e correlation_id.

- Um evento pode ter múltiplos consumidores; falha em notificação não reverte uma aprovação já persistida.

- Consumidores possuem retry e idempotência próprios.

# 10. Filas, Workers, Realtime e Automation Engine

## 10.1 BullMQ + Valkey

- BullMQ + Render Key Value (Valkey/Redis-compatible) é a infraestrutura inicial de filas.

- Redis/Valkey não é banco de negócio.

- apps/worker executa consumidores separadamente da API.

- Filas lógicas: notifications, integrations, automation, media, documents, webhooks, reports, maintenance.

- Retries com backoff; sem retry infinito.

- Jobs falhos permanecem inspecionáveis e aparecem na observabilidade.

- Workers devem ser idempotentes.

## 10.2 Realtime

- Supabase Realtime Broadcast para casos relevantes.

- Não habilitar Postgres Changes indiscriminadamente.

- Casos iniciais: chat, notifications, approvals, Job/Service updates relevantes e integration status.

- Channels privados e tenant-scoped.

- Presence apenas para estados efêmeros de baixa frequência; não para tracking de funcionário.

## 10.3 Automation Engine

- Modelo declarativo WHEN → IF → THEN.

- Definitions persistidas no PostgreSQL; nenhum JavaScript arbitrário escrito por clientes.

- Triggers alimentados por Domain Events e triggers temporais.

- Conditions suportam AND/OR.

- Actions iniciais: Send Email/SMS, Create Task, Change Status, Assign User, Add Tag, Send Notification.

- Ações financeiras sensíveis não serão expostas genericamente sem regras específicas.

- Execution history registra input, actions, status, timestamps e errors.

- Loop prevention por correlation chain + limite de profundidade.

- Temporal não faz parte da V1; permanece opção futura para workflows duráveis complexos.

# 11. Integrações Externas

Integrações seguem adapters e uma Integration Layer; módulos de negócio não acoplam diretamente a SDKs de providers.

## 11.1 QuickBooks Online

- Primeira integração contábil: QuickBooks Online, via OAuth 2.0.

- CrewCommand é fonte operacional; QBO é fonte contábil para objetos sincronizados.

- Invoice nasce por ação manual no CrewCommand; envio ao QBO ocorre após review.

- Mappings explícitos entre internal_id e external_id; evitar matching perigoso apenas por nome.

- Sincronização inicial: Customers necessários, Invoices, Payments relacionados e Items/Services necessários.

- Webhooks funcionam como sinal de mudança; Worker reconsulta API quando necessário.

- Reconciliation periódico para reduzir risco de estado perdido.

- Conflitos não sobrescrevem silenciosamente dados operacionais internos.

## 11.2 Stripe Connect / Payments

- Stripe Connect como provider principal; onboarding hosted/embedded.

- Connected Accounts por Workspace; possibilidade futura por Location.

- Card + ACH inicialmente via Stripe.

- CrewCommand não armazena PAN/CVC ou dados bancários completos.

- Confirmação de pagamento depende de provider state/webhook, não apenas do browser.

- Webhook signature obrigatória e eventos idempotentes pelo provider Event ID.

- Pagamentos manuais Cash/Check aparecem no mesmo domínio financeiro, diferenciados por origem.

- Sem application fee na V1 até definir modelo comercial; arquitetura deve permitir evolução.

## 11.3 PayPal, Twilio e Resend

| **Provider** | **Uso**                   | **Regras-chave**                                                                                                       |
|--------------|---------------------------|------------------------------------------------------------------------------------------------------------------------|
| PayPal       | PaymentProvider adicional | REST/OAuth; webhooks verificados; opção só aparece se habilitada.                                                      |
| Twilio       | SMS/MMS bidirecional      | Messaging Services; A2P 10DLC nos EUA; opt-out obrigatório; signature validation; usage metering por Workspace.        |
| Resend       | E-mail outbound/inbound   | EmailProvider abstraction; inbound webhook; attachments passam por FileService; domínios próprios só após verificação. |

## 11.4 Webhooks próprios, Public API e MCP

- Public API versionada em /api/v1, com API credentials por Workspace e scopes.

- Webhooks próprios com URL, eventos, secret, status, HMAC signature, retries, logs e manual retry.

- Consumidores recebem Event ID único e devem tratar idempotência.

- MCP será Remote MCP Server em TypeScript usando a linha estável do SDK no início real da implementação.

- MCP não acessa banco diretamente; usa Application Services, authorization engine e Audit Log.

- Tools são capacidades de negócio (search_customers, get_job, create_task, reschedule_service), nunca SQL genérico.

# 12. Web, PWA e Mobile

## 12.1 Web / Next.js

- Next.js App Router para Web, PWA, Client Portal e rotas de autenticação.

- Server Components onde agregam valor; Client Components em módulos altamente interativos.

- TanStack Query para server state, mutations, invalidation e optimistic updates seguros.

- api-client compartilhado para auth, workspace context, errors e request IDs.

- Design System em packages/ui-web; design-tokens compartilhados.

- PWA instalável, sem prometer Offline Mode completo na V1.

## 12.2 React Native / Expo

- React Native + Expo + Expo Router.

- Usar a versão estável suportada no início real do desenvolvimento; nunca iniciar Production em beta sem justificativa.

- New Architecture obrigatória nas versões modernas; dependências verificadas com Expo Doctor.

- Universal Links / Android App Links por HTTPS; custom scheme como fallback.

- SecureStore para tokens sensíveis; não usar AsyncStorage puro para credenciais.

- TanStack Query também no mobile; cache não equivale a Offline Mode.

- Uploads de foto com compressão no device + validação server-side.

- Expo Push Service inicialmente, atrás de PushNotificationProvider.

- EAS Build, Submit e Update com profiles development/preview/production e staging antes de produção.

# 13. Segurança e Privacidade

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><strong>Baseline<br />
</strong>OWASP ASVS 5.0 é o baseline técnico de segurança. Segurança faz parte do Definition of Done e usa least privilege + default deny.</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

## 13.1 Controles principais

- HTTPS/TLS para tráfego externo; encryption at rest nos providers.

- Secret Manager/Environment Secret Store; nenhum secret Production em Git ou bundle Web/Mobile.

- Validação server-side de todos os payloads externos.

- SQL parametrizado, sanitização quando houver HTML rico, redirect whitelist, headers/CSP adequados.

- File validation por MIME/content + tamanho + bloqueio de tipos perigosos; scanning quando apropriado.

- Isolamento multi-tenant é propriedade crítica; Search, Reports, exports, Realtime e Workers também aplicam scope.

- Logs redacted: sem passwords, CVC, PAN, refresh tokens ou API secrets.

- Stripe-hosted/embedded components para reduzir escopo PCI; nenhuma declaração de compliance formal sem auditoria.

- Arquitetura SOC 2-ready: access control, logging, change management, backups, incident response e vendor register.

## 13.2 Backups e Disaster Recovery

| **Objetivo**   | **Decisão**                                                                                   |
|----------------|-----------------------------------------------------------------------------------------------|
| Backups        | Estratégia documentada + provider backups + cópia/export off-provider dos dados críticos.     |
| PITR           | Habilitar quando estágio comercial justificar; recomendado para Production madura.            |
| Restore drills | Obrigatórios periodicamente em ambiente isolado.                                              |
| RPO alvo       | ≤ 15 minutos para banco crítico em Production madura.                                         |
| RTO alvo       | ≤ 4 horas para incidente grave de banco/aplicação.                                            |
| Runbook        | Database/storage loss, provider outage, bad deploy, credential compromise, destructive event. |

# 14. Observabilidade e Performance

## 14.1 Stack

| **Área**   | **Tecnologia / regra**                                                           |
|------------|----------------------------------------------------------------------------------|
| Logs       | Pino JSON em Production; pino-pretty no Development.                             |
| Tracing    | OpenTelemetry em HTTP, Postgres, Redis, queues, workers e external HTTP.         |
| Metrics    | OpenTelemetry: request/error/latency, DB, queue, worker, provider, webhook.      |
| Errors     | Sentry para Next.js, NestJS, Workers e Expo/React Native.                        |
| Correlação | request_id/correlation_id atravessando API → Outbox → Queue → Worker → Provider. |

## 14.2 Targets iniciais

| **Métrica**             | **Target / princípio**                                                       |
|-------------------------|------------------------------------------------------------------------------|
| API simples             | p95 ≤ 500 ms, excluindo operações externas longas.                           |
| Web público/Portal      | Core Web Vitals como referência: LCP ≤ 2.5s, INP ≤ 200ms, CLS ≤ 0.1 (p75).   |
| Queue wait comum        | p95 \< 30s em condições normais.                                             |
| Availability SLO pós-GA | 99.9% mensal para serviços sob nosso controle.                               |
| 5xx                     | \<1% global como direção inicial; substancialmente menor em fluxos críticos. |

# 15. Estratégia de Testes e Quality Gates

| **Camada**         | **Ferramenta / foco**                                                                      |
|--------------------|--------------------------------------------------------------------------------------------|
| Unit / Integration | Vitest; rules, calculations, permissions, status transitions, Stair-Step.                  |
| DB integration     | PostgreSQL real/efêmero; testar migrations, SQL e constraints.                             |
| Queue integration  | Redis/Valkey + BullMQ reais em cenários críticos.                                          |
| E2E Web            | Playwright; login, workspaces, CRM, Estimate, Job, Schedule, Portal, permissions.          |
| E2E Mobile         | Maestro; Today, Service, Daily Log, photos, material, change order, signature, deep links. |
| Performance        | k6; cenários críticos com thresholds objetivos.                                            |
| Security           | Cross-tenant, direct-ID access, signatures, secrets, scopes e dependency scanning.         |

## 15.1 Coverage baseline

- Lines ≥ 80%

- Functions ≥ 80%

- Statements ≥ 80%

- Branches ≥ 70%

- Authorization, Financial e Scheduling podem exigir thresholds maiores por módulo.

- Coverage é indicador, não substituto de testes significativos.

## 15.2 Casos obrigatórios

- Timezone e Daylight Saving Time dos EUA.

- Escadinha: aumento/redução de duração, feriado, bloqueio, conflict, completed service e múltiplas Crews.

- Money rounding, taxes, discounts, commission, partial payments, refunds e Change Orders.

- Webhook duplicated, invalid signature, out-of-order, timeout, 500 e retry.

- Queue retry/idempotency e worker restart.

- Approved Estimate/Change Order snapshot imutável.

- Permission matrix incluindo Custom Roles, direct-ID access e Client Portal scope.

- Automation AND/OR, delay, disabled, loop prevention e failed action.

- MCP/Public API authorization e credential revocation.

# 16. CI/CD e Release Engineering

## 16.1 Git e Pull Requests

- Trunk-based development com branches curtas; sem GitFlow pesado.

- main protegida; mudanças via Pull Request.

- Pelo menos uma aprovação humana; mudanças sensíveis podem exigir revisão adicional.

- Squash merge como direção para histórico principal limpo.

- PR visual aponta para Screen ID/Figma quando aplicável; API pública atualiza contrato/docs; schema muda via migration.

## 16.2 Quality Gates do PR

1.  Install / dependency integrity.

2.  Lint.

3.  Type-check.

4.  Unit tests.

5.  Integration tests principais.

6.  Coverage.

7.  Build Web/API/Worker.

8.  Security / dependency / secret checks.

9.  Migration validation.

10. E2E smoke Web quando aplicável.

## 16.3 Deploy e rollback

- Production deploy automatizado; nenhum upload manual de servidor como processo normal.

- Staging persistente e separado; providers em Sandbox/Test.

- Migrations preferencialmente backward-compatible: expand → deploy → migrate → cleanup.

- Aplicação tem rollback; rollback de aplicação não implica rollback automático de schema.

- Feature Flags para rollout progressivo e desativação rápida.

- Production smoke tests seguros após deploy.

- Mobile usa EAS Workflows/Build/Submit/Update com preview antes de production.

# 17. Infraestrutura da V1

| **Componente**                   | **Provider / Região inicial**       | **Notas**                                                                       |
|----------------------------------|-------------------------------------|---------------------------------------------------------------------------------|
| Web/PWA/Portal                   | Vercel / iad1 US East               | CDN global; server-side próximo do backend/dados.                               |
| NestJS API                       | Render / Virginia                   | Docker, stateless, deploy independente.                                         |
| BullMQ Workers                   | Render / Virginia                   | Background Workers separados da API.                                            |
| Queue/Cache                      | Render Key Value / Virginia         | Valkey 8 Redis-compatible; persistence Journal + Snapshot para fila Production. |
| PostgreSQL/Auth/Storage/Realtime | Supabase / North Virginia us-east-1 | Projects separados para Development/Staging/Production.                         |
| Mobile                           | Expo / EAS                          | Build, Submit, Update e workflows.                                              |
| CI                               | GitHub Actions                      | Orquestrador principal do monorepo.                                             |
| Observability                    | Sentry + OpenTelemetry              | Errors + traces/metrics.                                                        |

## 17.1 Ambiente por estágio

| **Ambiente** | **Características**                                                                                |
|--------------|----------------------------------------------------------------------------------------------------|
| Development  | Local Web/API/Workers, Postgres/Redis locais ou dev project, provider mocks e Sandboxes opcionais. |
| Staging      | Vercel + Render + Supabase + Key Value próprios; provider Sandboxes; sem pagamentos reais.         |
| Production   | Infraestrutura separada, secrets próprios, monitoramento, backups e providers Production.          |

## 17.2 Scaling

- Web: scaling gerenciado pela Vercel.

- API: stateless, horizontal scaling; começar dimensionado para Alpha/Beta e evoluir por métricas.

- Antes de GA/pagantes relevantes, direção de mínimo duas instâncias de API se custo/plano permitir.

- Workers escalam horizontalmente conforme queue depth/processing latency.

- Autoscaling não será ativado cegamente no primeiro dia; medir antes e definir min/max/thresholds.

- DB: índices, query optimization, pooling e vertical scaling primeiro; sem sharding na V1.

- Search fica no PostgreSQL enquanto atender SLOs; adapter SearchService permitirá evolução futura.

# 18. Operação, Health, SLOs e Capacity Planning

## 18.1 Health checks

- API expõe /health.

- Liveness verifica processo vivo; readiness verifica capacidade de atender.

- Health checks não executam dezenas de dependências externas pesadas.

- API/Workers suportam graceful shutdown.

## 18.2 Cron / tarefas periódicas

- Reconciliation, cleanup, expired trials, overdue reminders e maintenance.

- Scheduler dispara fila; lógica pesada roda em Worker.

- Toda chamada externa possui timeout explícito e retry/backoff apropriado.

- Circuit breaker pode ser adicionado onde falha persistente de provider justificar.

## 18.3 Capacity e limites técnicos

- Capacity reviews por users, Jobs, DB size, files, queue volume, API traffic e messaging volume.

- Limites técnicos para file size/count, bulk actions, recipients, export rows, API page size etc.

- Rate limits por categoria; Auth e Public API mais restritos.

- Usage metering interno para users, Locations, storage, SMS, automation executions e API usage.

- Planos mapeados para Entitlements, nunca dezenas de if plan === Pro espalhados pelo código.

# 19. Segurança Operacional e Ownership

- Contas Vercel, Render, Supabase, GitHub, Expo, Sentry e providers Production pertencem à empresa CrewCommand.

- Nenhum provider crítico preso permanentemente ao e-mail pessoal de desenvolvedor.

- Acessos de infraestrutura revisados periodicamente e revogados rapidamente na saída da equipe.

- Desenvolvedores não possuem acesso irrestrito rotineiro ao banco Production.

- Support Mode e ferramentas internas são preferidos a SQL direto para suporte ao cliente.

- Infrastructure/config crítica versionada como código quando possível: Render Blueprints, Vercel config, Supabase migrations/config.

- ADRs registram decisões arquiteturais; Runbooks cobrem incidentes e operações críticas.

# 20. Estágios de Lançamento

| **Estágio**          | **Requisitos principais**                                                                             |
|----------------------|-------------------------------------------------------------------------------------------------------|
| Internal Alpha       | Poucos usuários controlados; infra menor; Staging separado; isolamento e integridade já obrigatórios. |
| Private Beta         | Backups, monitoring, alerts, incident runbook, Feature Flags e suporte operacional ativos.            |
| Limited Production   | Capacidade e HA ampliadas conforme clientes reais; observabilidade e reconciliation maduros.          |
| General Availability | SLO monitoring, restore drill, multi-instance API, security review, E2E crítico e support process.    |

# 21. ADRs Iniciais Recomendados

| **ADR** | **Decisão**                                          |
|---------|------------------------------------------------------|
| ADR-001 | Modular Monolith para a V1.                          |
| ADR-002 | TypeScript como linguagem principal.                 |
| ADR-003 | PostgreSQL como source of truth.                     |
| ADR-004 | Supabase Auth + authorization própria.               |
| ADR-005 | Shared DB / shared schema multi-tenancy.             |
| ADR-006 | NestJS + Fastify para API.                           |
| ADR-007 | BullMQ + Valkey para async workloads.                |
| ADR-008 | Transactional Outbox para domain events.             |
| ADR-009 | Next.js App Router para Web/PWA/Portal.              |
| ADR-010 | React Native + Expo para mobile.                     |
| ADR-011 | Vercel + Render + Supabase como infraestrutura V1.   |
| ADR-012 | Stripe Connect como provider de pagamento principal. |
| ADR-013 | QuickBooks Online como integração contábil inicial.  |
| ADR-014 | Twilio + Resend para comunicação externa inicial.    |

# 22. PoCs Obrigatórios Antes do Início da Implementação

1\. ORM / query layer: comparar opções atuais sobre transactions, migrations, RLS, JSONB, FTS, pg_trgm, raw SQL, pooling e typing.

2\. Database connection strategy: validar Supavisor/direct connection/session/transaction conforme driver escolhido.

3\. Design System em código: validar solução de styling e integração com tokens aprovados.

4\. Monorepo tooling: validar pnpm + Turborepo em Web/API/Worker/Mobile.

5\. BullMQ + Render Key Value: validar jobs, retries, graceful shutdown, persistence e worker scaling.

6\. Supabase Realtime Broadcast: validar canais privados, authorization e volume de Chat/Notifications.

7\. Stripe Connect sandbox: onboarding, connected account, card, ACH e webhook signatures.

8\. QuickBooks sandbox: OAuth refresh rotation, Customer mapping, Invoice/Payment sync, webhooks e reconciliation.

9\. Twilio: Messaging Service, inbound SMS, status callbacks, opt-out e A2P onboarding flow.

10\. Resend: outbound + inbound replies + attachments + conversation mapping.

11\. Expo: deep links, push, camera/upload, EAS preview, source maps e Maestro flow.

12\. End-to-end observability: request_id da API até Queue/Worker/Provider e Sentry/OTel correlation.

# 23. Definition of Ready para o Implementation Plan

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><strong>Gate<br />
</strong>O Implementation Plan só deve decompor a construção após os PoCs técnicos críticos resolverem as decisões marcadas como pendentes. O plano não deve inventar respostas que este TRD deliberadamente deixou para validação prática.</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

☐ PRD, App Flow, Domain Model e UI/UX aprovados.

☐ TRD v1.0 aprovado.

☐ Arquitetura e infraestrutura V1 aprovadas.

☐ PoC do ORM/query layer concluído.

☐ PoC de conexão/pooling concluído.

☐ PoC do monorepo/build pipeline concluído.

☐ PoCs de Stripe/QuickBooks/Twilio/Resend com Sandboxes concluídos.

☐ PoC do mobile/deep links/push concluído.

☐ ADR inicial criado para as decisões fundamentais.

☐ Ambientes Development/Staging bootstrap definidos.

# 24. Princípio Técnico Final

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><strong>Arquitetura oficial da V1<br />
</strong>CrewCommand V1 será uma plataforma TypeScript modular, multi-tenant e orientada a eventos, com PostgreSQL como fonte de verdade, infraestrutura gerenciada, API e Workers independentes, autorização centralizada, integrações desacopladas, segurança em camadas, observabilidade completa e capacidade de escalar horizontalmente sem introduzir complexidade distribuída antes de ela ser necessária.</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

# Apêndice A — Referências Técnicas que Devem Ser Revalidadas no Kickoff

Estas tecnologias foram aprovadas na descoberta do TRD. Versões exatas e detalhes de provider mudam com o tempo; no kickoff da implementação, a equipe deve revalidar a documentação oficial e registrar a versão efetivamente utilizada no ADR/repositório.

| **Tecnologia**    | **Área**                                                  | **Referência oficial**                 |
|-------------------|-----------------------------------------------------------|----------------------------------------|
| Next.js           | App Router / PWA                                          | nextjs.org/docs                        |
| NestJS            | Fastify / Queues / OpenAPI                                | docs.nestjs.com                        |
| PostgreSQL        | Versão suportada pelo provider, UUIDv7/FTS/JSONB          | postgresql.org/docs                    |
| Supabase          | Auth / Storage / Realtime / Backups / Regions             | supabase.com/docs                      |
| Expo              | SDK estável / Router / Notifications / EAS                | docs.expo.dev                          |
| Stripe            | Connect / Payments / Webhooks                             | docs.stripe.com                        |
| QuickBooks Online | Accounting API / OAuth / Webhooks                         | developer.intuit.com                   |
| Twilio            | Programmable Messaging / A2P 10DLC / Webhooks             | twilio.com/docs                        |
| Resend            | Email / Inbound / Domains / Webhooks                      | resend.com/docs                        |
| OpenTelemetry     | JavaScript instrumentation                                | opentelemetry.io/docs/languages/js     |
| Sentry            | Next.js / NestJS / React Native                           | docs.sentry.io                         |
| Playwright        | E2E / Trace / CI                                          | playwright.dev/docs                    |
| Maestro           | Mobile E2E / Expo workflows                               | maestro.mobile.dev / docs.expo.dev     |
| k6                | Performance testing                                       | grafana.com/docs/k6                    |
| Render            | Web Services / Workers / Key Value / Scaling / Blueprints | render.com/docs                        |
| Vercel            | Regions / Functions / Next.js                             | vercel.com/docs                        |
| OWASP             | ASVS 5.0 / Secrets guidance                               | owasp.org / cheatsheetseries.owasp.org |

# Apêndice B — Glossário Técnico

| **Termo**                      | **Definição no CrewCommand**                                                         |
|--------------------------------|--------------------------------------------------------------------------------------|
| Workspace                      | Empresa/tenant cliente do SaaS.                                                      |
| Membership                     | Relação User ↔ Workspace com Role/Permissions/Scope.                                 |
| Location                       | Filial operacional dentro do Workspace.                                              |
| Application Service / Use Case | Unidade de regra/aplicação chamada por API, Workers, MCP etc.                        |
| Domain Event                   | Evento versionado de negócio, ex.: estimate.approved.                                |
| Outbox                         | Registro transacional que garante que eventos não sejam perdidos após commit.        |
| Worker                         | Processo assíncrono que consome BullMQ.                                              |
| Provider Adapter               | Implementação específica de QuickBooks/Stripe/Twilio/etc. atrás de contrato interno. |
| RLS                            | Row Level Security no PostgreSQL/Supabase como camada adicional de isolamento.       |
| SLO                            | Objetivo operacional interno; não equivale automaticamente a SLA contratual.         |
