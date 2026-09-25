**CrewCommand**

BACKEND SCHEMA / DOMAIN MODEL

Modelo lógico de dados e domínios do CrewCommand — base para ERD, TRD e implementação

| **Versão**              | 1.0                                              |
|-------------------------|--------------------------------------------------|
| **Status**              | Oficial                                          |
| **Base**                | PRD + Product Discovery + App Flow (Blocos 1–10) |
| **Idioma do documento** | Português (Brasil)                               |

# 1. Objetivo e nível deste modelo

Este documento define o modelo lógico do CrewCommand a partir do PRD e do App Flow Oficial. Ele descreve entidades, responsabilidades, relacionamentos, chaves lógicas, estados e regras de integridade. Não escolhe ainda PostgreSQL, Supabase, ORM, framework ou arquitetura cloud; essas decisões pertencem ao TRD.

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>Decisão de modelagem</strong></p>
<p>O CRM continua único na experiência do usuário. No backend, porém, separamos “Cliente/Conta”, “Pessoa de contato” e “Oportunidade de venda” para suportar múltiplas Properties e múltiplas oportunidades simultâneas sem duplicar o cliente. Essa é uma decisão de modelagem derivada do App Flow, não uma nova tela.</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

<img src="media/image1.png" style="width:6.55in;height:7.25637in" />

Contextos de domínio e dependências principais.

<img src="media/image2.png" style="width:6.55in;height:0.60542in" />

ERD conceitual do núcleo Lead/Estimate/Project/Service/Invoice.

# 2. Convenções transversais

- Todas as entidades de tenant carregam workspace_id direta ou indiretamente e jamais podem cruzar Workspaces.

- Entidades sensíveis por Filial carregam location_id quando o contexto exigir escopo operacional.

- IDs lógicos devem ser globais e não sequenciais como chave primária interna; números humanos (EST-001, JOB-001 etc.) são campos separados por Workspace.

- Campos comuns recomendados: id, workspace_id, created_at, created_by, updated_at, updated_by, deleted_at quando soft delete for aplicável.

- Valores monetários devem usar unidade mínima/decimal preciso e guardar currency_code.

- Datas/horas são persistidas em UTC e apresentadas no timezone da Filial/usuário; eventos de negócio guardam timezone de origem quando relevante.

- Documentos assinados, Estimates aprovados, Change Orders aprovados e transações financeiras são imutáveis ou versionados; não sofrem hard delete comum.

- AuditLog registra mudanças administrativas/estruturais; ActivityEvent registra a timeline legível pelo usuário. São conceitos separados.

- Arquivos físicos são representados por MediaAsset/Document e vinculados às entidades; o banco não armazena binários.

- Custom Fields usam definição + valores tipados por entidade, sempre limitados ao Workspace.

- Tags são entidades reutilizáveis com tabela de associação por tipo de registro.

- Entidades de demonstração precisam de flag/conjunto identificável para remoção segura sem atingir dados reais.

# A. Tenancy, Identidade e Acesso

| **Entidade** | **Responsabilidade**                                                          | **Campos-chave (lógicos)**                                                        | **Relacionamentos**                                                         | **Regras**                                                   |
|--------------|-------------------------------------------------------------------------------|-----------------------------------------------------------------------------------|-----------------------------------------------------------------------------|--------------------------------------------------------------|
| Workspace    | Empresa/tenant que assina o CrewCommand.                                      | id, name, status, default_language, default_currency, primary_owner_membership_id | 1:N Locations, Memberships, Clients, Plans/Subscription, integrações.       | Boundary obrigatório de isolamento.                          |
| Location     | Filial operacional.                                                           | id, workspace_id, name, address fields, timezone, working_hours                   | N:1 Workspace; N:M Membership via UserLocation; 1:N calendar/holiday scope. | Filtros globais e calendários respeitam Location.            |
| User         | Identidade global de pessoa interna que pode participar de vários Workspaces. | id, email, name, photo, auth_provider, status                                     | N:M Workspace via Membership.                                               | Suspender em um Workspace não bloqueia outros.               |
| Membership   | Vínculo User ↔ Workspace.                                                     | id, workspace_id, user_id, status, primary_role_id                                | N:1 Workspace; N:1 User; N:M Roles; N:M Locations.                          | Primary Owner é propriedade/flag única no Workspace.         |
| Role         | Role padrão ou customizado por Workspace.                                     | id, workspace_id nullable for system role, name, is_system                        | N:M Permission; N:M Membership.                                             | Owner, Admin, Office, Sales, PM, Field, Accounting + custom. |
| Permission   | Ação granular autorizável.                                                    | id, module, action, scope                                                         | N:M Role.                                                                   | Ex.: VIEW/CREATE/EDIT/DELETE/FINANCIAL/ADMIN.                |
| Invite       | Convite pendente para usuário.                                                | id, workspace_id, email, role_id, location_ids, token, expires_at, status         | Converte em Membership após aceite.                                         | Resend/Cancel.                                               |
| UserLocation | Escopo de Location do membro.                                                 | membership_id, location_id                                                        | N:1 Membership; N:1 Location.                                               | Controla dados visíveis por filial.                          |

# B. Planos, Assinatura e Plataforma

| **Entidade**   | **Responsabilidade**                     | **Campos-chave (lógicos)**                                    | **Relacionamentos**                       | **Regras**                                              |
|----------------|------------------------------------------|---------------------------------------------------------------|-------------------------------------------|---------------------------------------------------------|
| Plan           | Plano comercial do CrewCommand.          | id, code, name, billing_cycle support, active                 | 1:N PlanLimit; 1:N Subscription.          | Starter/Growth/Pro/Enterprise.                          |
| PlanLimit      | Limites e features por plano.            | plan_id, feature_key, limit_value, enabled                    | N:1 Plan.                                 | Users, Locations, Storage, SMS, Automations, API etc.   |
| Subscription   | Assinatura de um Workspace.              | id, workspace_id, plan_id, status, trial_start/end, grace_end | N:1 Workspace/Plan; 1:N billing events.   | Trial → Active; Failed → Grace → Read-only → Suspended. |
| UsageMeter     | Consumo por Workspace/feature.           | workspace_id, feature_key, period, quantity                   | N:1 Workspace.                            | Exibe 5/5 users, storage, SMS.                          |
| Coupon         | Cupom promocional.                       | id, code, type, value, valid_from/to                          | Aplicável a Subscription.                 | Futuro/administrável.                                   |
| FeatureFlag    | Liberação gradual.                       | id, feature_key, enabled, targeting config                    | Pode mirar Workspace/Plan/beta group.     | Não substitui Permission.                               |
| SuperAdminUser | Identidade administrativa da plataforma. | id, email, role, status                                       | Acessa plataforma, não tenant por padrão. | Support Access separado e auditado.                     |

# C. CRM, Clientes e Propriedades

| **Entidade**          | **Responsabilidade**                                              | **Campos-chave (lógicos)**                                                                                    | **Relacionamentos**                                      | **Regras**                                     |
|-----------------------|-------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------|----------------------------------------------------------|------------------------------------------------|
| ClientAccount         | Registro CRM único que muda de Lead para Customer sem duplicação. | id, workspace_id, lifecycle_status, company_name, primary_contact_id, lead_source_id, assigned_salesperson_id | 1:N ContactPerson, Property, SalesOpportunity; N:M Tags. | Pode representar pessoa ou empresa.            |
| ContactPerson         | Pessoa ligada ao ClientAccount.                                   | id, client_id, first_name, last_name, phone, email, role_type, is_primary                                     | N:1 Client; N:M Properties opcional.                     | Primary/Billing/Property/Other.                |
| Property              | Endereço/propriedade do cliente.                                  | id, client_id, address fields, property_type, name, is_primary, notes                                         | N:1 Client; 1:N Opportunity, Estimate, Project.          | Primeiro endereço cria Property.               |
| PropertyContact       | Vínculo de contato a Property.                                    | property_id, contact_person_id, relation_type                                                                 | N:M Property ↔ ContactPerson.                            | Permite tenant/property manager específicos.   |
| LeadSource            | Origem configurável do lead.                                      | id, workspace_id, name, active                                                                                | 1:N Client/Opportunity.                                  | Google, Referral etc.                          |
| Tag                   | Tag configurável.                                                 | id, workspace_id, name, group, archived                                                                       | N:M por associações.                                     | Usada em CRM e automações.                     |
| EntityTag             | Associação polimórfica controlada.                                | workspace_id, tag_id, entity_type, entity_id                                                                  | N:1 Tag.                                                 | Aplicar apenas a entidades autorizadas.        |
| Note                  | Nota permanente em entidade.                                      | id, workspace_id, entity_type, entity_id, body, pinned, author_id                                             | N:1 entidade lógica.                                     | Diferente de Chat; suporta anexos/mentions.    |
| CustomFieldDefinition | Definição de campo customizado.                                   | id, workspace_id, entity_type, name, field_type, required, options                                            | 1:N CustomFieldValue.                                    | Client/Property/Lead/Estimate/Project/Service. |
| CustomFieldValue      | Valor de custom field.                                            | definition_id, entity_id, typed_value                                                                         | N:1 definition.                                          | Validação pelo tipo.                           |

# D. Vendas, Pipeline e Orçamentos

| **Entidade**        | **Responsabilidade**                                  | **Campos-chave (lógicos)**                                                                                                               | **Relacionamentos**                                         | **Regras**                                                          |
|---------------------|-------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------|---------------------------------------------------------------------|
| SalesPipeline       | Pipeline comercial do Workspace.                      | id, workspace_id, name, active                                                                                                           | 1:N SalesStage.                                             | Etapas reordenáveis.                                                |
| SalesStage          | Etapa comercial.                                      | id, pipeline_id, name, order, is_won, is_lost                                                                                            | 1:N SalesOpportunity.                                       | Mover para Lost exige motivo.                                       |
| SalesOpportunity    | Oportunidade comercial vinculada a Client + Property. | id, workspace_id, client_id, property_id, stage_id, salesperson_id, service_interest, potential_value, lead_source_id, next_followup_at  | 1:N Estimates, Appointments, Tasks.                         | Permite várias oportunidades para o mesmo cliente sem duplicar CRM. |
| SalesAppointment    | Compromisso de venda.                                 | id, opportunity_id, salesperson_id, start_at, duration, status, contract_closed_at, notes                                                | N:1 Opportunity.                                            | Scheduled/Confirmed/Completed/Cancelled/No Show.                    |
| Estimate            | Documento comercial lógico.                           | id, workspace_id, opportunity_id, property_id, estimate_number, status, active_version_id, expires_at, total, deposit_required, currency | 1:N EstimateVersion; N:M Project via ProjectEstimateSource. | Approved fica Locked.                                               |
| EstimateVersion     | Snapshot versionado antes da aprovação.               | id, estimate_id, version_no, subtotal, discount, tax, total, terms, customer_notes, internal_notes                                       | 1:N EstimateLineItem, recipients, media.                    | Cliente vê somente versão ativa.                                    |
| EstimateLineItem    | Serviço/linha do orçamento.                           | id, estimate_version_id, service_catalog_id nullable, name, description, qty, unit, unit_price, discount, tax, total                     | N:1 EstimateVersion; 1:N media.                             | Pode ser custom e opcionalmente salvo no catálogo.                  |
| EstimateRecipient   | Contato destinatário.                                 | estimate_id/version_id, contact_person_id, channel flags                                                                                 | N:1 Estimate.                                               | Select All permitido.                                               |
| EstimateViewEvent   | Abertura pelo cliente.                                | id, estimate_id, contact_id, viewed_at, metadata                                                                                         | N:1 Estimate.                                               | UI resume first/last, histórico preserva todos.                     |
| EstimateSignature   | Assinatura de aprovação.                              | id, estimate_id, signer_name, signature_type, signature_asset_id, signed_at, ip, device_metadata                                         | 1:1 Estimate aprovado.                                      | Desenhada ou nome digitado.                                         |
| EstimateTemplate    | Template de empresa/vendedor.                         | id, workspace_id, owner_user_id nullable, name, terms, structure config                                                                  | 1:N template lines.                                         | Sem fotos padrão.                                                   |
| PaymentTermTemplate | Modelo de pagamento comercial.                        | id, workspace_id, name, installment percentages/dates config                                                                             | Usado por Estimate/Job.                                     | Datas e percentuais.                                                |

# E. Projetos (Jobs) e Serviços

| **Entidade**          | **Responsabilidade**                  | **Campos-chave (lógicos)**                                                                                                                         | **Relacionamentos**                                              | **Regras**                                     |
|-----------------------|---------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------|------------------------------------------------|
| Project               | Projeto/Job principal pós-venda.      | id, workspace_id, client_id, property_id, project_number, status_id, salesperson_id, project_manager_id, progress_percent, archived_at             | 1:N ProjectService, Milestone, ChangeOrder, Invoice, Task links. | Pode agregar serviços de múltiplos Estimates.  |
| ProjectEstimateSource | Vínculo de origem Estimate ↔ Project. | project_id, estimate_id                                                                                                                            | N:M Project ↔ Estimate.                                          | Suporta Add Services to Existing Job.          |
| ProjectStatus         | Status configurável.                  | id, workspace_id, name, order, category                                                                                                            | 1:N Project.                                                     | Manual/automação configurável.                 |
| ProjectService        | Unidade executável dentro do Job.     | id, project_id, source_estimate_line_id, service_catalog_id, name, status_id, quantity, production_unit_id, progress_percent, planned/actual dates | N:1 Project; 1:N ScheduleEvent, DailyLog, MaterialRequest.       | Quantidade editável com permissão e recálculo. |
| ServiceStatus         | Status configurável do Service.       | id, workspace_id, name, order, category                                                                                                            | 1:N ProjectService.                                              | Field role pode alterar subset configurável.   |
| ServiceCatalogItem    | Serviço reutilizável.                 | id, workspace_id, category, name, default_unit_id, default_status_id, active                                                                       | Usado em Estimate/Service templates.                             | Config avançada posterior ao onboarding.       |
| JobTemplate           | Template de Project.                  | id, workspace_id, name, service/milestone/checklist config                                                                                         | Instancia Project structure.                                     | Reutilizável.                                  |
| Milestone             | Marco do Job.                         | id, project_id, name, status, planned_date, completed_date, responsible_membership_id, notes                                                       | N:1 Project.                                                     | Pode vir de template.                          |
| ChecklistTemplate     | Modelo de checklist.                  | id, workspace_id, service_catalog_id nullable, name                                                                                                | 1:N ChecklistTemplateItem.                                       | Imprimível.                                    |
| ServiceChecklistItem  | Instância de item do checklist.       | id, project_service_id, template_item_id, label, status, weight, requires_photo, requires_comment                                                  | N:1 ProjectService.                                              | Pode alimentar progresso automático.           |
| ProjectFavorite       | Projeto fixado por usuário.           | membership_id, project_id                                                                                                                          | N:M.                                                             | Preferência pessoal.                           |

# F. Agenda, Crews, Equipes e Campo

| **Entidade**          | **Responsabilidade**                   | **Campos-chave (lógicos)**                                                                                | **Relacionamentos**                     | **Regras**                                  |
|-----------------------|----------------------------------------|-----------------------------------------------------------------------------------------------------------|-----------------------------------------|---------------------------------------------|
| Crew                  | Grupo de campo operacional.            | id, workspace_id, location_id, name, type, active                                                         | N:M Team; N:M User; 1:N capacity.       | Pode ser interno ou subcontractor crew.     |
| Team                  | Equipe composta por Crews.             | id, workspace_id, location_id, name                                                                       | N:M Crew.                               | Usuário escolhe Crews efetivas por Service. |
| TeamCrew              | Associação Team ↔ Crew.                | team_id, crew_id                                                                                          | N:M.                                    | Crew pode estar em mais de uma Team.        |
| CrewMember            | Associação Crew ↔ Membership.          | crew_id, membership_id                                                                                    | N:M.                                    | Sem necessidade de Crew Leader obrigatório. |
| ProductionUnit        | Unidade de produção.                   | id, workspace_id, code, label                                                                             | 1:N ProductionCapacity.                 | SQ, Units, Rooms, Linear Feet.              |
| ProductionCapacity    | Capacidade da Crew por unidade.        | id, crew_id, service_catalog_id nullable, unit_id, quantity_per_day                                       | N:1 Crew.                               | Base de cálculo automático.                 |
| ServiceAssignment     | Recursos atribuídos ao ProjectService. | id, project_service_id, crew_id nullable, team_id nullable, membership_id nullable, role_type, is_primary | N:1 ProjectService.                     | Primary + adicionais.                       |
| ScheduleEvent         | Segmento agendado do Service.          | id, project_service_id, location_id, start_at, end_at, recurrence_id nullable, status                     | N:1 Service; links Assignment snapshot. | Drag/resize; conflitos.                     |
| RecurrenceRule        | Regra de recorrência.                  | id, workspace_id, rrule/config, timezone                                                                  | 1:N ScheduleEvent/series.               | Editar one/future/all.                      |
| AvailabilityBlock     | Bloqueio de recurso.                   | id, resource_type, resource_id, start_at, end_at, recurring_rule_id, reason                               | Crew/User/Team.                         | Dia/intervalo/múltiplos dias.               |
| Holiday               | Feriado global/Location.               | id, workspace_id, location_id nullable, date, name                                                        | Afeta cálculo.                          | Global com override por filial.             |
| ScheduleConflictEvent | Registro de conflito/override.         | id, workspace_id, schedule_event_id, conflicting_event_id, overridden_by, reason, created_at              | N:1 events.                             | Conflitos nunca ficam invisíveis.           |
| StairStepChangeSet    | Alteração em cascata de datas.         | id, project_id, initiated_by, reason, before_json, after_json, created_at                                 | 1:N affected schedules.                 | Permite preview/auditoria/undo imediato.    |

# G. Daily Logs, Fotos e Documentos

| **Entidade**          | **Responsabilidade**                    | **Campos-chave (lógicos)**                                                                                    | **Relacionamentos**                     | **Regras**                                                                 |
|-----------------------|-----------------------------------------|---------------------------------------------------------------------------------------------------------------|-----------------------------------------|----------------------------------------------------------------------------|
| DailyLog              | Registro diário único por Service/data. | id, project_service_id, log_date, crew/team snapshot, progress, work_completed, issues, next_steps, locked_at | N:1 ProjectService; 1:N media, workers. | Unique(project_service_id, log_date).                                      |
| DailyLogWorker        | Pessoas que trabalharam no dia.         | daily_log_id, membership_id                                                                                   | N:M.                                    | Snapshot operacional.                                                      |
| MediaAsset            | Arquivo físico armazenado.              | id, workspace_id, storage_key, mime_type, size, checksum, original_name, compressed_variant info              | N:M via attachments.                    | Fotos podem ter versão comprimida; documentos oficiais preservam original. |
| Document              | Documento lógico com metadados.         | id, workspace_id, name, category, visibility, media_asset_id, uploaded_by                                     | Vinculado a entity via DocumentLink.    | Internal/Customer Visible.                                                 |
| DocumentLink          | Vínculo de documento.                   | document_id, entity_type, entity_id                                                                           | N:M.                                    | Project/Service/Property/Client/Estimate etc.                              |
| PhotoLink             | Vínculo de imagem com categoria.        | media_asset_id, entity_type, entity_id, photo_category, customer_visible, uploaded_by, captured_at            | N:M.                                    | Before/During/After/Damage/Material/CO/Receipt.                            |
| ProjectProgressReport | Snapshot/artefato final de progresso.   | id, project_id, generated_at, generated_by, media_asset_id nullable, visibility                               | N:1 Project.                            | Consolida Daily Logs, fotos e conclusão.                                   |

# H. Change Orders, Materiais e Compras

| **Entidade**            | **Responsabilidade**     | **Campos-chave (lógicos)**                                                                                                                       | **Relacionamentos**                    | **Regras**                                               |
|-------------------------|--------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------|----------------------------------------------------------|
| ChangeOrder             | Alteração de escopo.     | id, project_id, service_id nullable, number, status, requested_by, reason, request_description, final_description, subtotal, tax, total, sent_at | 1:N items; 1:1 signature; 1:N events.  | Field request começa sem preço; Approved fica locked.    |
| ChangeOrderItem         | Linha precificada.       | id, change_order_id, description, qty, unit_price, tax, total                                                                                    | N:1 ChangeOrder.                       | Múltiplos itens por CO.                                  |
| ChangeOrderSignature    | Assinatura do cliente.   | id, change_order_id, signer_name, signature_asset_id/type, signed_at, metadata                                                                   | 1:1 approved CO.                       | Reject exige reason.                                     |
| MaterialRequest         | Solicitação de material. | id, project_service_id, requested_by, status, reason, notes                                                                                      | 1:N MaterialRequestItem; N:M Purchase. | Requested/Approved/Rejected/Purchased/Delivered.         |
| MaterialRequestItem     | Item solicitado.         | id, material_request_id, material_name/catalog_ref, quantity, unit                                                                               | N:1 MaterialRequest.                   | Pode ter foto via attachment.                            |
| Vendor                  | Loja/fornecedor.         | id, workspace_id, name, address, phone, email, website, notes                                                                                    | 1:N Purchase/PurchaseOrder.            | Tela global e histórico.                                 |
| PurchaseOrder           | Ordem de compra.         | id, workspace_id, vendor_id, po_number, status, order_date, total                                                                                | 1:N Purchase/Items; links Project.     | Pode ser usada independentemente conforme implementação. |
| Purchase                | Compra efetiva.          | id, workspace_id, vendor_id, project_id, service_id, purchase_order_id nullable, purchased_by, purchase_date, amount, payment_status, notes      | 1:N PurchaseItem; N:M MaterialRequest. | Pode existir sem request com permissão.                  |
| PurchaseItem            | Material comprado.       | id, purchase_id, material, quantity, unit, amount                                                                                                | N:1 Purchase.                          | Receipts via Document/PhotoLink.                         |
| MaterialRequestPurchase | Liga request a compras.  | material_request_id, purchase_id                                                                                                                 | N:M.                                   | Uma solicitação pode gerar várias compras.               |

# I. Financeiro, Pagamentos e Comissões

| **Entidade**           | **Responsabilidade**                        | **Campos-chave (lógicos)**                                                                                                                                    | **Relacionamentos**          | **Regras**                                      |
|------------------------|---------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------------|-------------------------------------------------|
| InvoiceRecord          | Espelho interno do Invoice externo/manual.  | id, workspace_id, project_id, invoice_number, invoice_type, provider_connection_id, external_id, amount, balance, due_date, status, sync_status, external_url | 1:N payments; 1:N events.    | Criação manual; sync por API/webhook.           |
| InvoiceLine            | Linha faturada.                             | id, invoice_id, source_type, source_id, description, amount, tax, discount                                                                                    | N:1 Invoice.                 | Origem Service/CO/percentual.                   |
| PaymentSchedule        | Plano de parcelas do Job.                   | id, project_id, payment_term_template_id, status                                                                                                              | 1:N PaymentScheduleItem.     | Percentuais/datas.                              |
| PaymentScheduleItem    | Parcela planejada.                          | id, schedule_id, percent, amount, due_date, status, invoice_id nullable                                                                                       | N:1 schedule.                | Deposit/progress/final.                         |
| Payment                | Pagamento aplicado a Invoice específico.    | id, invoice_id, provider_connection_id nullable, external_id, method, amount, paid_at, status, reference, recorded_by                                         | N:1 Invoice; 1:N Refund.     | Overpayment bloqueado.                          |
| Refund                 | Estorno separado.                           | id, payment_id, amount, refunded_at, reason, external_id                                                                                                      | N:1 Payment.                 | Nunca apaga original.                           |
| FinancingProvider      | Opção de financiamento configurada.         | id, workspace_id, name, instructions, application_url, active                                                                                                 | 1:N FinancingApplication.    | Exibida no Estimate/Portal.                     |
| FinancingApplication   | Financiamento do cliente/Job.               | id, project_id, estimate_id, provider_id, status, requested_amount, approved_amount, funded_amount                                                            | N:1 Provider.                | Applied/Pending/Approved/Declined/Funded.       |
| CommissionRule         | Regra de comissão.                          | id, workspace_id, scope_type, calc_type, rate/fixed_value, trigger                                                                                            | 1:N Commission.              | Sale/Gross Profit/Fixed/By Service/Combination. |
| Commission             | Comissão calculada por vendedor.            | id, workspace_id, salesperson_membership_id, project_id, estimate_id, rule_snapshot, amount, status                                                           | 1:N adjustments.             | Projected/Earned/Approved/Paid.                 |
| CommissionAdjustment   | Ajuste auditável.                           | id, commission_id, amount_delta, reason, created_by                                                                                                           | N:1 Commission.              | Paid permanece congelada.                       |
| AccountsReceivableView | Visão derivada, não necessariamente tabela. | invoice_id, customer, salesperson, project_manager, location, due_date, balance, aging_bucket                                                                 | Derivada de Invoice/Payment. | Current/1-30/31-60/61-90/90+.                   |

# J. Comunicação, Chat e Consentimento

| **Entidade**            | **Responsabilidade**                         | **Campos-chave (lógicos)**                                                                                            | **Relacionamentos**              | **Regras**                                           |
|-------------------------|----------------------------------------------|-----------------------------------------------------------------------------------------------------------------------|----------------------------------|------------------------------------------------------|
| Conversation            | Thread de comunicação externa ou interna.    | id, workspace_id, type, client_id nullable, project_id nullable, location_id nullable, status, assigned_membership_id | 1:N Message; N:M participants.   | Types: CUSTOMER, DIRECT, GROUP, JOB_CHAT, CREW_CHAT. |
| ConversationParticipant | Participante de conversa interna/externa.    | conversation_id, participant_type, participant_id, role, muted                                                        | N:M.                             | Pode representar Membership ou ContactPerson.        |
| Message                 | Mensagem individual.                         | id, conversation_id, sender_type/id, channel, body, sent_at, edited_at, deleted_at, reply_to_id, scheduled_at         | 1:N attachments/delivery events. | Soft delete em chat interno.                         |
| MessageAttachment       | Anexo de mensagem.                           | message_id, media_asset_id                                                                                            | N:1 Message.                     | Suporta canais compatíveis.                          |
| MessageDeliveryEvent    | Evento de provider.                          | id, message_id, event_type, occurred_at, provider_payload metadata                                                    | N:1 Message.                     | Sent/Delivered/Opened/Bounced/Failed/Reply etc.      |
| CommunicationConsent    | Preferência/consentimento por contato/canal. | contact_person_id, channel, status, source, updated_at                                                                | N:1 ContactPerson.               | Opt-out bloqueia envios não permitidos.              |
| MessageTemplate         | Template de comunicação.                     | id, workspace_id, category, channel, name, body, active                                                               | Usado manualmente/automações.    | Variáveis validadas.                                 |
| PinnedMessage           | Mensagem fixada no chat.                     | conversation_id, message_id, pinned_by, pinned_at                                                                     | N:1 Conversation.                | Permissão controlada.                                |

# K. Tarefas, Aprovações, Notificações e Automações

| **Entidade**              | **Responsabilidade**                  | **Campos-chave (lógicos)**                                                                                                           | **Relacionamentos**                    | **Regras**                                          |
|---------------------------|---------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------|-----------------------------------------------------|
| Task                      | Tarefa operacional.                   | id, workspace_id, entity_type/id nullable, title, description, primary_assignee_id, due_at, priority, status, recurrence_id nullable | 1:N comments/checklist; N:M followers. | Um responsável principal.                           |
| TaskFollower              | Observador de tarefa.                 | task_id, membership_id                                                                                                               | N:M.                                   | Recebe atualizações sem responsabilidade principal. |
| TaskComment               | Comentário.                           | id, task_id, author_id, body, created_at                                                                                             | 1:N attachments/mentions.              | @mentions\.                                         |
| TaskChecklistItem         | Subtarefa/checklist.                  | id, task_id, parent_id nullable, label, completed_at                                                                                 | N:1 Task.                              | Estrutura simples.                                  |
| ApprovalRequest           | Item aguardando decisão.              | id, workspace_id, type, entity_type/id, requested_by, assigned_to nullable, status, requested_at                                     | 1:N ApprovalDecision.                  | CO/Material/Commission etc.                         |
| ApprovalDecision          | Decisão de aprovação.                 | id, approval_request_id, decided_by, decision, reason, decided_at                                                                    | N:1 request.                           | Reject exige reason.                                |
| Notification              | Notificação do usuário.               | id, membership_id, event_type, title, body, deep_link, severity, read_at, created_at                                                 | N:1 Membership.                        | Pode ser agrupada logicamente.                      |
| NotificationPreference    | Preferência por evento/canal.         | membership_id, event_type, in_app, email, sms, push, quiet_hours                                                                     | N:1 Membership.                        | Regras obrigatórias podem sobrepor.                 |
| MandatoryNotificationRule | Notificação obrigatória do Workspace. | workspace_id, event_type, required_channels                                                                                          | N:1 Workspace.                         | Usuário não desliga.                                |
| AutomationDefinition      | Automação configurável.               | id, workspace_id, name, enabled, trigger_type, trigger_config, condition_tree, action_list, limits metadata                          | 1:N AutomationRun.                     | QUANDO-SE-ENTÃO; JSON config tipado.                |
| AutomationRun             | Execução de automação.                | id, automation_id, trigger_entity, started_at, finished_at, status, error                                                            | 1:N step runs.                         | Histórico de debug.                                 |
| AutomationStepRun         | Resultado de condição/ação.           | id, run_id, step_type, config_snapshot, status, output/error                                                                         | N:1 run.                               | Ajuda prevenção/debug.                              |
| ApprovalDelegation        | Delegação temporária.                 | from_membership_id, to_membership_id, approval_types, start_at, end_at                                                               | N:M logic.                             | Auditável.                                          |

# L. Integrações, API, Webhooks e MCP

| **Entidade**           | **Responsabilidade**               | **Campos-chave (lógicos)**                                                                                               | **Relacionamentos**            | **Regras**                                 |
|------------------------|------------------------------------|--------------------------------------------------------------------------------------------------------------------------|--------------------------------|--------------------------------------------|
| IntegrationConnection  | Conexão OAuth/API de um Workspace. | id, workspace_id, provider, type, status, external_account_id, encrypted_credentials_ref, last_sync_at, default_for_type | 1:N ExternalObjectLink.        | Connected/Disconnected/Error/Needs Reauth. |
| ExternalObjectLink     | Mapeia registro interno ↔ externo. | id, connection_id, entity_type, entity_id, external_id, sync_status, synced_at                                           | N:1 connection.                | Invoices e outros objetos.                 |
| ApiCredential          | Credencial da API pública.         | id, workspace_id, name, secret_hash/ref, scopes, created_by, last_used_at, expires_at, revoked_at                        | N:1 Workspace.                 | Nunca guardar segredo em claro.            |
| WebhookEndpoint        | Endpoint configurado pelo cliente. | id, workspace_id, url, secret_ref, enabled, subscribed_events                                                            | 1:N WebhookDelivery.           | Assinatura obrigatória.                    |
| WebhookDelivery        | Tentativa de webhook.              | id, endpoint_id, event_id, attempt_no, response_code, status, attempted_at, next_retry_at                                | N:1 endpoint.                  | Retry e logs.                              |
| McpConfiguration       | Configuração MCP do Workspace.     | id, workspace_id, enabled, allowed_scopes, plan_gate                                                                     | N:1 Workspace.                 | Respeita usuário/permissões.               |
| IntegrationHealthEvent | Erro/saúde de integração.          | id, connection/provider, severity, code, message, occurred_at, resolved_at                                               | Usado por Super Admin/support. | Sem expor dados privados desnecessários.   |

# M. Auditoria, Atividade, Suporte e Demo

| **Entidade**         | **Responsabilidade**                        | **Campos-chave (lógicos)**                                                                                | **Relacionamentos**                  | **Regras**                                           |
|----------------------|---------------------------------------------|-----------------------------------------------------------------------------------------------------------|--------------------------------------|------------------------------------------------------|
| AuditLog             | Registro técnico/administrativo imutável.   | id, workspace_id, actor_type/id, action, entity_type/id, before_json, after_json, occurred_at, ip/context | N:1 entity logically.                | Não editável por usuário comum.                      |
| ActivityEvent        | Timeline legível pelo usuário.              | id, workspace_id, entity_type/id, event_type, actor, summary, metadata, occurred_at                       | N:1 entity.                          | Pode referenciar AuditLog, Message, Payment etc.     |
| RecycleBinEntry      | Controle de soft delete/restauração.        | id, workspace_id, entity_type/id, deleted_by, deleted_at, purge_after                                     | N:1 entity.                          | Não aplicável a registros imutáveis quando proibido. |
| SupportTicket        | Solicitação de suporte.                     | id, workspace_id, opened_by, subject, status, priority, created_at                                        | 1:N messages/events.                 | Help & Support.                                      |
| SupportAccessSession | Sessão autorizada de suporte/impersonation. | id, workspace_id, super_admin_id, authorized_by, reason, start_at, end_at, status                         | 1:N AuditLog context.                | Banner permanente e auditoria.                       |
| DemoDataset          | Marca conjunto de dados demo.               | id, workspace_id, created_at, status                                                                      | Relaciona/identifica registros demo. | Remoção não toca dados reais.                        |

# 3. Relacionamentos críticos e cardinalidades

| **Relação**                               | **Cardinalidade**             | **Motivo**                                                                            |
|-------------------------------------------|-------------------------------|---------------------------------------------------------------------------------------|
| User ↔ Workspace                          | N:M via Membership            | Permite múltiplas empresas sem misturar dados.                                        |
| Workspace → Location                      | 1:N                           | Filial é escopo operacional.                                                          |
| ClientAccount → ContactPerson             | 1:N                           | Cliente pode ter vários contatos.                                                     |
| ClientAccount → Property                  | 1:N                           | Cliente pode ter vários endereços.                                                    |
| ClientAccount/Property → SalesOpportunity | 1:N                           | Mesmo cliente pode ter múltiplas oportunidades simultâneas.                           |
| SalesOpportunity → Estimate               | 1:N                           | Permite versões/novas propostas comerciais.                                           |
| Estimate ↔ Project                        | N:M via ProjectEstimateSource | Um Estimate pode criar Job; um Job pode receber serviços de Estimates posteriores.    |
| Project → ProjectService                  | 1:N                           | Cada serviço tem status, agenda, Daily Logs e atribuições próprios.                   |
| ProjectService → DailyLog                 | 1:N com unicidade por data    | Um log por serviço por dia.                                                           |
| ProjectService → ScheduleEvent            | 1:N                           | Permite múltiplos dias/visitas.                                                       |
| Team ↔ Crew                               | N:M                           | Crew pode pertencer a várias equipes.                                                 |
| MaterialRequest ↔ Purchase                | N:M                           | Uma solicitação pode gerar várias compras e uma compra pode atender itens correlatos. |
| Project → InvoiceRecord                   | 1:N                           | Progress billing.                                                                     |
| InvoiceRecord → Payment                   | 1:N                           | Pagamento sempre aplicado a Invoice específico.                                       |
| Conversation → Message                    | 1:N                           | Externo e interno compartilham motor, com tipos diferentes.                           |
| Task → Follower                           | N:M                           | Um assignee principal, vários followers.                                              |
| AutomationDefinition → AutomationRun      | 1:N                           | Histórico completo de execução.                                                       |

# 4. Máquinas de estado principais

| **Domínio**       | **Estados**                                                                                             | **Regra-chave**                                |
|-------------------|---------------------------------------------------------------------------------------------------------|------------------------------------------------|
| Lifecycle do CRM  | Lead → Prospect → Customer → Past Customer                                                              | Estimate aprovado pode promover para Customer. |
| Sales Opportunity | New Lead → Contacted → Appointment → Estimate Sent → Follow-up → Won/Lost                               | Etapas configuráveis; Won/Lost semânticos.     |
| Estimate          | Draft → Sent → Viewed/Awaiting Approval → Approved \| Rejected \| Expired \| Cancelled                  | Approved = locked.                             |
| Project           | New → Approved → Scheduled → In Progress → Waiting → Completed → Invoiced → Paid → Closed(opcional)     | Pipeline configurável.                         |
| Project Service   | Custom statuses; ao menos Scheduled/In Progress/Waiting/Done                                            | Field Worker altera subset permitido.          |
| Change Order      | Draft/Requested → Under Review → Ready for Customer → Sent → Viewed → Approved \| Rejected \| Cancelled | Approved = locked + signature.                 |
| Material Request  | Requested → Approved \| Rejected → Purchased → Delivered                                                | Pode ter múltiplas compras.                    |
| Invoice           | Draft(local) → Synced/Sent → Open/Partially Paid → Paid \| Void/Cancelled                               | Status pode vir do provider.                   |
| Commission        | Projected → Earned → Approved → Paid                                                                    | Paid fica congelada.                           |
| Subscription      | Trial → Active; Payment Failed → Grace → Read-only → Suspended → Active                                 | Dados não são apagados.                        |
| Automation Run    | Queued/Running → Succeeded \| Failed \| Cancelled/Skipped                                               | Waits e retries registráveis.                  |

# 5. Regras de integridade que o backend deve impor

- Nunca aceitar referência entre registros de Workspaces diferentes, mesmo que IDs sejam válidos.

- Estimate aprovado não pode ser editado; nova necessidade comercial usa Change Order ou novo Estimate.

- Project com Estimate aprovado/documento assinado não permite troca simples de Client/Property.

- DailyLog deve ser único por ProjectService + data. Após Service DONE, conteúdo fica bloqueado; apenas anexação de novas fotos permanece, salvo reabertura autorizada.

- Mudança de quantity/Crew que altera duração precisa disparar cálculo de agenda e registrar decisão da Escadinha.

- Conflito de agenda não pode ser ocultado; override exige confirmação e deve ficar rastreável.

- Payment não pode exceder saldo do Invoice enquanto Customer Credit estiver fora do escopo.

- Invoice total não deve exceder saldo faturável do contrato por padrão; exceção requer permissão e justificativa.

- Payment/Refund são append-only em termos contábeis; nunca apagar a transação original.

- Commission Paid não recalcula automaticamente.

- Opt-out/consentimento precisa bloquear envio quando aplicável.

- Automation Engine precisa de proteção contra loops e histórico de cada execução.

- Permissões são avaliadas junto de Workspace, Role e Location scope; Deep Link nunca contorna autorização.

- Hard delete é proibido para AuditLog, pagamentos, documentos assinados e outros registros protegidos.

- Demo Data deve estar isolado/identificado para deleção segura.

# 6. Índices e unicidades lógicas recomendadas

| **Entidade**    | **Índice/Unicidade**                                           | **Objetivo**                                   |
|-----------------|----------------------------------------------------------------|------------------------------------------------|
| Membership      | UNIQUE(user_id, workspace_id)                                  | Um vínculo ativo lógico por usuário/Workspace. |
| DailyLog        | UNIQUE(project_service_id, log_date)                           | Um Daily Log por serviço por dia.              |
| Estimate        | UNIQUE(workspace_id, estimate_number)                          | Numeração humana por Workspace.                |
| Project         | UNIQUE(workspace_id, project_number)                           | Numeração humana por Workspace.                |
| InvoiceRecord   | UNIQUE(provider_connection_id, external_id) quando externo     | Evita duplicação por webhook/retry.            |
| Payment         | UNIQUE(provider_connection_id, external_id) quando externo     | Idempotência financeira.                       |
| WebhookDelivery | INDEX(endpoint_id, status, next_retry_at)                      | Fila/retry eficiente.                          |
| ScheduleEvent   | INDEX(resource assignments + start/end)                        | Detecção de conflito e calendário.             |
| ClientAccount   | INDEX(workspace_id, lifecycle_status, assigned_salesperson_id) | CRM/filtros.                                   |
| ContactPerson   | INDEX(workspace_id via client, normalized_email/phone)         | Busca/duplicidade.                             |
| Property        | INDEX(workspace_id via client, normalized_address)             | Busca/duplicidade.                             |
| ActivityEvent   | INDEX(entity_type, entity_id, occurred_at DESC)                | Timeline.                                      |
| AuditLog        | INDEX(workspace_id, entity_type, entity_id, occurred_at DESC)  | Auditoria.                                     |
| Message         | INDEX(conversation_id, sent_at)                                | Inbox/chat.                                    |
| Notification    | INDEX(membership_id, read_at, created_at DESC)                 | Central de notificações.                       |

# 7. Dados derivados que não precisam ser fonte primária

- Accounts Receivable e aging buckets podem ser views/materializações derivadas de Invoice + Payment.

- Total Contract Value do Project deriva de Estimates/Services aprovados + Change Orders aprovados, com snapshot quando necessário para auditoria.

- Open Balance deriva de Invoice/Payment/Refund, não de edição manual isolada.

- Crew utilization e produtividade derivam de ScheduleEvent, ProductionCapacity e actual dates/quantities.

- Dashboard KPIs e relatórios devem preferir projeções/aggregates, mantendo as entidades transacionais como fonte de verdade.

- Needs Attention é uma projeção de regras sobre estados (Jobs atrasados, requests pendentes etc.), não uma entidade de negócio obrigatória.

# 8. Eventos de domínio recomendados

- client.created

- opportunity.created

- estimate.sent

- estimate.viewed

- estimate.approved

- estimate.rejected

- project.created

- project.status_changed

- service.scheduled

- service.rescheduled

- service.completed

- daily_log.updated

- change_order.requested

- change_order.approved

- material_request.created

- purchase.recorded

- invoice.created

- invoice.sync_failed

- payment.received

- payment.refunded

- commission.earned

- task.completed

- message.received

- automation.failed

- subscription.payment_failed

- subscription.suspended

Esses eventos alimentam Activity, Notifications, Automations e Webhooks próprios. O TRD decidirá se serão implementados com event bus, fila, outbox pattern ou outra estratégia.

# 9. Mapeamento App Flow → Contexto de dados

| **App Flow**                      | **Entidades centrais**                                                                    |
|-----------------------------------|-------------------------------------------------------------------------------------------|
| CRM / Client / Property           | ClientAccount, ContactPerson, Property, SalesOpportunity, Note, Tag, CustomField          |
| Sales / Estimate                  | SalesPipeline, Opportunity, Appointment, Estimate, Version, LineItem, Signature, Template |
| Projects / Services               | Project, ProjectService, Milestone, Checklist, ProjectEstimateSource                      |
| Schedule / Field                  | Crew, Team, Assignment, ProductionCapacity, ScheduleEvent, AvailabilityBlock, DailyLog    |
| Change Orders / Materials         | ChangeOrder, ChangeOrderItem, MaterialRequest, Vendor, Purchase                           |
| Financial                         | InvoiceRecord, PaymentSchedule, Payment, Refund, Financing, Commission                    |
| Inbox / Chat                      | Conversation, Participant, Message, DeliveryEvent, Consent, MessageTemplate               |
| Tasks / Approvals / Notifications | Task, Follower, ApprovalRequest, Decision, Notification, Preferences                      |
| Automations                       | AutomationDefinition, Run, StepRun                                                        |
| Settings / Platform               | Workspace, Membership, Role, Permission, Plan, Subscription, IntegrationConnection        |
| Audit / Support                   | AuditLog, ActivityEvent, RecycleBinEntry, SupportAccessSession                            |

# 10. Questões deliberadamente deixadas para o TRD

- Banco de dados físico e estratégia multi-tenant (schema compartilhado, RLS, sharding futuro).

- ORM/query layer e linguagem/framework de backend.

- Object storage, CDN, compressão de imagens e geração de thumbnails.

- Autenticação/SSO provider e implementação de Google Login.

- Filas, jobs assíncronos, retries, idempotência e event/outbox pattern.

- Provider de SMS/e-mail, push e estratégia de inbound messages.

- Providers financeiros e detalhes de QuickBooks/Stripe/PayPal/ACH.

- Webhooks externos/internos, assinatura e política de retry.

- Implementação do MCP server, autenticação e scopes.

- Caching, busca global, relatórios/analytics, observabilidade e backups.

- Stratégia PWA + apps nativos iOS/Android e compartilhamento de código.

# 11. Próximo passo recomendado

Com o Domain Model fechado, o próximo documento deve ser o UI/UX Design Document. O UI/UX poderá desenhar telas e componentes conhecendo as relações reais de dados e os estados que cada tela precisa representar. Depois, o TRD traduzirá App Flow + Domain Model + UI/UX em arquitetura técnica e decisões de stack.
