**CREWCOMMAND**

**PRODUCT REQUIREMENTS DOCUMENT**

**PRD Oficial — v1.0**

Visão de produto, escopo funcional, regras de negócio e critérios da V1

| **Campo**                     | **Definição**                                                                                      |
|-------------------------------|----------------------------------------------------------------------------------------------------|
| Status                        | Reconstrução consolidada do PRD original — conteúdo de produto aprovado                            |
| Mercado primário              | Estados Unidos                                                                                     |
| Idioma interno                | Português (Brasil)                                                                                 |
| Idioma padrão do produto      | English (US), com suporte planejado a Spanish e Português (Brasil)                                 |
| Base de reconstrução          | Product Discovery aprovado + App Flow Oficial + Backend Domain Model + UI/UX Design Document + TRD |
| Próximos documentos na cadeia | App Flow → Backend Domain Model → UI/UX → TRD → Implementation Plan                                |

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><strong>Nota de integridade documental<br />
</strong>O arquivo binário original do PRD não está disponível na biblioteca atual do projeto. Esta versão recompõe o conteúdo aprovado a partir das decisões preservadas nos documentos oficiais posteriores e no histórico do projeto. Não é apresentada como cópia byte a byte do arquivo antigo.</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

# 1. Controle do Documento e Propósito

Este PRD define o que o CrewCommand deve construir na V1 e por quê. Ele consolida objetivos, usuários, escopo funcional, regras de negócio, comportamentos esperados, limites e critérios de sucesso. Decisões técnicas de stack, banco, cloud, filas, observabilidade e deploy pertencem ao TRD.

| **Item**                         | **Definição**                                                                                                                      |
|----------------------------------|------------------------------------------------------------------------------------------------------------------------------------|
| Produto                          | CrewCommand                                                                                                                        |
| Categoria                        | B2B SaaS para empresas de serviços com operação de campo                                                                           |
| Mercado inicial                  | Estados Unidos                                                                                                                     |
| Comprador principal              | Owner / proprietário da empresa                                                                                                    |
| Usuários internos                | Owner, Admin/Office, Salesperson, Project Manager, Field Worker/Technician, Accounting                                             |
| Usuário externo                  | Customer / Client Portal                                                                                                           |
| Referência competitiva principal | Jobber; referências adicionais: Housecall Pro, ServiceTitan, Workiz e FieldPulse                                                   |
| Princípio central                | Organizar a operação em torno do Job e deixar claro o que aconteceu, o que está pendente, quem é responsável e o que vem a seguir. |

## 1.1 Problema que o produto resolve

Reduzir tempo e esforço gastos para descobrir o status real de clientes, vendas, Jobs, serviços, equipes, cobranças e pendências.

Reduzir perda de receita causada por falta de follow-up, escopo não cobrado, conflitos de agenda, compras não registradas e cobranças desorganizadas.

Substituir informações espalhadas por uma visão operacional única e rastreável.

Dar ao Owner e aos gestores uma resposta rápida para a pergunta: “Em que pé está cada Job e o que precisa acontecer agora?”

## 1.2 Resultado esperado para o cliente

Uma empresa de serviços deve conseguir operar diariamente no CrewCommand com clareza, confiabilidade e baixa fricção, desde o primeiro Lead até a conclusão do Job, cobrança, pagamento e histórico do relacionamento.

# 2. Visão, Posicionamento e Princípios do Produto

## 2.1 Visão

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><strong>Visão de produto<br />
</strong>Um sistema para empresas de serviços gerenciarem clientes, equipe, agenda e pagamentos, mantendo o Job como centro da operação e conectando venda, execução e financeiro.</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

## 2.2 Segmentos-alvo

Cleaning

Landscaping

HVAC

Plumbing

Electrical

Pressure Washing

Pool Service

Handyman

Dumpster

Roofing

Gutters

Siding

Windows

Doors

Decks e outros serviços de campo com operação por cliente/propriedade/job.

## 2.3 Princípios de produto

Job-centric: o Job é a principal unidade operacional do trabalho vendido.

Clareza antes de complexidade: usuários devem entender rapidamente status, pendências, responsáveis e próximos passos.

Configuração sem rigidez excessiva: pipelines, templates, status, automações e permissões devem acomodar empresas diferentes sem fragmentar o produto.

Uma fonte de verdade operacional: histórico e estado devem permanecer rastreáveis dentro do CrewCommand.

Permissão por necessidade: usuários veem e fazem apenas o que seu papel e escopo permitem.

Mobile de campo é operacional, não uma cópia reduzida do desktop.

O Client Portal deve parecer uma extensão digital da empresa prestadora, não um painel administrativo do CrewCommand.

# 3. Usuários, Papéis e Escopos

| **Perfil**                | **Objetivo principal**                                               | **Regras de acesso relevantes**                                                                     |
|---------------------------|----------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------|
| Owner                     | Controlar toda a operação e configurações                            | Acesso amplo ao Workspace; governa permissões, integrações e configurações.                         |
| Admin / Office            | Operar CRM, Jobs, agenda, financeiro e suporte                       | Acesso definido pelo Owner; normalmente transversal.                                                |
| Salesperson               | Gerenciar Leads, follow-ups, Estimates e fechamento                  | Por padrão vê apenas Leads/Clientes atribuídos; pode criar Estimates conforme permissão.            |
| Project Manager           | Coordenar execução e capacidade                                      | Acompanha Jobs, Services, Crews, conflitos, materiais, aprovações e problemas.                      |
| Field Worker / Technician | Executar serviços no campo                                           | Foco em Today/Jobs; sem financeiro; registra checklist, Daily Log, fotos, problemas e solicitações. |
| Accounting                | Operar Invoices, Payments, AR, commissions e integrações financeiras | Somente dados financeiros conforme permissões.                                                      |
| Client                    | Aprovar, pagar, acompanhar e baixar documentos                       | Acesso restrito aos próprios dados/Properties/Jobs e somente conteúdo customer-visible.             |

## 3.1 Estrutura organizacional

Workspace representa a empresa cliente do CrewCommand.

Locations/filiais restringem ou agregam dados conforme o acesso do usuário.

Workspace e Location são contextos separados.

A opção All Locations consolida apenas Locations às quais o usuário tem acesso.

Usuários sem permissão financeira não devem ver o módulo Financial nem valores financeiros em outras telas.

# 4. Escopo Funcional da V1 — Visão Geral

| **Domínio**       | **Incluído na V1**                                                                                                      |
|-------------------|-------------------------------------------------------------------------------------------------------------------------|
| CRM               | Customer/contacts/properties, lifecycle, tags, sources, assignments, follow-ups, saved views.                           |
| Sales             | Sales Pipeline, Estimates, templates, approvals, versioning, signatures, payment terms, financing choice.               |
| Jobs              | Job Pipeline, Services, milestones, progress, PM, crews/teams, planned/actual dates, documents/photos.                  |
| Schedule          | Day/Week/Month/Agenda/List e visões por pessoa/crew/service/location; conflicts, recurring, blocks, Stair-Step.         |
| Field             | Today, Service Mobile, checklist, Daily Logs, photos, material extra, change order request, problem report, completion. |
| Financial         | Invoices, Payments, AR, Commissions, Financing, progress billing, payment schedules, refunds.                           |
| Purchases         | Material requests, purchases, POs, vendors/stores.                                                                      |
| Client Portal     | Approvals, progress configurável, documents, balances/invoices/payments, request service.                               |
| Communication     | Customer Inbox (SMS/Email/Portal), Internal Chat, Notifications.                                                        |
| Tasks & Approvals | Tasks, subtasks, recurring, approvals center, delegation.                                                               |
| Automation        | WHEN → IF → THEN, delayed actions, history, loop prevention, recipes.                                                   |
| Reports           | Operational, sales, financial and Project Progress Report.                                                              |

## 4.1 Fora do escopo explícito da V1

GPS tracking de colaboradores.

Route optimization automática.

Time Tracking / Clock In-Out.

Offline Mode completo.

Good / Better / Best Estimates.

Optional-item selection model em Estimates.

Split commission.

Customer Credit / carteira interna.

Dark Mode completo.

Vídeo como mídia operacional padrão; fotos e documentos primeiro.

# 5. CRM e Gestão de Clientes

## 5.1 CRM único

O produto utiliza um CRM único. Lead e Customer não são bases/telas totalmente separadas; o lifecycle/status/tags e Saved Views diferenciam Lead, Prospect, Customer e Past Customer.

## 5.2 Lead

Fontes V1: entrada manual pelo Salesperson, formulário do site da empresa e importação CSV/Excel.

Campos obrigatórios: first name, last name, phone, email, full address e service of interest.

Registrar lead source para relatórios de conversão e receita.

Atribuição manual de Lead na V1.

Follow-ups/tasks para Salesperson e Owner/Admin.

Salesperson vê, por padrão, apenas Leads/Clientes atribuídos a ele; Owner/Admin podem filtrar por Salesperson.

Registrar Lost Reason quando uma oportunidade é perdida.

## 5.3 Customer, Contacts e Properties

Um Customer pode possuir várias Properties.

Cada Property mantém seus próprios serviços, equipes, Estimates, fotos, histórico e Jobs.

Customer pode ter múltiplos Contacts, incluindo Primary, Billing, Property Contact e outros tipos configuráveis.

Tags customizáveis são permitidas.

Mudanças relevantes permanecem no Activity/History.

## 5.4 Saved Views e produtividade

Listas devem suportar busca, filtros, ordenação e Saved Views.

Usuários devem poder retornar a uma lista preservando filtros, ordenação e posição de rolagem.

Ações em massa são permitidas quando seguras e compatíveis com permissões.

# 6. Sales Pipeline e Estimates

## 6.1 Pipeline

Sales Pipeline é um Kanban separado do Job Pipeline.

Etapas podem ser criadas, renomeadas, reordenadas e removidas de acordo com regras de segurança.

Movimentação pode ocorrer por drag & drop e por ações explícitas.

Estágio Won pode ser atualizado automaticamente quando um Estimate é aprovado, conforme configuração.

## 6.2 Catálogo e templates

Service Catalog para padronizar serviços, unidades, preços e descrições.

Estimate Templates reutilizáveis.

Empresa e Salesperson com permissão podem criar templates.

Estimate aprovado pode ser convertido em template para usos futuros sem alterar o Estimate original.

## 6.3 Conteúdo do Estimate

Services, quantity, price, discount, tax, photos, observations, payment choices e e-signature.

Validade/expiração configurável.

Payment Terms baseados em datas/percentuais, como 50/50 ou 30/40/30.

Client pode escolher payment terms/payment method/financing dentre opções permitidas; Salesperson também pode selecionar quando autorizado.

Mobile/tablet do Salesperson permite criar, fotografar, pré-visualizar, apresentar e colher assinatura.

Presentation/Signature Mode esconde informações internas.

## 6.4 Versionamento e aprovação

Estimate enviado pode ganhar novas versões.

Cliente vê apenas a versão ativa; histórico completo é interno.

Atualização de Estimate já enviado notifica o cliente.

Estimate aprovado é imutável.

Mudanças posteriores de escopo usam Change Order.

Estimate pode ser duplicado como novo Estimate independente.

## 6.5 Efeitos da aprovação

Pode marcar lifecycle como Customer e Sales Pipeline como Won.

Pode criar automaticamente um Job ou permitir “Add Services to Existing Job”.

Copia serviços, valores, fotos e documentos relevantes.

Mantém Salesperson responsável e calcula comissão conforme regra.

Pode criar saldo de depósito e notificar Admin.

Automação é habilitada por padrão, porém configurável pela empresa.

# 7. Jobs e Services

## 7.1 Job como entidade operacional principal

Um Job representa o trabalho/projeto vendido. Pode conter múltiplos Services/Work Items, cada um com execução, responsáveis e histórico próprios.

## 7.2 Service

Status próprio.

Crew/Team próprio.

Planned Start/Completion e Actual Start/Completion.

Checklist.

Photos, Materials, Documents e Daily Logs.

Usuários responsáveis.

Dependências com warning, sem hard-block por padrão.

## 7.3 Status, progresso e milestones

Job status e Service status são configuráveis.

Empresa pode criar/reordenar/renomear/remover stages conforme regras.

Mudança de status pode ser manual ou automática, configurável.

Progress % pode ser manual ou automático.

Templates podem definir pesos e comportamento do progresso.

Milestones podem vir de templates ou ser adicionados manualmente.

## 7.4 Job Templates

Templates podem predefinir Services, ordem, duração/capacidade esperada, checklists, milestones e regras de progresso.

Template não deve eliminar a possibilidade de ajustes específicos no Job.

## 7.5 Project Manager

Cada Job pode ter um Project Manager responsável pela coordenação operacional e aprovações compatíveis com seu papel.

# 8. Crews, Teams e Production Capacity

## 8.1 Modelo de equipe

Empresa pode operar com Crew único, sem Team, ou com Teams compostos por várias Crews.

Cada Service pode receber Crew/Team diferente conforme disponibilidade e natureza do trabalho.

Suportar Primary Crew + crews/workers adicionais.

Subcontractors/sub-crews usam o mesmo modelo de agenda/capacidade e recebem marcador externo.

## 8.2 Capacity

Cada Crew pode ter capacidade por unidade/dia, ex.: 12 SQ/day, 8 SQ/day, rooms/day, linear ft/day ou units/day.

Quantidade do Service e capacidade da Crew estimam duração em dias.

Quando várias Crews compõem o Team selecionado, a capacidade é a soma das Crews ativas selecionadas.

Override manual de duração/capacidade requer permissão e motivo auditável.

# 9. Schedule, Conflitos e “Escadinha”

## 9.1 Visões do calendário

Week é a visão padrão.

Também suportar Day, Month, Agenda/List, Employee, Crew/Team, Salesperson, Service e Location.

Cores configuráveis por crew/employee/service/status/location.

Drag & drop altera data; resize altera duração; drag pode mover atribuição de Crew.

Duplicate scheduling não entra na V1.

## 9.2 Conflito de agenda

Se Crew/Team já estiver ocupado, o segundo agendamento não é salvo imediatamente.

Mostrar conflito exato, Job, horários e recurso afetado.

Opções: Schedule Anyway, Choose Another Date, Choose Another Crew/Team.

Schedule Anyway exige segunda confirmação.

Conflitos nunca ficam ocultos, mesmo para usuários com permissão de override.

## 9.3 Stair-Step / Escadinha

Ao alterar data/duração de um Service, inclusive por troca de Crew ou mudança de quantidade, perguntar se Services futuros ainda não concluídos também devem deslocar.

Preservar por padrão os intervalos relativos entre Services.

Mostrar Before/After antes de confirmar.

Detectar todos os novos conflitos gerados.

Permitir Undo da operação.

## 9.4 Recorrência e bloqueios

Recorrências: weekly, every 2 weeks, monthly e custom intervals/weekdays.

Editar one occurrence / this and future / all.

Holidays e blocks geram warning e pedido de nova data.

Bloqueios podem ser full day, time range, multi-day, recurring e globais ou específicos por Location.

# 10. Field Mobile, Daily Logs e Conclusão

## 10.1 Navegação do Field Worker

Bottom nav: Today | Jobs | Chat | Notifications | More.

Today é a tela inicial.

Cards mostram horário, Service, Customer, Property e Status, sem valores financeiros.

Service Mobile usa seções/cards, não uma grande sequência de tabs horizontais.

Quick actions: Call, Message, Map.

Operational actions: Daily Log, Add Photo, Material Extra, Change Order, Report Problem.

Complete Service é ação separada/sticky.

Controles touch-first com áreas de toque grandes e operação possível com uma mão.

## 10.2 Daily Log

Um Daily Log por Service por dia; se já existir, abrir o existente.

Preencher automaticamente data, Service, Crew, Job, Property e usuário.

Campos: workers, progress, work completed, issues, materials, photos, notes, next steps, Change Orders e assinatura opcional.

Empresa pode tornar campos obrigatórios.

Upload múltiplo de imagens, compressão, thumbnails e retry individual de falhas.

Após Service DONE, Daily Log fica read-only; apenas novas fotos podem ser adicionadas.

Reabrir DONE exige Manager/Admin + motivo/histórico.

Client Portal recebe somente conteúdo customer-safe se a empresa habilitar visibilidade.

## 10.3 Completion

Antes de concluir, validar checklist, Daily Log, Change Orders/Material Requests pendentes e regras configuradas.

Warnings podem bloquear ou apenas alertar conforme configuração da empresa.

Assinatura final do cliente é configurável, podendo ser desenhada ou digitada.

Se cliente não estiver presente, gerar pendência de assinatura quando aplicável.

# 11. Change Orders, Materiais, Compras e Problemas

## 11.1 Change Order

Field Worker pode solicitar Change Order sem definir preço.

Solicitação contém Service, descrição, motivo, fotos/documentos.

Salesperson responsável e Admins apropriados são notificados.

Sales/Admin revisam descrição final, linhas, preço, tax/terms.

Preview obrigatório antes de enviar ao cliente.

Um Change Order pode conter múltiplas linhas e um Job pode ter vários Change Orders.

Cliente vê descrição, fotos e valor; pode Accept/Reject e assinar.

Rejeição exige motivo.

Aprovação bloqueia conteúdo, registra assinatura, atualiza Job value e notifica Sales/Admin/PM.

## 11.2 Material Extra e Purchases

Worker solicita material, quantity, reason, photo e notes.

Project Manager aprova.

Compra registra vendor/store, data, PO number, amount, purchased by, paid/unpaid, receipt e notes.

Uma solicitação pode gerar múltiplas compras.

Purchase pode existir sem Material Request prévio se o usuário tiver permissão.

Vendors/Stores têm tela própria com histórico, total spend, Jobs e contacts.

## 11.3 Report Problem

Ação rápida separada de Change Order e Material Request.

Categorias: damage, client unavailable, weather, measurement, missing material, access, installation e other.

# 12. Financial, Billing e Payments

## 12.1 Estrutura

Tabs: Invoices | Payments | Accounts Receivable | Commissions | Financing.

Pequeno Financial Overview apenas para usuários permitidos.

Criação de Invoice pelo Job, Financial e fluxo de conclusão.

Progress Billing permite Invoice antes de Job Completed.

## 12.2 Invoice

Usuário escolhe Services, Change Orders ou percentuais cobrados.

Labels: Deposit / Progress / Final.

Review/Preview + Save Draft antes de enviar ao provider.

Armazenar provider, external invoice ID/number, amount, due date, status, link e sync status.

Status sincronizado por API/Webhook quando o provider permitir.

Sync Failed exibe Retry e motivo compreensível.

Múltiplos Invoices por Job.

Comparar total faturado com Contract Value + Approved Change Orders.

Overbilling bloqueado por padrão; exceção de alta permissão exige justificativa.

## 12.3 Payments

Payment sempre alocado a Invoice específica.

Deposit e partial payments reduzem saldos.

Métodos: Card, ACH, Cash, Check, PayPal, Financing, Zelle, Wire e custom.

Card/ACH/PayPal usam provider; CrewCommand não armazena dados sensíveis de cartão/banco.

Record Payment manual é permission-specific e gera receipt.

Overpayment é bloqueado até existir Customer Credit, que está fora do escopo.

Refund é transação separada; pagamento original permanece no histórico.

Financial timeline reúne eventos relevantes.

# 13. Accounts Receivable, Financing e Commissions

## 13.1 Accounts Receivable

Aging: Current / 1–30 / 31–60 / 61–90 / 90+.

Campos: Customer, Invoice, Job, Salesperson, due date, balance.

Filtros por PM e Location quando aplicável.

Payment reminders automáticos/configuráveis.

Pause Reminders por Invoice/Customer quando necessário.

## 13.2 Financing

Providers/banks configuráveis.

Status: Applied, Pending, Approved, Declined, Funded.

Documentos e histórico vinculados.

Valor funded pode ser refletido como payment/revenue conforme configuração.

Approved amount pode diferir do contract value.

## 13.3 Commissions

Modelos: % sale, % gross profit, fixed, % service ou combinação.

Triggers: Estimate Approved, Deposit Received, Job Completed, Paid in Full.

Status: Projected, Earned, Approved, Paid.

Paid fica congelado; valores em aberto podem recalcular conforme regras.

Salesperson vê apenas própria comissão.

Sem split commission na V1.

Adjustments exigem reason + audit.

# 14. Client Portal

## 14.1 Acesso e branding

Login por email + password.

Portal com branding da empresa prestadora; estrutura base do CrewCommand.

Mobile-first.

Powered by CrewCommand discreto e futuramente configurável por plano.

## 14.2 Home

Priorizar approvals pendentes, next service, active projects, open balances/invoices e recent documents.

Cliente vê todas as próprias Properties.

Pode solicitar nova Property, mas não criar livremente.

Pode Request Service/Estimate; isso cria request/Lead interno, não Job automático.

## 14.3 Project/Job visibility

Progress do projeto oculto por padrão e configurável pela empresa.

Quando habilitado: status, %, services, schedule e PM.

Somente fotos/documentos customer-visible.

Customer upload não vira documento oficial automaticamente.

## 14.4 Estimate e Change Order no Portal

Estimate em formato documental com services/photos/pricing/terms.

Approve/Reject, seleção de terms/payment/financing e assinatura draw/type.

Rejeição exige motivo.

Falha de pagamento após aprovação não desfaz aprovação do Estimate; depósito fica failed/pending.

Change Order usa fluxo similar em versão menor.

## 14.5 Portal Financial

Open balance, next payment, invoices open/paid/overdue, payment history e financing.

Pay Now quando provider online estiver habilitado.

Cliente pode editar phone/password/basic profile; troca de email exige verificação.

Properties não são livremente editáveis pelo cliente.

# 15. Inbox, Internal Chat e Notifications

## 15.1 Inbox

Uma área de Inbox, separando Customer Communications e Internal Chat.

Canais de cliente: SMS, Email e Portal.

Filtros, busca, assignment/transfer e archive.

Permissões restringem visibilidade.

Mensagens e attachments persistentes.

## 15.2 Internal Chat

DMs, Groups, Job Chats e Crew Chats.

Job Chat criado automaticamente.

Images, audio, documents, @mention, reply, pinned, read receipts e reactions.

Edit mostra Edited + history.

Delete é soft delete + audit.

Mute e Seen By.

## 15.3 Notifications

Canais: In-App, Email, SMS e Push.

Preferências por usuário, exceto notificações obrigatórias.

Deep Links para entidade/aba relacionada.

Agrupamento para evitar spam.

Quiet Hours para notificações não críticas.

# 16. Tasks, Approvals e Automations

## 16.1 Tasks

Views: My / All / Overdue / Completed.

Pode vincular a Lead, Client, Property, Estimate, Job ou nenhuma entidade.

Um primary assignee + watchers.

Subtasks/checklist, recurring, @mentions, attachments, templates, bulk actions e reminders.

## 16.2 Approvals Center

Centraliza Change Orders, Material Requests e Commission Adjustments.

Contagens visíveis no Dashboard/Sidebar.

Aprovação simples em drawer; casos complexos abrem detalhe.

Rejeição exige motivo.

Tudo auditável.

Suportar delegação temporária.

## 16.3 Automation Engine

Modelo WHEN → IF → THEN.

Triggers em entidades principais e eventos de tempo.

Condições AND/OR.

Ações: create task, send message, notify, assign, change status, add tag.

Delay/Wait e send windows.

Loop prevention obrigatório.

Enabled/Disabled, Test with sample data e execution history.

Recipes pré-configuradas.

Mensagens/tarefas criadas por automação mostram origem.

Sem arbitrary JavaScript para usuários.

Ações financeiras sensíveis não devem virar automação genérica sem controles específicos.

# 17. Busca, Navegação e Experiência Global

## 17.1 Shell

Sidebar + Topbar.

Sidebar: Dashboard, CRM, Sales, Jobs, Schedule, Tasks, Inbox, Team, Purchases, Financial, Reports; Settings e Help próximos ao rodapé.

Topbar: Workspace, Location, Global Search, + New, Notifications, Help, Profile.

Breadcrumbs somente em páginas profundas.

Sticky headers/tabs quando úteis.

Deep links sempre revalidam permissão.

## 17.2 Global Search

Popup com Ctrl/Cmd-K.

Resultados agrupados por entidade.

Recent Items antes da busca quando útil.

View All abre página completa com filtros.

Busca respeita Workspace/Location/Role/permissões.

## 17.3 + New

Mostra apenas ações permitidas ao usuário.

Ações contextuais aparecem primeiro quando aplicável.

Não oferecer ação que depois falhar por permissão se a permissão puder ser conhecida previamente.

# 18. Reporting e Visibilidade Operacional

## 18.1 Dashboard / Command Center

Priorizar banners/alerts, Needs Attention/Command Center, KPIs, agenda/today, sales, finance, tasks e recent activity.

Não incluir widget separado de Crew Capacity no Dashboard principal da V1.

Valores financeiros só aparecem para usuários autorizados.

## 18.2 Project Progress Report

Compila Service dates, Daily Logs, before/during/after photos, Change Orders, observations e conclusion.

Printable/exportable.

Conteúdo do cliente deve respeitar customer-visible flags.

## 18.3 Relatórios

Sales conversion por source e salesperson.

Jobs por status/progress/delay.

Operational throughput e schedule exceptions.

AR/overdue/payment performance.

Commissions.

Purchases/vendor spend.

Relatórios devem respeitar Workspace, Location e permissões.

# 19. Regras de Integridade e Auditoria de Produto

Estimate aprovado é imutável; mudança de escopo ocorre por Change Order.

Daily Log de Service DONE fica bloqueado para edição retrospectiva, salvo fluxo de reopen com permissão/motivo.

Schedule conflict nunca é escondido.

Overbilling é bloqueado por padrão.

Financial values são totalmente ocultados para usuários sem permissão financeira.

Deep links e notificações não burlam autorização.

Override sensível exige permissão e, quando aplicável, motivo auditável.

Delete sensível usa soft delete/history em vez de apagar rastreabilidade.

Automations precisam de execution history e proteção contra loops.

Integrações externas e pagamentos são tratados como estados explícitos, nunca como sucesso presumido.

# 20. Critérios de Sucesso da V1

| **Dimensão**        | **Critério de sucesso**                                                                                                                                  |
|---------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------|
| Uso diário          | O produto é simples o suficiente para Owner, Office, Sales, PM e Field usarem no trabalho real sem depender de planilhas paralelas para o fluxo central. |
| Clareza operacional | É possível entender rapidamente o estado de cada Job, seus Services, responsáveis, pendências e próximos passos.                                         |
| Confiabilidade      | Funções criadas operam de forma consistente, sem bugs críticos que bloqueiem o trabalho principal.                                                       |
| Rastreabilidade     | Ações importantes, mudanças de estado, aprovações e eventos financeiros deixam histórico suficiente para investigação.                                   |
| Financeiro          | Invoices, Payments, AR e integrações não produzem saldos silenciosamente inconsistentes.                                                                 |
| Campo               | Field Worker consegue executar as ações essenciais pelo mobile com baixa fricção.                                                                        |
| Cliente             | Cliente consegue aprovar, pagar, acompanhar e acessar documentos sem entender a estrutura interna do sistema.                                            |
| Configuração        | Empresa consegue adaptar stages, templates, permissions e automations sem quebrar os fluxos centrais.                                                    |

## 20.1 Indicadores a acompanhar após Alpha/Beta

Tempo para localizar estado/pendência de um Job.

Lead-to-Estimate e Estimate-to-Won conversion.

Tempo entre aprovação e criação/agendamento do Job.

Schedule conflicts e overrides.

Percentual de Services concluídos com Daily Log/checklist conforme regra.

Change Orders aprovados/rejeitados e receita adicional capturada.

Invoices overdue e aging.

Payment success/failure e tempo de reconciliação.

Uso do Client Portal e approvals/pagamentos por portal.

Automation execution success/failure.

# 21. Dependências Documentais e Próxima Etapa

Este PRD responde “o que construir e por quê”. A cadeia de definição do CrewCommand evolui a partir dele para documentos que detalham fluxo, dados, experiência, tecnologia e execução.

| **Documento**         | **Responsabilidade**                                |
|-----------------------|-----------------------------------------------------|
| PRD                   | O que construir e por quê.                          |
| App Flow              | Como o usuário percorre o produto.                  |
| Backend Domain Model  | Estrutura lógica dos dados e relacionamentos.       |
| UI/UX Design Document | Como a experiência é apresentada e operada.         |
| TRD                   | Como tecnicamente será implementado.                |
| Implementation Plan   | Como o trabalho será dividido, ordenado e entregue. |

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><strong>Princípio final<br />
</strong>O CrewCommand deve transformar uma operação complexa em uma rotina clara, coordenada e rastreável — sem esconder exceções importantes e sem obrigar o usuário a reconstruir o contexto manualmente.</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

Documento consolidado para continuidade do projeto. Conteúdo derivado das decisões de produto aprovadas e preservadas nos documentos oficiais posteriores do CrewCommand.
