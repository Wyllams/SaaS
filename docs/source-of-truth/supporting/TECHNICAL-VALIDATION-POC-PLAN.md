**CrewCommand**

> **ATUALIZAÇÃO VIGENTE — 2026-09-25:** a topologia Render/NestJS/BullMQ/Valkey descrita abaixo é histórica e foi **superseded por ADR-016**. O plano de dados é Supabase — PostgreSQL, Auth, Storage, Realtime, `pgmq` e `pg_cron`. A **execução HTTP de negócio é Next.js (Route Handlers e Server Actions) por ADR-017**; as Edge Functions do Supabase são transitórias e saem no Epic 0 / Fase 2. Referências antigas ao Render permanecem apenas como evidência de execuções anteriores e não orientam nova implementação.


**TECHNICAL VALIDATION & PoC PLAN**

**Plano de Validação Técnica — v1.0**

Operationalização dos 12 PoCs obrigatórios definidos no TRD Oficial v1.0 antes do início da implementação.

| **Status**            | Pronto para execução                                 |
|-----------------------|------------------------------------------------------|
| **Fonte de verdade**  | CrewCommand TRD Oficial v1.0                         |
| **PoCs obrigatórios** | 12                                                   |
| **Próximo gate**      | ADRs + Implementation Plan                           |
| **Produção**          | Nenhum PoC usa dados/credenciais reais de Production |

# 1. Objetivo e Autoridade do Documento

Este documento transforma as decisões aprovadas no TRD Oficial do CrewCommand em um programa executável de validação técnica. O objetivo não é construir funcionalidades finais, mas reduzir risco antes de congelar o Implementation Plan e iniciar a implementação em escala.

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><strong>Regra de autoridade<br />
</strong>O TRD continua sendo a fonte de verdade arquitetural. Este plano não cria uma nova stack nem substitui decisões aprovadas; ele define como provar, medir e registrar as decisões que o TRD marcou como PoC obrigatório.</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

## 1.1 O que um PoC deve responder

- A tecnologia/abordagem funciona com as restrições reais do CrewCommand?

- A decisão mantém multi-tenancy, autorização, observabilidade e integridade necessárias?

- O resultado é operacionalmente simples o suficiente para a V1?

- Existe evidência reproduzível para justificar a decisão no ADR?

- Há algum blocker que force revisar o TRD antes do Implementation Plan?

## 1.2 O que um PoC não é

- Não é feature pronta para cliente.

- Não é código Production por padrão.

- Não deve usar dados reais de clientes.

- Não deve esconder limitações apenas para “passar”.

- Não é benchmark acadêmico: mede o que importa para os fluxos aprovados do CrewCommand.

# 2. Gates de Decisão

| **Gate**                                          | **Condição**                                                                                                                                                                          | **Resultado**                                                |
|---------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------|
| Gate A — Ready to Draft Implementation Plan       | Arquitetura/documentos aprovados; PoCs de ORM, pooling, monorepo, Stripe, QuickBooks, Twilio, Resend e Mobile concluídos; ADRs iniciais e bootstrap de Development/Staging definidos. | Implementation Plan pode ser redigido com riscos conhecidos. |
| Gate B — Ready to Freeze Implementation Plan v1.0 | Todos os 12 PoCs concluídos; decisões PASS/CONDITIONAL PASS documentadas; blockers resolvidos ou explicitamente replanejados.                                                         | Implementation Plan v1.0 pode ser congelado.                 |
| Gate C — Ready to Start Feature Implementation    | ADRs aprovados; repositório/ambientes base prontos; nenhum PoC crítico em FAIL sem decisão de arquitetura substituta.                                                                 | Implementação das Epics pode começar.                        |

# 3. Status e Critério de Encerramento

| **Status**           | **Definição**                                                                                                    |
|----------------------|------------------------------------------------------------------------------------------------------------------|
| NOT STARTED          | PoC ainda não iniciado.                                                                                          |
| IN PROGRESS          | Experimentos em execução; decisão ainda não permitida.                                                           |
| PASS                 | Todos os critérios obrigatórios cumpridos; decisão pode virar ADR.                                               |
| PASS WITH CONDITIONS | A abordagem é viável, mas possui condições/limitações explícitas que devem constar no ADR e Implementation Plan. |
| FAIL                 | A abordagem testada não atende um requisito crítico; alternativa deve ser testada ou TRD revisado.               |
| BLOCKED              | Dependência externa, acesso ou condição impede validação; blocker precisa de owner e resolução.                  |

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><strong>Shipping gate do PoC<br />
</strong>Nenhum PoC é encerrado apenas com “funcionou na minha máquina”. O fechamento exige evidências reproduzíveis, resultado contra critérios objetivos e decisão registrada.</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

# 4. Sequência de Execução e Dependências

A ordem abaixo reduz retrabalho. O POC-12 (observabilidade) começa cedo e acompanha os demais, porque sua própria prova exige seguir uma operação da API até Worker/Provider.

<img src="media/image1.png" style="width:7in;height:1.8629in" />

## 4.1 Ondas recomendadas

| **Wave**        | **PoCs**               | **Objetivo**                                                                 |
|-----------------|------------------------|------------------------------------------------------------------------------|
| 0 — Bootstrap   | POC-04                 | Validar estrutura do monorepo, tasks, builds e compartilhamento de packages. |
| 1 — Fundação    | POC-01, POC-02, POC-03 | Fechar acesso a dados/pooling e Design System em código.                     |
| 2 — Plataforma  | POC-05, POC-06         | Provar filas/workers e realtime privado.                                     |
| 3 — Integrações | POC-07, 08, 09, 10     | Provar os quatro contratos externos críticos em sandbox.                     |
| 4 — Mobile      | POC-11                 | Provar deep links, push, câmera/upload, EAS e E2E mobile.                    |
| Cross-cutting   | POC-12                 | Instrumentar API → Queue/Worker → Provider com correlação ponta a ponta.     |

## 4.2 Grafo de dependências

<img src="media/image2.png" style="width:6.6in;height:2.68462in" />

# 5. Padrão de Execução de Todo PoC

1.  Abrir branch/repositório de experimento dentro do monorepo validado ou área técnica apropriada.

2.  Registrar hipótese, requisitos críticos e critérios de aprovação antes de codificar.

3.  Executar exclusivamente com dados sintéticos e providers Sandbox/Test.

4.  Adicionar logs/correlation IDs mínimos desde o início para que o experimento seja observável.

5.  Executar happy path e os principais casos de falha definidos neste plano.

6.  Guardar evidências: código, comandos, screenshots, traces, logs, métricas e resultados.

7.  Preencher decisão PASS / PASS WITH CONDITIONS / FAIL / BLOCKED.

8.  Criar ou atualizar ADR correspondente antes de considerar o PoC encerrado.

9.  Registrar impactos no Implementation Plan: dependências, riscos, tasks de hardening e custos operacionais.

## 5.1 Estrutura recomendada de evidências

No repositório, usar uma área como \`docs/technical-validation/POC-XX/\` contendo \`README.md\`, evidências, comandos, resultados e link para o ADR. Segredos e arquivos sensíveis nunca entram no Git.

# POC-01 — ORM / Typed Query Layer

| **Campo**               | **Definição**                                                                                                                            |
|-------------------------|------------------------------------------------------------------------------------------------------------------------------------------|
| Decisão que desbloqueia | Escolher a camada TypeScript de acesso a PostgreSQL sem comprometer recursos nativos aprovados no TRD.                                   |
| Hipótese                | A opção vencedora permite transactions, migrations, RLS-aware access, JSONB, FTS/pg_trgm, raw SQL e typing forte sem distorcer o schema. |
| Pré-requisitos          | POC-04 iniciado/concluído; PostgreSQL de Development; schema mínimo representando Workspace, Customer, Property, Job e Audit.            |
| Responsável sugerido    | Backend/Platform Engineer                                                                                                                |
| Esforço relativo        | Alto                                                                                                                                     |

## Experimentos / Casos de Teste

- Implementar o mesmo mini-domain em pelo menos duas opções atuais de typed query layer/ORM escolhidas no kickoff; manter SQL nativo como escape hatch.

- Criar migrations e rollback/forward seguro para schema inicial e uma alteração compatível.

- Executar transaction multi-table equivalente a um fluxo simplificado de Estimate approval/Job creation.

- Testar RLS/tenant scope com dois Workspaces e tentativa deliberada de cross-tenant access.

- Testar JSONB consultável, índice GIN, Full-Text Search e pg_trgm em dados sintéticos.

- Executar query complexa com raw SQL sem perder ergonomia de transação/typing no restante do use case.

- Medir ergonomia, SQL produzido, performance básica e clareza de debugging.

## Critérios de Aprovação

- Nenhuma opção pode exigir abandonar Foreign Keys, RLS, índices ou SQL nativo aprovados.

- Transactions e migrations funcionam de forma previsível.

- Cross-tenant access falha nos testes de autorização/DB.

- FTS/pg_trgm/JSONB funcionam sem hacks frágeis.

- O time consegue inspecionar SQL e diagnosticar falhas.

- Existe um vencedor claro ou decisão “typed query layer + raw SQL” documentada.

## Condições de Falha / Reavaliação

- Ferramenta impede/complica significativamente recursos PostgreSQL essenciais.

- Migrations não são confiáveis ou não suportam fluxo seguro de schema evolution.

- Typing depende de abstrações que escondem demais o SQL e dificultam operações críticas.

- Não há caminho limpo para RLS/transactions/raw SQL.

## Evidências Obrigatórias

- Repositório/branch do experimento com o mesmo conjunto de cenários nas opções avaliadas.

- Migration files e SQL resultante.

- Test output de tenant isolation, FTS e transactions.

- Scorecard preenchido e recomendação final.

## Scorecard de Decisão

| **Critério**                        | **Peso / Regra** |
|-------------------------------------|------------------|
| Transactions & integridade          | 25%              |
| RLS / tenant safety                 | 20%              |
| Migrations                          | 15%              |
| PostgreSQL features / raw SQL       | 15%              |
| Typing & DX                         | 10%              |
| Debuggability                       | 5%               |
| Pooling compatibility / performance | 10%              |

## Saída / ADR

Criar \`ADR-ORM-QUERY-LAYER\` registrando opção escolhida, versão validada, raw SQL policy, migration strategy e limitações conhecidas.

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><strong>Observação<br />
</strong>As candidatas exatas e versões devem ser revalidadas no kickoff. O PoC não deve escolher por popularidade; deve escolher pelo fit com o Domain Model e PostgreSQL aprovado.</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

# POC-02 — Database Connection Strategy / Pooling

| **Campo**               | **Definição**                                                                                                                                                             |
|-------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Decisão que desbloqueia | Escolher como API e Workers se conectam ao Supabase PostgreSQL: direct, Supavisor session ou transaction mode conforme driver/ORM.                                        |
| Hipótese                | A estratégia escolhida sustenta concorrência da API/Workers, transactions e comportamento do driver sem esgotar conexões nem quebrar prepared statements/features usadas. |
| Pré-requisitos          | POC-01 com finalistas definidos; Supabase Development/Staging; API NestJS mínima; worker de teste.                                                                        |
| Responsável sugerido    | Backend/Platform Engineer                                                                                                                                                 |
| Esforço relativo        | Médio                                                                                                                                                                     |

## Experimentos / Casos de Teste

- Testar conexão direta e modos Supavisor aplicáveis ao driver escolhido.

- Executar bursts concorrentes de reads/writes representativos de CRM/Jobs.

- Executar transactions curtas e casos com retry controlado.

- Validar comportamento de prepared statements se a biblioteca os utilizar.

- Simular API + múltiplos workers simultâneos e observar pool/connections.

- Forçar restart/redeploy e confirmar recuperação sem conexões zumbis.

- Documentar configuração separada para migrations/admin tasks versus runtime, se necessário.

## Critérios de Aprovação

- Nenhum esgotamento de conexões no perfil de carga acordado para Private Beta.

- Transactions funcionam corretamente.

- Redeploys recuperam conexões automaticamente.

- Configuração do pool é simples de reproduzir por ambiente.

- Migrations possuem caminho suportado/seguro.

## Condições de Falha / Reavaliação

- Prepared statements ou transactions quebram no modo escolhido.

- API/Workers saturam conexões com pequena concorrência.

- A configuração exige exceções manuais por deploy.

- Não existe separação segura entre migrations e runtime.

## Evidências Obrigatórias

- Config final do driver/pool.

- Gráficos/logs de conexão e concorrência.

- Lista de limites e parâmetros por API/Worker.

- Teste reproduzível de reconnect/redeploy.

## Saída / ADR

Atualizar ADR do data access ou criar \`ADR-DB-CONNECTION-POOLING\` com modo escolhido, parâmetros iniciais e regras para migrations.

# POC-03 — Design System em Código / Styling Web

| **Campo**               | **Definição**                                                                                                                                              |
|-------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Decisão que desbloqueia | Escolher a estratégia de styling Web que melhor implementa os tokens e componentes aprovados no UI/UX sem criar estilos ad hoc.                            |
| Hipótese                | A solução escolhida consegue representar Foundations, variants, responsividade, acessibilidade e estados do Design System com integração limpa ao Next.js. |
| Pré-requisitos          | POC-04; UI/UX Design Document; package \`design-tokens\` inicial.                                                                                          |
| Responsável sugerido    | Frontend/UI Engineer                                                                                                                                       |
| Esforço relativo        | Médio                                                                                                                                                      |

## Experimentos / Casos de Teste

- Implementar tokens aprovados: Command Blue, Navy, status colors, typography, spacing, radius e breakpoints.

- Construir um conjunto representativo: Button, Input, Badge, Card, Drawer/Modal shell, Table cell, Job Card e Status Badge.

- Testar Desktop/Tablet/Mobile e textos em inglês/PT-BR mais longos.

- Testar focus states, keyboard navigation e contrast.

- Comparar as abordagens de styling finalistas definidas no kickoff sem alterar o design aprovado.

- Testar uso dos tokens em package compartilhado e consumo pelo Next.js.

- Medir clareza de variants, manutenção e risco de “magic values”.

## Critérios de Aprovação

- Componentes usam tokens sem duplicação de valores arbitrários.

- Variants e responsive behavior permanecem legíveis/manuteníveis.

- Acessibilidade básica aprovada.

- Não há dependência que impeça Next.js App Router ou build do monorepo.

- A abordagem suporta evolução futura para Dark Mode por tokens.

## Condições de Falha / Reavaliação

- Estilos exigem overrides frequentes por tela.

- Tokens não são a fonte de verdade.

- Responsividade/tradução quebram o componente base.

- A solução cria acoplamento desnecessário entre UI Web e React Native.

## Evidências Obrigatórias

- Página de showcase interna ou harness equivalente.

- Código dos componentes e tokens.

- Comparativo das opções.

- Screenshots Desktop/Tablet/Mobile e checks de a11y.

## Scorecard de Decisão

| **Critério**               | **Peso / Regra** |
|----------------------------|------------------|
| Token fit / consistency    | 25%              |
| Responsividade / i18n      | 15%              |
| Acessibilidade             | 15%              |
| Variants / maintainability | 15%              |
| Next.js fit / bundle       | 10%              |
| DX / velocidade            | 10%              |
| Dark-mode readiness        | 10%              |

## Saída / ADR

Criar \`ADR-WEB-STYLING-DESIGN-SYSTEM\` com solução escolhida, regras de tokens, composição e política contra estilos ad hoc.

# POC-04 — Monorepo Tooling — pnpm + Turborepo

| **Campo**               | **Definição**                                                                                                                         |
|-------------------------|---------------------------------------------------------------------------------------------------------------------------------------|
| Decisão que desbloqueia | Validar a organização física do repositório e o task runner/cache para Web, API, Worker, Mobile e packages compartilhados.            |
| Hipótese                | pnpm workspaces + Turborepo conseguem builds independentes, shared packages, affected tasks e CI cache sem atrapalhar Expo/Next/Nest. |
| Pré-requisitos          | Nenhum além do TRD/UIUX; este é o bootstrap prioritário.                                                                              |
| Responsável sugerido    | Platform/Full-stack Engineer                                                                                                          |
| Esforço relativo        | Médio                                                                                                                                 |

## Experimentos / Casos de Teste

- Criar \`apps/web\`, \`apps/api\`, \`apps/worker\`, \`apps/mobile\` e packages \`design-tokens\`, \`api-client\`, \`types/config\` mínimos.

- Configurar lint, typecheck, unit test e build por app/package.

- Validar imports compartilhados sem ciclos indevidos.

- Executar build completo e build afetado após mudar apenas um package.

- Validar Expo/Metro consumindo packages internos.

- Validar Next.js e NestJS consumindo packages internos.

- Rodar workflow GitHub Actions de smoke com cache seguro.

## Critérios de Aprovação

- Todos os apps compilam a partir do mesmo monorepo.

- Mobile/Expo resolve packages internos sem workaround frágil.

- Tasks afetadas/cache funcionam corretamente.

- Cada app pode ser deployado independentemente.

- CI consegue executar lint/typecheck/tests/build de forma reproduzível.

## Condições de Falha / Reavaliação

- Expo/Metro exige estrutura incompatível com os packages compartilhados.

- Cache retorna artefatos incorretos.

- Build/deploy de um app depende desnecessariamente de todos os outros.

- Monorepo adiciona configuração maior que o ganho operacional.

## Evidências Obrigatórias

- Repositório bootstrap.

- Pipeline CI verde.

- Diagrama de packages/dependencies.

- Comandos oficiais de desenvolvimento/build/test.

## Saída / ADR

Criar \`ADR-MONOREPO-PNPM-TURBOREPO\` e fixar package manager/task runner após PASS.

# POC-05 — BullMQ + Render Key Value (Valkey)

| **Campo**               | **Definição**                                                                                                                   |
|-------------------------|---------------------------------------------------------------------------------------------------------------------------------|
| Decisão que desbloqueia | Validar fila persistente, retries, idempotência, graceful shutdown e execução separada da API em Render.                        |
| Hipótese                | BullMQ sobre Render Key Value atende workloads assíncronos do CrewCommand e pode escalar Workers sem duplicar efeitos críticos. |
| Pré-requisitos          | POC-04; POC-01/02; Render staging; Key Value pago/staging equivalente.                                                          |
| Responsável sugerido    | Backend/Platform Engineer                                                                                                       |
| Esforço relativo        | Alto                                                                                                                            |

## Experimentos / Casos de Teste

- Criar fila de integração e fila de notificações mínimas.

- Processar jobs com sucesso e falha temporária com backoff.

- Forçar worker crash durante processamento e validar comportamento de retry/idempotência.

- Simular evento duplicado e garantir efeito único.

- Executar dois workers concorrentes consumindo a mesma fila.

- Validar graceful shutdown em redeploy.

- Validar failed jobs/retry manual e persistência após restart da instância Key Value.

- Propagar request_id/correlation_id para iniciar POC-12.

## Critérios de Aprovação

- Nenhum efeito financeiro/integracional duplicado no teste de retry.

- Retries/backoff observáveis e limitados.

- Worker restart/redeploy não perde jobs persistidos.

- Dois workers processam backlog sem conflito indevido.

- Graceful shutdown não abandona silenciosamente trabalho corrente.

- Failed jobs são inspecionáveis.

## Condições de Falha / Reavaliação

- Jobs são perdidos em restart normal.

- Retries geram efeitos duplicados.

- Persistência/latência do provider não atende o uso esperado.

- Operação exige acoplamento da fila ao processo da API.

## Evidências Obrigatórias

- Logs dos jobs e retries.

- Screenshot/metrics de queue depth e workers.

- Teste idempotency reproduzível.

- Config Render/Valkey documentada.

## Saída / ADR

Criar \`ADR-QUEUE-BULLMQ-VALKEY\` com queue topology inicial, persistence, retry policy e worker deployment model.

# POC-06 — Supabase Realtime Broadcast

| **Campo**               | **Definição**                                                                                                                        |
|-------------------------|--------------------------------------------------------------------------------------------------------------------------------------|
| Decisão que desbloqueia | Validar canais privados, autorização e comportamento de Chat/Notifications/Job updates sem transformar Realtime na fonte de verdade. |
| Hipótese                | Broadcast privado atende UX realtime e mantém isolamento por Workspace/User/Job, com fallback para API/banco após reconnect.         |
| Pré-requisitos          | POC-01/02; Supabase staging; auth mínima; dados sintéticos de dois Workspaces.                                                       |
| Responsável sugerido    | Backend/Realtime Engineer                                                                                                            |
| Esforço relativo        | Médio                                                                                                                                |

## Experimentos / Casos de Teste

- Criar channels privados para user notifications e job chat.

- Validar subscription autorizada e tentativa cross-workspace rejeitada.

- Persistir mensagem no banco e usar Broadcast somente para entrega imediata.

- Desconectar cliente, criar eventos e reconectar; recuperar estado autoritativo pela API.

- Testar múltiplas abas/dispositivos do mesmo User.

- Medir entrega sob carga representativa da Private Beta definida no kickoff.

- Verificar que duplicação eventual de evento não duplica registro persistente.

## Critérios de Aprovação

- Nenhum evento cross-workspace é recebido.

- Estado persistido é recuperável após perda de Realtime.

- Chat/notifications aparecem em poucos segundos em carga planejada.

- Reconnect é previsível e não exige refresh manual da sessão na maioria dos casos.

- A autorização do channel é testável e auditável.

## Condições de Falha / Reavaliação

- Channel privado permite inscrição indevida.

- Perda de conexão perde estado de negócio.

- Broadcast exige replicar todas as mudanças do banco indiscriminadamente.

- Volume representativo apresenta degradação incompatível com UX.

## Evidências Obrigatórias

- Testes cross-tenant.

- Vídeo/trace de chat e reconnect.

- Métricas de entrega no perfil de carga do PoC.

- Documentação de channel naming/authorization.

## Saída / ADR

Criar \`ADR-REALTIME-SUPABASE-BROADCAST\` registrando use cases autorizados, channel strategy e fallback para API.

# POC-07 — Stripe Connect Sandbox

| **Campo**               | **Definição**                                                                                                                            |
|-------------------------|------------------------------------------------------------------------------------------------------------------------------------------|
| Decisão que desbloqueia | Validar onboarding de Connected Account, Card, ACH, webhooks assinados e reconciliação local sem armazenar dados brutos de cartão/banco. |
| Hipótese                | Stripe Connect atende o modelo multi-merchant do CrewCommand e o PaymentProvider pode permanecer desacoplado do domínio financeiro.      |
| Pré-requisitos          | POC-04/01; Stripe test mode; endpoint webhook staging; workspace sintético.                                                              |
| Responsável sugerido    | Backend/Integrations Engineer                                                                                                            |
| Esforço relativo        | Alto                                                                                                                                     |

## Experimentos / Casos de Teste

- Criar connected account em sandbox via Hosted/Embedded Onboarding apropriado.

- Persistir mapping Workspace ↔ Connected Account.

- Criar pagamento Card e atualizar estado local via webhook verificado.

- Executar fluxo ACH de teste suportado pelo provider.

- Testar payment failure, refund e partial refund quando aplicável ao fluxo escolhido.

- Reenviar mesmo Event ID e validar idempotência.

- Testar webhook com assinatura inválida.

- Interromper webhook temporariamente e validar replay/reconciliation.

## Critérios de Aprovação

- Nenhum dado bruto de cartão/CVC/banco sensível toca nossos servidores.

- Onboarding e mapping são reproduzíveis.

- Webhook é verificado e idempotente.

- Status local converge para o provider após retry/replay.

- Refund aparece como transação separada.

- PaymentProvider adapter não vaza lógica Stripe para Financial domain.

## Condições de Falha / Reavaliação

- Fluxo exige Secret API Key do merchant copiada manualmente.

- Duplicate webhook duplica pagamento/refund.

- Ach/card não podem ser reconciliados com Invoice/Payment local.

- Provider coupling invade regras centrais.

## Evidências Obrigatórias

- Screenshots do onboarding sandbox.

- Logs/redacted payloads de webhooks válidos e inválidos.

- Registros locais de Payment/Refund.

- Test report de idempotência e retry.

## Saída / ADR

Criar \`ADR-PAYMENTS-STRIPE-CONNECT\` com onboarding model, webhook strategy, PaymentProvider contract e limites V1.

# POC-08 — QuickBooks Online Sandbox

| **Campo**               | **Definição**                                                                                                                        |
|-------------------------|--------------------------------------------------------------------------------------------------------------------------------------|
| Decisão que desbloqueia | Validar OAuth refresh rotation, Customer mapping, Invoice/Payment sync, webhook + reconciliation e controle de concorrência externo. |
| Hipótese                | QBO pode funcionar como sistema contábil externo sem se tornar fonte de verdade operacional do CrewCommand.                          |
| Pré-requisitos          | POC-04/01; Intuit sandbox company; endpoint webhook staging; worker integration queue.                                               |
| Responsável sugerido    | Backend/Integrations Engineer                                                                                                        |
| Esforço relativo        | Alto                                                                                                                                 |

## Experimentos / Casos de Teste

- Conectar Sandbox via OAuth e persistir realm/company ID e tokens de forma segura.

- Executar refresh e confirmar persistência do refresh token mais recente.

- Criar Customer externo a partir de mapping ausente; reutilizar mapping existente.

- Criar Invoice a partir de snapshot local e persistir external IDs/SyncToken.

- Registrar/observar Payment no QBO e refletir localmente.

- Testar webhook como signal + fetch autoritativo pela API.

- Simular webhook perdido e provar reconciliation periódica.

- Forçar update concorrente e tratar SyncToken/version conflict.

- Revogar/reautorizar conexão.

## Critérios de Aprovação

- OAuth/refresh é estável e secrets permanecem protegidos.

- Customer mapping evita duplicidade por nome.

- Invoice/Payment local e externo convergem.

- Webhook perdido é recuperável por reconciliation.

- Conflito de versão não sobrescreve silenciosamente estado externo.

- Disconnect preserva histórico/mappings sem continuar sync.

## Condições de Falha / Reavaliação

- Refresh rotation quebra a conexão facilmente.

- Matching depende de nome sem mapping confiável.

- Webhook é tratado como verdade sem re-fetch quando necessário.

- Reconciliation não consegue detectar divergências relevantes.

## Evidências Obrigatórias

- Fluxo OAuth gravado/documentado.

- Mappings Customer/Invoice/Payment.

- Logs de webhook + reconciliation.

- Caso de SyncToken conflict reproduzível.

## Saída / ADR

Criar \`ADR-ACCOUNTING-QUICKBOOKS-ONLINE\` com source-of-truth boundaries, mapping strategy e reconciliation schedule inicial.

# POC-09 — Twilio Messaging / A2P Readiness

| **Campo**               | **Definição**                                                                                                               |
|-------------------------|-----------------------------------------------------------------------------------------------------------------------------|
| Decisão que desbloqueia | Validar Messaging Service, SMS inbound/outbound, callbacks, opt-out e desenho do onboarding A2P para empresas dos EUA.      |
| Hipótese                | Twilio suporta Inbox SMS bidirecional e o CrewCommand consegue respeitar consent/opt-out e status de entrega por Workspace. |
| Pré-requisitos          | POC-04; Twilio test/trial account; número/Messaging Service controlado; webhook staging.                                    |
| Responsável sugerido    | Backend/Integrations Engineer                                                                                               |
| Esforço relativo        | Médio-Alto                                                                                                                  |

## Experimentos / Casos de Teste

- Enviar SMS outbound em ambiente de teste/controlado.

- Receber resposta inbound e mapear Conversation/Customer/Workspace.

- Processar status callbacks: queued/sent/delivered/failed/undelivered quando disponíveis.

- Validar assinatura do webhook e rejeitar assinatura inválida.

- Testar STOP/opt-out e bloqueio de automação subsequente.

- Medir e registrar uso por Workspace.

- Mapear passos/dados necessários do fluxo A2P para um Workspace/ISV, mesmo que registro carrier completo fique para piloto Production controlado.

## Critérios de Aprovação

- Inbound e outbound chegam à mesma conversa de forma confiável.

- Status e falhas são persistidos.

- Opt-out impede mensagens não permitidas.

- Webhook signature é verificada.

- Uso por Workspace é contabilizável.

- Fluxo A2P possui checklist técnico/operacional claro para onboarding Production.

## Condições de Falha / Reavaliação

- Mensagens não podem ser atribuídas de forma segura ao Workspace/Conversation.

- Opt-out pode ser contornado por Automation.

- Callbacks não são reconciliáveis.

- A arquitetura depende de um número global sem isolamento/roteamento adequado.

## Evidências Obrigatórias

- Conversação inbound/outbound de teste.

- Logs de callback e signature validation.

- Caso STOP/opt-out comprovado.

- Checklist A2P + dados requeridos + limitações de Trial/Sandbox.

## Saída / ADR

Criar \`ADR-SMS-TWILIO\` com Messaging Service strategy, inbound routing, opt-out rules e A2P onboarding requirements.

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><strong>Observação<br />
</strong>O PoC técnico pode validar o desenho do onboarding A2P sem concluir um registro carrier completo para cada futuro cliente. A validação Production real deve ocorrer com um piloto controlado antes de GA.</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

# POC-10 — Resend Outbound + Inbound Email

| **Campo**               | **Definição**                                                                                                                   |
|-------------------------|---------------------------------------------------------------------------------------------------------------------------------|
| Decisão que desbloqueia | Validar envio, reply routing, inbound webhook, attachments e mapping para Inbox sem construir infraestrutura própria de e-mail. |
| Hipótese                | Resend permite uma experiência bidirecional coerente com EmailProvider abstraction e preserva mensagens/anexos no CrewCommand.  |
| Pré-requisitos          | POC-04; domínio/subdomínio de teste verificado; webhook staging; storage dev/staging.                                           |
| Responsável sugerido    | Backend/Integrations Engineer                                                                                                   |
| Esforço relativo        | Médio                                                                                                                           |

## Experimentos / Casos de Teste

- Enviar e-mail outbound com Display Name/Reply-To controlado.

- Gerar alias/reply address que carregue contexto suficiente para resolver Workspace/Conversation sem expor dados sensíveis.

- Receber reply inbound por webhook e persistir Message.

- Processar attachment recebido via FileService/Storage pipeline.

- Testar bounce/delivery events disponíveis.

- Testar mensagem duplicada/retry e idempotência.

- Testar e-mail enviado para alias inválido/expirado.

## Critérios de Aprovação

- Reply retorna à Conversation correta.

- Attachment passa por pipeline e fica tenant-scoped.

- Bounce/delivery status atualiza Communication Log.

- Duplicate event não duplica Message.

- EmailProvider contract permite trocar provider no futuro.

- Nenhum Workspace consegue falsificar domínio remetente não verificado.

## Condições de Falha / Reavaliação

- Inbound não consegue mapear conversa de modo robusto.

- Attachments bypassam FileService/security.

- Eventos duplicados criam mensagens repetidas.

- Provider-specific details invadem módulos de CRM/Jobs.

## Evidências Obrigatórias

- Thread outbound/reply funcionando.

- Webhook logs e mensagem persistida.

- Attachment armazenado com metadata.

- Caso bounce/idempotency documentado.

## Saída / ADR

Criar \`ADR-EMAIL-RESEND\` com domain strategy, Reply-To mapping, inbound processing e EmailProvider contract.

# POC-11 — Expo Mobile — Deep Links, Push, Camera/Upload, EAS e Maestro

| **Campo**               | **Definição**                                                                                                                                                                   |
|-------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Decisão que desbloqueia | Validar a fundação mobile nativa aprovada para Field Worker e Salesperson antes de construir a experiência completa.                                                            |
| Hipótese                | Expo/React Native atende deep links universais, push, câmera, uploads múltiplos, secure storage, EAS preview/source maps e E2E Maestro com packages compartilhados do monorepo. |
| Pré-requisitos          | POC-04; auth/API mínima; storage staging; EAS project; ao menos um cenário iOS e Android.                                                                                       |
| Responsável sugerido    | Mobile Engineer                                                                                                                                                                 |
| Esforço relativo        | Alto                                                                                                                                                                            |

## Experimentos / Casos de Teste

- Login e recuperação segura de sessão usando storage protegido.

- Universal/App Link abre rota de Service/Job e revalida Workspace/permission.

- Push notification abre deep link correto.

- Câmera e seleção múltipla de imagens; compressão e upload com progresso individual/retry.

- Deixar app/reabrir e revalidar server state sem assumir Offline Mode.

- Gerar EAS preview builds iOS/Android e validar source maps no Sentry.

- Executar um fluxo Maestro: login → Today → Service → Daily Log → foto → save.

- Validar packages compartilhados \`api-client\`/tokens no Expo.

## Critérios de Aprovação

- Deep link respeita autorização e rota correta.

- Push funciona em dispositivo real nos dois ecossistemas previstos antes do fechamento definitivo.

- Upload múltiplo lida com falha individual sem perder os demais.

- Secure storage não usa AsyncStorage puro para token sensível.

- EAS preview é reproduzível.

- Maestro critical flow passa de forma consistente.

- Sentry recebe erro com source map legível em build de teste.

## Condições de Falha / Reavaliação

- Deep links funcionam apenas via custom hacks frágeis.

- Expo packages compartilhados quebram Metro/New Architecture.

- Push não é confiável em build real.

- Upload exige manter dados sensíveis/temporários de forma insegura.

- E2E não consegue executar em build representativo.

## Evidências Obrigatórias

- Preview builds e links de instalação internos.

- Vídeos/screenshots dos fluxos iOS/Android.

- Maestro flow no repositório.

- Sentry issue de teste com source map.

- Logs de deep link/push/upload.

## Saída / ADR

Criar \`ADR-MOBILE-EXPO\` com SDK/versions validadas no kickoff, routing/deep-link strategy, push provider e EAS workflow.

# POC-12 — Observabilidade End-to-End

| **Campo**               | **Definição**                                                                                                                    |
|-------------------------|----------------------------------------------------------------------------------------------------------------------------------|
| Decisão que desbloqueia | Provar que uma operação pode ser seguida da API até Queue/Worker/Provider, correlacionando Pino, OpenTelemetry e Sentry.         |
| Hipótese                | O stack aprovado produz evidência operacional suficiente para diagnosticar falhas reais sem logar dados sensíveis.               |
| Pré-requisitos          | POC-04; POC-05; pelo menos um provider sandbox (preferencialmente POC-07 ou 10); Sentry staging; collector/export path definido. |
| Responsável sugerido    | Platform/Backend Engineer                                                                                                        |
| Esforço relativo        | Médio-Alto                                                                                                                       |

## Experimentos / Casos de Teste

- Criar request autenticado com \`request_id/correlation_id\`.

- Persistir domain event/outbox e enfileirar job mantendo correlação.

- Worker processa job e chama provider sandbox mantendo trace/span context quando possível.

- Forçar erro no provider e confirmar issue Sentry com release/environment/context adequado.

- Confirmar logs JSON da API e Worker com IDs correlacionáveis.

- Confirmar trace HTTP → DB → queue boundary → worker → external call.

- Verificar redaction de Authorization/tokens/PII sensível.

- Criar um alerta técnico simples para erro/retry do cenário.

## Critérios de Aprovação

- Um engenheiro consegue partir de request ID e encontrar API, worker e provider call correspondentes.

- Sentry mostra release/environment e erro inesperado sem vazar secret.

- Trace possui spans significativos e não ruído excessivo.

- Logs estruturados permitem filtro por workspace/request/module.

- Failed job e retry aparecem no fluxo de observabilidade.

- Overhead do tracing/sampling permanece aceitável no ambiente de PoC.

## Condições de Falha / Reavaliação

- Correlação se perde na fila/worker.

- Logs contêm tokens/secrets.

- Sentry recebe erros de negócio esperados como exceptions em massa.

- Instrumentação exige código invasivo em cada função pequena.

- Telemetria não permite diagnosticar o cenário artificialmente falho.

## Evidências Obrigatórias

- Trace screenshot/export.

- Logs redacted API + Worker.

- Sentry issue de teste.

- Runbook curto: “do request ID ao provider failure”.

- Config de sampling e naming inicial.

## Saída / ADR

Criar \`ADR-OBSERVABILITY-STACK\` consolidando Pino, OpenTelemetry, Sentry, correlation strategy e data-redaction policy.

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><strong>Observação<br />
</strong>Este PoC começa cedo, mas só pode ser encerrado depois de atravessar pelo menos uma fila/worker e uma integração externa sandbox.</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

# 18. Matriz Consolidada dos 12 PoCs

| **ID** | **PoC**                   | **Depende de**       | **Gate principal** | **ADR / saída**       |
|--------|---------------------------|----------------------|--------------------|-----------------------|
| 01     | ORM / Query Layer         | 04                   | A / B              | ORM/query layer       |
| 02     | DB Connection / Pooling   | 01, 04               | A / B              | Pooling/runtime DB    |
| 03     | Design System em código   | 04                   | B                  | Styling/Design System |
| 04     | Monorepo pnpm + Turborepo | —                    | A / B              | Monorepo tooling      |
| 05     | BullMQ + Valkey           | 01,02,04             | B                  | Queue/Workers         |
| 06     | Realtime Broadcast        | 01,02,04             | B                  | Realtime strategy     |
| 07     | Stripe Connect            | 01,04                | A / B              | Payments              |
| 08     | QuickBooks                | 01,04                | A / B              | Accounting            |
| 09     | Twilio                    | 04                   | A / B              | SMS                   |
| 10     | Resend                    | 04                   | A / B              | Email                 |
| 11     | Expo Mobile               | 04 + API/Auth mínima | A / B              | Mobile                |
| 12     | Observability E2E         | 04,05 + provider     | B                  | Observability         |

---

> **Restauração — 2026-09-25.** As seções 19 a 23 estavam ausentes desde a importação: o
> documento terminava na matriz do §18. Foram reextraídas do `.docx` de origem
> `CrewCommand_Technical_Validation_PoC_Plan_v1.0.docx`, cujo SHA-256 registrado em
> `PROVENANCE.md` — `abdac805…3949` — foi reconferido e confere.

# 19. Regras de Ambiente e Dados dos PoCs

- Nunca utilizar banco, storage ou credentials Production.
- Stripe, QuickBooks, Twilio e Resend utilizam Test/Sandbox/ambiente controlado apropriado.
- Dados sintéticos devem representar múltiplos Workspaces, Locations e Roles quando o PoC tocar autorização/tenant scope.
- Segredos permanecem no secret store do ambiente; nenhuma evidência deve capturá-los.
- Os PoCs podem reutilizar Staging técnico, mas devem possuir nomes/IDs que permitam limpar artefatos após a validação.
- Experimentos destrutivos ficam isolados em Development/PoC environment quando necessário.

# 20. Registro de Decisão e ADR Handoff

Cada PoC aprovado gera um registro de decisão. O ADR deve ser curto, mas suficiente para impedir que a equipe rediscuta a escolha sem novos dados.

| Campo ADR | Obrigatório |
|---|---|
| Context | Problema e requisito do produto que motivou a decisão. |
| Options Considered | Opções realmente testadas/avaliadas. |
| Decision | Escolha final e versão/provider validado no kickoff. |
| Evidence | Links para PoC, testes, métricas, traces e screenshots. |
| Consequences | Trade-offs, limitações, custos e riscos. |
| Guardrails | Regras que a implementação deve respeitar. |
| **Revisit Trigger** | **Condição objetiva que justificaria reavaliar a decisão.** |

# 21. Definition of Done da Validação Técnica

- [ ] POC-01 a POC-12 possuem status final PASS ou PASS WITH CONDITIONS, ou alternativa substituta formalmente aprovada.
- [ ] Nenhum PoC crítico está em FAIL/BLOCKED sem owner e decisão de arquitetura.
- [ ] ADRs fundamentais foram criados e linkam as evidências dos PoCs.
- [ ] Development e Staging bootstrap estão definidos/reproduzíveis.
- [ ] Versões efetivamente validadas de runtime/providers estão registradas.
- [ ] Riscos e limitações descobertos foram convertidos em constraints/tasks do Implementation Plan.
- [ ] Custos/limites observados nos providers foram anotados para Capacity Planning.
- [ ] Nenhum segredo ou dado Production aparece nas evidências.

# 22. Handoff para o Implementation Plan

> **Ordem correta:** PoCs → ADRs → Implementation Plan → Feature Implementation. Um
> Implementation Plan preliminar pode ser esboçado durante a validação, mas a ordem e as
> dependências definitivas só devem ser congeladas depois dos resultados dos PoCs críticos.

## 22.1 O que o Implementation Plan receberá deste documento

- Stack e providers confirmados na prática.
- Decisões de ORM/query layer, pooling e styling finalmente fechadas.
- Dependências reais de infraestrutura e integração.
- Tasks de hardening descobertas nos PoCs.
- Riscos técnicos com mitigação explícita.
- ADRs como referência para desenvolvimento e code review.
- Critérios técnicos que podem virar acceptance criteria e QA gates.

## 22.2 Ordem recomendada para o Implementation Plan após os PoCs

> **Histórica e superseded.** Esta ordem é a da v1.0. O Implementation Plan v2.0 reorganizou o
> trabalho em treze Epics, acrescentou o Walking Skeleton como Epic 3 e removeu os módulos de
> Inbox, Tasks, Automations e Mobile do escopo da V1. Vale o plano vigente, não esta lista.

1. Foundation / Monorepo / CI / Environments
2. Identity / Workspace / Membership / Permissions
3. Data Architecture / Database / Storage / Audit
4. CRM + Sales foundations
5. Jobs + Services + Scheduling core
6. Field Operations / Daily Logs / Change Orders / Materials
7. Financial / Payments / Accounting integrations
8. Communications / Inbox / Tasks / Automations
9. Client Portal
10. Mobile hardening / Push / deep links
11. Reports / Super Admin / Entitlements
12. Security hardening / Performance / GA readiness

# 23. Princípio Final

> **Technical Validation Principle.** O produto não transforma preferência técnica em
> arquitetura aprovada sem evidência. Todo PoC crítico deve produzir uma decisão reproduzível,
> documentada e conectada ao risco real do produto. O objetivo é reduzir retrabalho antes da
> implementação, não criar protótipos que se tornem Production por acidente.
