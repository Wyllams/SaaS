# BACKEND SCHEMA / DOMAIN MODEL

**v2.0** — Modelo lógico de dados e domínios

| Campo | Definição |
|---|---|
| Versão | 2.0 |
| Status | Substitui o Domain Model v1.0 |
| Data | 2026-09-25 |
| Base | PRD v2.0 + App Flow v2.0 + decisões de 2026-09-25 |
| Banco | PostgreSQL no Supabase |
| Acesso | Drizzle ORM com SQL nativo como escape hatch (ADR-001) |

> **O que mudou.** Entram Client Portal, Crew parceira, imposto e assinatura da plataforma — quatro domínios que **não tinham entidade alguma** na v1.0. Saem Automation, Chat interno, Webhooks de saída, MCP, Public API, Financing, Tasks e Custom Fields, junto com o escopo da V1. Papéis vão a sete e o lifecycle do CRM perde `Prospect`.

---

# 1. Convenções

- Toda entidade de tenant carrega `workspace_id`, direta ou indiretamente, e **jamais cruza Workspaces**.
- Entidades com escopo operacional por filial carregam `location_id`.
- Chave primária é UUID não sequencial, gerada na aplicação. Números humanos (`EST-1048`, `JOB-1054`) são campos separados, únicos por Workspace.
- Campos comuns: `id`, `workspace_id`, `created_at`, `created_by`, `updated_at`, `updated_by`, e `deleted_at` onde soft delete se aplica.
- **Dinheiro é `integer` em cents.** `currency_code` permanece na coluna; a V1 opera apenas em USD.
- Percentual usa decimal controlado ou basis points.
- Instante em `timestamptz`; data civil em `date`. Evento de negócio guarda o timezone de origem quando relevante.
- Documento assinado, Estimate aprovado, Change Order aprovado e transação financeira são imutáveis ou versionados, e **não sofrem hard delete**.
- `AuditLog` registra mudança técnica e administrativa; `ActivityEvent` registra a timeline legível. São conceitos distintos.
- Arquivo físico vive em Object Storage; o banco guarda metadados.
- Tag é entidade reutilizável com tabela de associação.
- Dados de demonstração precisam de marcador para remoção segura.

---

# A. Tenancy, identidade e acesso

| Entidade | Responsabilidade | Campos-chave | Regras |
|---|---|---|---|
| `Workspace` | Empresa cliente da plataforma | `name`, `status`, `default_language`, `default_currency`, `primary_owner_membership_id` | Boundary obrigatório de isolamento |
| `Location` | Filial operacional | `workspace_id`, `name`, endereço, `timezone`, `working_hours` | Calendário e capacidade respeitam a Location |
| `User` | Identidade global da pessoa interna | `email`, `name`, `photo`, `status` | Pode participar de vários Workspaces; suspender em um não afeta os outros |
| `UserAuthIdentity` | Vínculo com a identidade externa do provider | `user_id`, `provider`, `subject` | Mantém a identidade externa separada do User de negócio |
| `Membership` | Vínculo User ↔ Workspace | `workspace_id`, `user_id`, `status`, `primary_role_id` | `UNIQUE(user_id, workspace_id)`. Primary Owner é único por Workspace |
| `Role` | Papel padrão ou customizado | `workspace_id` nullable para papel de sistema, `name`, `is_system` | **Owner, Admin, Salesperson, Supervisor, Crew, Accounting** |
| `Permission` | Ação granular autorizável | `module`, `action`, `scope` | Escopos: `own`, `assigned`, `location`, `workspace` |
| `RolePermission` | Associação | `role_id`, `permission_id` | — |
| `UserLocation` | Escopo de filial do membro | `membership_id`, `location_id` | Controla o que a pessoa enxerga |
| `Invite` | Convite pendente | `workspace_id`, `email`, `role_id`, `location_ids`, `token`, `expires_at`, `status` | Vira Membership no aceite; reenvio e cancelamento |

`Client` **não é Role nem Membership**. É acesso externo, modelado em §L.

---

# B. Assinatura da plataforma

| Entidade | Responsabilidade | Campos-chave | Regras |
|---|---|---|---|
| `Plan` | Plano comercial | `code`, `name`, `billing_interval`, `active` | Starter, Growth, Pro, Enterprise |
| `PlanLimit` | Limite e feature por plano | `plan_id`, `feature_key`, `limit_value`, `enabled` | Users, Locations, Storage, Crews, Integrations |
| `Subscription` | Assinatura do Workspace | `workspace_id`, `plan_id`, `status`, `trial_start`, `trial_end`, `grace_end`, `current_period_end` | `Trial → Active`; `Past Due → Grace → Read-only → Suspended` |
| `BillingCustomer` | Espelho do cliente no provider de cobrança | `workspace_id`, `provider`, `external_customer_id` | **Separado do Stripe Connect** |
| `BillingPaymentMethod` | Meio de pagamento da assinatura | `billing_customer_id`, `external_id`, `brand`, `last4`, `exp`, `is_default` | Nenhum dado sensível de cartão é persistido |
| `SubscriptionInvoice` | Fatura da assinatura | `subscription_id`, `external_id`, `amount_cents`, `status`, `period`, `hosted_url` | Origem é o provider |
| `UsageMeter` | Consumo por Workspace e feature | `workspace_id`, `feature_key`, `period`, `quantity` | Alimenta Entitlements e a tela de uso |
| `Entitlement` | Direito efetivo do Workspace | `workspace_id`, `feature_key`, `limit_value`, `source` | **Limite é dado, nunca `if plan === 'Pro'` no código** |
| `Coupon` | Cupom promocional | `code`, `type`, `value`, `valid_from`, `valid_to` | Administrável |

---

# C. CRM

| Entidade | Responsabilidade | Campos-chave | Regras |
|---|---|---|---|
| `ClientAccount` | Cadastro único que vai de Lead a Customer | `workspace_id`, `lifecycle_status`, `company_name`, `primary_contact_id`, `lead_source_id`, `assigned_salesperson_id`, `next_followup_at` | **Lifecycle: `LEAD` → `CUSTOMER` → `PAST_CUSTOMER`** |
| `ContactPerson` | Pessoa ligada ao cliente | `client_id`, `first_name`, `last_name`, `phone`, `email`, `role_type`, `is_primary`, `normalized_email`, `normalized_phone` | Primary, Billing, Property, Other |
| `Property` | Endereço onde o trabalho acontece | `client_id`, endereço estruturado, `property_type`, `name`, `is_primary`, `normalized_address`, `tax_location_id` | O primeiro endereço cria a Property |
| `PropertyContact` | Contato específico de uma Property | `property_id`, `contact_person_id`, `relation_type` | Permite inquilino ou property manager |
| `LeadSource` | Origem configurável | `workspace_id`, `name`, `active` | Alimenta relatório de conversão |
| `Tag` / `EntityTag` | Classificação reutilizável | `name`, `group`, `archived` / `tag_id`, `entity_type`, `entity_id` | Associação polimórfica controlada |
| `Note` | Nota permanente | `entity_type`, `entity_id`, `body`, `pinned`, `author_id` | Distinta de mensagem; aceita menção e anexo |

---

# D. Vendas e Estimates

| Entidade | Responsabilidade | Campos-chave | Regras |
|---|---|---|---|
| `SalesPipeline` / `SalesStage` | Pipeline e etapas | `name`, `order`, `is_won`, `is_lost` | Reordenáveis; Lost exige motivo |
| `SalesOpportunity` | Oportunidade ligada a Client + Property | `client_id`, `property_id`, `stage_id`, `salesperson_id`, `service_interest`, `potential_value_cents`, `lost_reason` | Várias oportunidades por cliente sem duplicar CRM |
| `SalesAppointment` | Compromisso de venda | `opportunity_id`, `salesperson_id`, `start_at`, `duration`, `status`, `contract_closed_at` | Scheduled, Confirmed, Completed, Cancelled, No Show |
| `Estimate` | Documento comercial | `opportunity_id`, `property_id`, `estimate_number`, `status`, `active_version_id`, `expires_at`, `total_cents`, `deposit_required_cents` | `UNIQUE(workspace_id, estimate_number)`. Approved fica bloqueado |
| `EstimateVersion` | Versão antes da aprovação | `estimate_id`, `version_no`, `subtotal_cents`, `discount_cents`, `tax_cents`, `total_cents`, `terms`, `customer_notes`, `internal_notes` | O cliente vê apenas a versão ativa |
| `EstimateLineItem` | Linha de serviço | `estimate_version_id`, `service_catalog_id` nullable, `name`, `description`, `qty`, `unit`, `unit_price_cents`, `discount_cents`, **`labor_amount_cents`**, **`material_amount_cents`**, `tax_cents`, `total_cents` | A separação labor/material existe **por causa do imposto** (§I) |
| `EstimateRecipient` | Destinatário | `estimate_id`, `contact_person_id`, `channel` | — |
| `EstimateViewEvent` | Abertura pelo cliente | `estimate_id`, `contact_id`, `viewed_at`, `metadata` | A interface resume primeira e última |
| `EstimateSignature` | Assinatura de aprovação | `estimate_id`, `signer_name`, `signature_type`, `signature_asset_id`, `signed_at`, `ip`, `device_metadata`, `portal_grant_id` | 1:1 com Estimate aprovado |
| `EstimateTemplate` | Template da empresa ou do vendedor | `owner_user_id` nullable, `name`, `terms`, estrutura | Sem fotos padrão |
| `PaymentTermTemplate` | Modelo de parcelamento | `name`, percentuais e datas | 50/50, 30/40/30 |

---

# E. Jobs e Services

| Entidade | Responsabilidade | Campos-chave | Regras |
|---|---|---|---|
| `Project` | Job principal | `client_id`, `property_id`, `project_number`, `status_id`, `salesperson_id`, `supervisor_membership_id`, `progress_percent`, `archived_at` | `UNIQUE(workspace_id, project_number)` |
| `ProjectEstimateSource` | Origem Estimate ↔ Job | `project_id`, `estimate_id` | Suporta adicionar Services a Job existente |
| `ProjectStatus` / `ServiceStatus` | Status configuráveis | `name`, `order`, `category` | Crew altera apenas o subconjunto permitido |
| `ProjectService` | Unidade executável | `project_id`, `source_estimate_line_id`, `service_catalog_id`, `name`, `status_id`, `quantity`, `production_unit_id`, `progress_percent`, datas planejadas e reais | Quantidade editável com permissão; mudança de duração dispara Escadinha |
| `ServiceCatalogItem` | Serviço reutilizável | `category`, `name`, `default_unit_id`, `default_status_id`, `active` | — |
| `JobTemplate` | Template de Job | `name`, estrutura de services, milestones e checklist | — |
| `Milestone` | Marco | `project_id`, `name`, `status`, `planned_date`, `completed_date`, `responsible_membership_id` | Vive na Overview |
| `ChecklistTemplate` / `ChecklistTemplateItem` | Modelo de checklist | `service_catalog_id` nullable, `name` | Imprimível |
| `ServiceChecklistItem` | Instância no Service | `project_service_id`, `label`, `status`, `weight`, `requires_photo`, `requires_comment` | Alimenta progresso automático |
| `ProjectFavorite` | Favorito por usuário | `membership_id`, `project_id` | Preferência pessoal |

---

# F. Agenda, Crews e capacidade

| Entidade | Responsabilidade | Campos-chave | Regras |
|---|---|---|---|
| `Crew` | Grupo operacional | `workspace_id`, `location_id`, `name`, **`crew_type`**, `active` | `crew_type`: `INTERNAL` ou `SUBCONTRACTOR` |
| `SubcontractorProfile` | Dados da crew parceira | `crew_id`, `company_name`, `contact_name`, `phone`, `email`, `tax_id_w9_asset_id`, `license_number`, `license_state`, `license_expires_on`, **`insurance_certificate_asset_id`**, **`insurance_expires_on`** | **Seguro vencido bloqueia ou alerta na atribuição, conforme configuração.** Sistema avisa antes do vencimento |
| `Team` / `TeamCrew` | Equipe composta por Crews | `name` / `team_id`, `crew_id` | Crew pode estar em vários Teams |
| `CrewMember` | Associação Crew ↔ Membership | `crew_id`, `membership_id` | Sem líder obrigatório |
| `ProductionUnit` | Unidade de produção | `code`, `label` | SQ, Linear Feet, Units, Rooms, Sq Ft |
| `ProductionCapacity` | Capacidade da Crew | `crew_id`, `service_catalog_id` nullable, `unit_id`, `quantity_per_day` | Base do cálculo automático de duração |
| `ServiceAssignment` | Recursos atribuídos | `project_service_id`, `crew_id`, `team_id`, `membership_id`, `role_type`, `is_primary` | Primary mais adicionais |
| `ScheduleEvent` | Segmento agendado | `project_service_id`, `location_id`, `start_at`, `end_at`, `status` | Arraste e redimensionamento; base da detecção de conflito |
| `AvailabilityBlock` | Bloqueio de recurso | `resource_type`, `resource_id`, `start_at`, `end_at`, `recurrence_config`, `reason` | Crew, User ou Team; pode ser recorrente |
| `Holiday` | Feriado | `workspace_id`, `location_id` nullable, `date`, `name` | Global com override por Location |
| `ScheduleConflictEvent` | Conflito e override | `schedule_event_id`, `conflicting_event_id`, `overridden_by`, `reason` | **Conflito nunca fica invisível** |
| `StairStepChangeSet` | Alteração em cascata | `project_id`, `initiated_by`, `reason`, `before_json`, `after_json` | Permite preview, auditoria e desfazer |

> `RecurrenceRule` aplica-se **apenas a bloqueios e feriados**. Serviços recorrentes estão fora da V1.

---

# G. Campo, mídia e documentos

| Entidade | Responsabilidade | Campos-chave | Regras |
|---|---|---|---|
| `DailyLog` | Registro diário | `project_service_id`, `log_date`, snapshot de crew, `progress`, `work_completed`, `issues`, `next_steps`, `locked_at` | **`UNIQUE(project_service_id, log_date)`** |
| `DailyLogWorker` | Quem trabalhou no dia | `daily_log_id`, `membership_id` | Snapshot operacional |
| `FieldIssue` | Problema reportado | `project_service_id`, `category`, `description`, `reported_by`, `status` | Separado de Change Order e Material Request |
| `MediaAsset` | Arquivo físico | `storage_key`, `mime_type`, `size`, `checksum`, `original_name`, variantes | Foto tem versão comprimida; documento oficial preserva o original |
| `Document` / `DocumentLink` | Documento lógico e vínculo | `name`, `category`, `visibility`, `media_asset_id` / `entity_type`, `entity_id` | Internal ou Customer Visible |
| `PhotoLink` | Imagem com categoria | `media_asset_id`, `entity_type`, `entity_id`, `photo_category`, `customer_visible`, `captured_at` | Before, During, After, Damage, Material, CO, Receipt |
| `ProjectProgressReport` | Artefato de progresso | `project_id`, `generated_at`, `generated_by`, `media_asset_id`, `visibility` | Respeita as flags de visibilidade |
| `CompletionSignature` | Assinatura de conclusão | `project_service_id`, `signer_name`, `signature_type`, `signature_asset_id`, `signed_at`, `pending_reason` | Cliente ausente gera pendência |

---

# H. Change Orders, materiais e compras

| Entidade | Responsabilidade | Campos-chave | Regras |
|---|---|---|---|
| `ChangeOrder` | Alteração de escopo | `project_id`, `service_id` nullable, `number`, `status`, `requested_by`, `reason`, `request_description`, `final_description`, `subtotal_cents`, `tax_cents`, `total_cents`, `sent_at` | Nasce sem preço; aprovado fica bloqueado |
| `ChangeOrderItem` | Linha precificada | `change_order_id`, `description`, `qty`, `unit_price_cents`, `labor_amount_cents`, `material_amount_cents`, `tax_cents`, `total_cents` | Várias linhas por CO |
| `ChangeOrderSignature` | Assinatura do cliente | `change_order_id`, `signer_name`, `signature_asset_id`, `signed_at`, `portal_grant_id` | 1:1 com CO aprovado |
| `MaterialRequest` / `MaterialRequestItem` | Solicitação e itens | `project_service_id`, `requested_by`, `status`, `reason` / `material_name`, `quantity`, `unit` | Requested → Approved \| Rejected → Purchased → Delivered |
| `Vendor` | Fornecedor | `name`, endereço, `phone`, `email`, `website` | Tela própria com histórico e total gasto |
| `PurchaseOrder` | Ordem de compra | `vendor_id`, `po_number`, `status`, `order_date`, `total_cents` | — |
| `Purchase` / `PurchaseItem` | Compra e itens | `vendor_id`, `project_id`, `service_id`, `purchase_order_id` nullable, `purchased_by`, `purchase_date`, `amount_cents`, `payment_status` / `material`, `quantity`, `unit`, `amount_cents` | Compra pode existir sem solicitação, com permissão |
| `MaterialRequestPurchase` | Liga solicitação a compras | `material_request_id`, `purchase_id` | Uma solicitação gera várias compras |

---

# I. Imposto

| Entidade | Responsabilidade | Campos-chave | Regras |
|---|---|---|---|
| `TaxRate` | Alíquota configurada pela empresa | `workspace_id`, `location_id`, `name`, `rate_bps`, **`applies_to_labor`**, **`applies_to_material`**, `effective_from`, `effective_to` | Alíquota em basis points. Override por Estimate é permitido |
| `TaxExemption` | Isenção do cliente | `client_id`, `certificate_asset_id`, `certificate_number`, `issuing_state`, `valid_from`, `valid_until`, `status` | Isenção válida zera o imposto e **registra o motivo no documento** |
| `TaxTreatment` | Tratamento fiscal do Workspace | `workspace_id`, `location_id`, `mode` | `LUMP_SUM` ou `RETAIL`. Em lump sum o contractor paga o imposto na compra e não cobra do cliente |

A referência de alíquota é o **endereço da Property**, não o da empresa — daí `Property.tax_location_id`.

O cálculo fica atrás de um contrato `TaxProvider`. A V1 implementa o provider interno baseado nestas tabelas; um provider externo pode ser plugado sem tocar no domínio.

---

# J. Financeiro

| Entidade | Responsabilidade | Campos-chave | Regras |
|---|---|---|---|
| `InvoiceRecord` | Espelho interno da fatura | `project_id`, `invoice_number`, `invoice_type`, `provider_connection_id`, `external_id`, `amount_cents`, `balance_cents`, `due_date`, `status`, `sync_status`, `external_url` | `UNIQUE(provider_connection_id, external_id)` quando externo |
| `InvoiceLine` | Linha faturada | `invoice_id`, `source_type`, `source_id`, `description`, `amount_cents`, `tax_cents`, `discount_cents` | Origem: Service, Change Order ou percentual |
| `PaymentSchedule` / `PaymentScheduleItem` | Plano de parcelas | `project_id`, `payment_term_template_id` / `percent`, `amount_cents`, `due_date`, `status`, `invoice_id` | Deposit, Progress, Final |
| `Payment` | Pagamento aplicado | `invoice_id`, `provider_connection_id`, `external_id`, `method`, `amount_cents`, `paid_at`, `status`, `recorded_by` | `UNIQUE(provider_connection_id, external_id)`. **Overpayment bloqueado** |
| `Refund` | Estorno | `payment_id`, `amount_cents`, `refunded_at`, `reason`, `external_id` | Nunca apaga o original |
| `CommissionRule` | Regra de comissão | `scope_type`, `calc_type`, `rate_bps` ou `fixed_cents`, `trigger` | Venda, margem, fixo, por serviço ou combinação |
| `Commission` | Comissão calculada | `salesperson_membership_id`, `project_id`, `estimate_id`, `rule_snapshot`, `amount_cents`, `status` | Projected → Earned → Approved → **Paid congela** |
| `CommissionAdjustment` | Ajuste auditável | `commission_id`, `amount_delta_cents`, `reason`, `created_by` | — |

Accounts Receivable e aging são **derivados** de Invoice e Payment, não entidade própria.

---

# K. Comunicação e notificações

Sem inbound na V1, não há conversa. O modelo registra **envio e entrega**.

| Entidade | Responsabilidade | Campos-chave | Regras |
|---|---|---|---|
| `OutboundMessage` | Mensagem enviada ao cliente | `workspace_id`, `client_id`, `contact_person_id`, `entity_type`, `entity_id`, `channel`, `template_id`, `subject`, `body`, `sent_by`, `sent_at` | Aparece como aba Communications no Customer e no Job |
| `MessageDeliveryEvent` | Evento do provider | `outbound_message_id`, `event_type`, `occurred_at`, `provider_event_id` | Sent, Delivered, Opened, Bounced, Failed. `UNIQUE(provider_event_id)` para idempotência |
| `MessageTemplate` | Template | `category`, `channel`, `name`, `subject`, `body`, `locale`, `active` | Variáveis validadas. **Um registro por idioma** |
| `CommunicationConsent` | Consentimento por contato e canal | `contact_person_id`, `channel`, `status`, `source`, `updated_at` | **Existe desde a V1, mesmo sem SMS.** Opt-out bloqueia envio |
| `Notification` | Notificação do usuário | `membership_id`, `event_type`, `title`, `body`, `deep_link`, `severity`, `read_at` | — |
| `NotificationPreference` | Preferência | `membership_id`, `event_type`, `in_app`, `email`, `push`, `quiet_hours` | Canal `sms` fica reservado, desabilitado na V1 |
| `MandatoryNotificationRule` | Notificação obrigatória | `workspace_id`, `event_type`, `required_channels` | O usuário não desliga |
| `PushSubscription` | Inscrição Web Push do PWA | `membership_id`, `endpoint`, `keys`, `user_agent`, `created_at` | Substitui o token de push nativo |

---

# L. Client Portal

Este domínio **não existia** na v1.0.

| Entidade | Responsabilidade | Campos-chave | Regras |
|---|---|---|---|
| `PortalAccess` | Acesso do contato ao portal | `workspace_id`, `client_id`, `contact_person_id`, `status`, `password_set_at`, `last_login_at` | **Não é Membership.** Senha é opcional |
| `PortalGrant` | Magic link assinado | `portal_access_id`, `token_hash`, `purpose`, `entity_type`, `entity_id`, `expires_at`, `consumed_at`, `issued_by`, `ip_used` | Uso único por finalidade. **Token nunca em claro.** Expirado permite reenvio |
| `PortalSession` | Sessão ativa | `portal_access_id`, `started_at`, `expires_at`, `revoked_at` | Escopo restrito ao próprio cliente |
| `PortalSettings` | Visibilidade por Workspace | `workspace_id`, `show_progress`, `show_daily_logs`, `show_photos`, `allow_document_upload`, `branding_*` | **Progresso oculto por padrão** |
| `PortalRequest` | Solicitação do cliente | `workspace_id`, `client_id`, `request_type`, `payload`, `status`, `reviewed_by` | Nova Property, serviço ou orçamento. **Nunca cria registro direto** |

`EstimateSignature` e `ChangeOrderSignature` referenciam `portal_grant_id`, ligando a assinatura ao link exato que a originou.

---

# M. Integrações, auditoria e suporte

| Entidade | Responsabilidade | Campos-chave | Regras |
|---|---|---|---|
| `IntegrationConnection` | Conexão OAuth do Workspace | `provider`, `type`, `status`, `external_account_id`, `encrypted_credentials_ref`, `last_sync_at`, `default_for_type` | Connected, Disconnected, Error, Needs Reauthorization |
| `ExternalObjectLink` | Mapeia interno ↔ externo | `connection_id`, `entity_type`, `entity_id`, `external_id`, `sync_status`, `synced_at` | Evita casamento por nome |
| `InboundWebhookEvent` | Evento recebido de provider | `provider`, `provider_event_id`, `payload`, `signature_valid`, `processed_at`, `attempts` | `UNIQUE(provider, provider_event_id)`. Stripe e QuickBooks |
| `OutboxEvent` | Evento de domínio transacional | `workspace_id`, `event_type`, `entity_type`, `entity_id`, `payload`, `occurred_at`, `published_at`, `correlation_id` | Gravado **na mesma transação** do dado de negócio |
| `AuditLog` | Registro técnico imutável | `workspace_id`, `actor_type`, `actor_id`, `action`, `entity_type`, `entity_id`, `before_json`, `after_json`, `occurred_at`, `ip` | Append-only. Hard delete proibido |
| `ActivityEvent` | Timeline legível | `workspace_id`, `entity_type`, `entity_id`, `event_type`, `actor`, `summary`, `occurred_at` | Respeita permissão |
| `ApprovalRequest` / `ApprovalDecision` | Aprovação e decisão | `type`, `entity_type`, `entity_id`, `requested_by`, `status` / `decided_by`, `decision`, `reason` | Rejeição exige motivo |
| `ApprovalDelegation` | Delegação temporária | `from_membership_id`, `to_membership_id`, `approval_types`, `start_at`, `end_at` | Auditável |
| `RecycleBinEntry` | Soft delete e restauração | `entity_type`, `entity_id`, `deleted_by`, `deleted_at`, `purge_after` | Não se aplica a registro protegido |
| `SupportAccessSession` | Sessão de suporte autorizada | `workspace_id`, `admin_user_id`, `authorized_by`, `reason`, `start_at`, `end_at` | Banner permanente e auditoria |

---

# 2. Máquinas de estado

| Domínio | Estados | Regra |
|---|---|---|
| CRM Lifecycle | `LEAD` → `CUSTOMER` → `PAST_CUSTOMER` | Estimate aprovado promove a Customer |
| Sales Opportunity | Etapas configuráveis com semântica Won e Lost | Lost exige motivo |
| Estimate | `DRAFT` → `SENT` → `VIEWED` → `AWAITING_APPROVAL` → `APPROVED` \| `REJECTED` \| `EXPIRED` \| `CANCELLED` | Approved é imutável |
| Project | `NEW` → `APPROVED` → `SCHEDULED` → `IN_PROGRESS` → `WAITING` → `COMPLETED` → `INVOICED` → `PAID` → `CLOSED` | Pipeline configurável |
| Project Service | Status configuráveis; no mínimo Scheduled, In Progress, Waiting, Done | Crew altera subconjunto permitido |
| Change Order | `REQUESTED` → `UNDER_REVIEW` → `READY` → `SENT` → `VIEWED` → `APPROVED` \| `REJECTED` \| `CANCELLED` | Approved é imutável e exige assinatura |
| Material Request | `REQUESTED` → `APPROVED` \| `REJECTED` → `PURCHASED` → `DELIVERED` | Várias compras por solicitação |
| Invoice | `DRAFT` → `SENT` → `OPEN` \| `PARTIALLY_PAID` → `PAID` \| `VOID` | Status pode vir do provider |
| Commission | `PROJECTED` → `EARNED` → `APPROVED` → `PAID` | Paid congela |
| Subscription | `TRIAL` → `ACTIVE`; `PAST_DUE` → `GRACE` → `READ_ONLY` → `SUSPENDED` → `ACTIVE` | Dados nunca são apagados |
| Portal Grant | `ISSUED` → `CONSUMED` \| `EXPIRED` \| `REVOKED` | Uso único por finalidade |

---

# 3. Regras de integridade

1. Nenhuma referência entre Workspaces distintos, mesmo com ID válido.
2. Estimate aprovado não é editável; escopo novo vira Change Order ou novo Estimate.
3. Job com Estimate aprovado não permite troca simples de Client ou Property.
4. `DailyLog` é único por Service e data. Após DONE, apenas novas fotos; reabertura é autorizada e registrada.
5. Mudança de quantidade ou Crew que altere duração dispara o cálculo de agenda e registra a decisão da Escadinha.
6. Conflito de agenda não pode ser ocultado; override é rastreável.
7. Atribuir Crew parceira com seguro vencido alerta ou bloqueia, conforme configuração do Workspace.
8. `Payment` não excede o saldo da Invoice enquanto Customer Credit estiver fora do escopo.
9. Total faturado não excede Contract Value mais Change Orders aprovados, salvo exceção com permissão e justificativa.
10. `Payment` e `Refund` são append-only.
11. Comissão `PAID` não recalcula sozinha.
12. Opt-out bloqueia envio no canal correspondente.
13. `PortalGrant` é de uso único, expira, e nunca alcança dado de outro cliente.
14. Isenção fiscal só zera imposto com certificado dentro da validade.
15. Permissão é avaliada com Workspace, papel e escopo de Location juntos. Deep link não contorna autorização.
16. Hard delete é proibido em AuditLog, pagamentos, documentos assinados e registros protegidos.
17. `OutboxEvent` é gravado na mesma transação do dado de negócio.

---

# 4. Índices e unicidades

| Entidade | Índice ou unicidade | Objetivo |
|---|---|---|
| `Membership` | `UNIQUE(user_id, workspace_id)` | Um vínculo por usuário e Workspace |
| `DailyLog` | `UNIQUE(project_service_id, log_date)` | Um log por serviço por dia |
| `Estimate` | `UNIQUE(workspace_id, estimate_number)` | Numeração humana |
| `Project` | `UNIQUE(workspace_id, project_number)` | Numeração humana |
| `InvoiceRecord`, `Payment` | `UNIQUE(provider_connection_id, external_id)` | Idempotência financeira |
| `InboundWebhookEvent` | `UNIQUE(provider, provider_event_id)` | Evento duplicado não reprocessa |
| `MessageDeliveryEvent` | `UNIQUE(provider_event_id)` | Idempotência de entrega |
| `PortalGrant` | `UNIQUE(token_hash)` + índice em `expires_at` | Busca e expiração |
| `ScheduleEvent` | Índice por recurso e intervalo | Detecção de conflito |
| `ClientAccount` | `(workspace_id, lifecycle_status, assigned_salesperson_id)` | Filtros do CRM |
| `ContactPerson` | `(workspace_id, normalized_email)`, `(workspace_id, normalized_phone)` | Busca e duplicidade |
| `Property` | `(workspace_id, normalized_address)` | Busca e duplicidade |
| `OutboxEvent` | `(published_at NULL, occurred_at)` | Varredura do publisher |
| `AuditLog`, `ActivityEvent` | `(entity_type, entity_id, occurred_at DESC)` | Timeline e auditoria |
| `SubcontractorProfile` | Índice em `insurance_expires_on` | Alerta de vencimento |

---

# 5. Dados derivados

Não são fonte primária: Accounts Receivable e aging; Total Contract Value do Job; Open Balance; utilização de Crew; KPIs do dashboard; "Requer Atenção".

---

# 6. Eventos de domínio

Publicados via `OutboxEvent` e consumidos por `pgmq`:

`client.created` · `opportunity.created` · `estimate.sent` · `estimate.viewed` · `estimate.approved` · `estimate.rejected` · `project.created` · `project.status_changed` · `service.scheduled` · `service.rescheduled` · `service.completed` · `stairstep.applied` · `daily_log.updated` · `change_order.requested` · `change_order.approved` · `material_request.created` · `purchase.recorded` · `invoice.created` · `invoice.sync_failed` · `payment.received` · `payment.refunded` · `commission.earned` · `portal.grant_issued` · `portal.document_signed` · `subcontractor.insurance_expiring` · `subscription.payment_failed` · `subscription.suspended`

---

# 7. Removido da V1

Entidades do modelo v1.0 que **saem junto com o escopo**, e voltam apenas por decisão explícita:

`AutomationDefinition`, `AutomationRun`, `AutomationStepRun` · `Conversation`, `ConversationParticipant`, `Message`, `MessageAttachment`, `PinnedMessage` · `WebhookEndpoint`, `WebhookDelivery` · `McpConfiguration` · `ApiCredential` · `FinancingProvider`, `FinancingApplication` · `Task`, `TaskFollower`, `TaskComment`, `TaskChecklistItem` · `CustomFieldDefinition`, `CustomFieldValue` · `FeatureFlag` · `SupportTicket` · `IntegrationHealthEvent` · `SuperAdminUser`

`Note` permanece e cobre a necessidade de registro textual. Follow-up permanece como `ClientAccount.next_followup_at`.
