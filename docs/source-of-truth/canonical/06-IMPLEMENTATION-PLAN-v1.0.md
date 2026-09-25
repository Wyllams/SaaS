# SaaS — Implementation Plan v1.0

- **Status:** Approved
- **Date:** 2026-09-25
- **Approval record:** approved by the product owner on 2026-09-25; PR #13 merged into `main`
- **Implementation authorization:** Epic 0 explicitly authorized by the product owner on 2026-09-25
- **Product brand:** intentionally undefined

## 1. Purpose

This document defines the order, dependencies, delivery gates and quality requirements for turning the approved product/technical documents and validated PoCs into production-grade SaaS implementation.

It is the sixth document in the product documentation set.

The implementation rule is:

`approved requirement → accepted architecture → production contract → tested implementation → evidence → release gate`

PoC code is evidence, not production code.

## 2. Authoritative inputs

This plan is derived from:

- `docs/source-of-truth/canonical/01-PRD.md`
- `docs/source-of-truth/canonical/02-TRD-OFICIAL.md`
- `docs/source-of-truth/canonical/03-APP-FLOW-OFICIAL.md`
- `docs/source-of-truth/canonical/04-UI-UX-DESIGN.md`
- `docs/source-of-truth/canonical/05-BACKEND-SCHEMA-DOMAIN-MODEL.md`
- `docs/source-of-truth/supporting/TECHNICAL-VALIDATION-POC-PLAN.md`
- `docs/source-of-truth/CURRENT-DECISIONS.md`
- `docs/architecture/TECHNICAL-ARCHITECTURE.md`
- accepted ADRs in `docs/adr/`
- PoC evidence preserved in `poc/*` branches

### Precedence

When sources differ:

1. `CURRENT-DECISIONS.md`
2. post-PoC consolidated technical architecture
3. accepted ADRs
4. approved TRD
5. official App Flow / Backend Domain Model / UI/UX / PRD
6. PoC evidence for reproduction/debugging
7. discovery questionnaires

Historical implementation plans from previous codebases do not control this plan.

## 3. Decisions already closed

The following technical decisions are accepted for implementation:

- TypeScript monorepo;
- pnpm + Turborepo;
- PostgreSQL as transactional source of truth;
- Drizzle ORM + Drizzle Kit with native SQL escape hatch;
- Supabase connection strategy defined by ADR-002;
- Tailwind CSS 4 + semantic CSS-variable tokens;
- BullMQ + Valkey/Redis-compatible queue infrastructure;
- Supabase Realtime Broadcast with private tenant-scoped channels;
- Stripe Connect Accounts v2 + Direct Charges;
- QuickBooks Online Accounting behind an adapter;
- React Native + Expo + Expo Router for mobile;
- OpenTelemetry + structured trace-correlated logs;
- Sentry for Error Monitoring + Tracing.

### Explicitly not adopted

- SMS/Twilio is outside the current product scope.

### Conditional / deferred

- Resend remains usable only within the validated scope.
- The public inbound webhook proof is deferred and does not block other product work.
- Production inbound e-mail processing cannot be declared complete until that gate is executed.

## 4. Foundation gates before feature implementation

These items must be handled in Epic 0 before application features are built on top of them.

### G0.1 — Web framework authority

The approved TRD selected Next.js App Router, and a repository validation branch proved the candidate works with the approved monorepo, Tailwind and React stack.

The post-PoC consolidated architecture still records the final Web framework decision as open.

Required action:

- reconcile those two authorities;
- approve/reject the proposed Web framework ADR;
- merge the accepted decision before the definitive `apps/web` scaffold becomes product code.

### G0.2 — API framework authority

The TRD selected NestJS + FastifyAdapter.

The post-PoC consolidated architecture records the final API framework decision as open because no dedicated API-framework PoC/accepted ADR was produced.

Required action:

- create the API-framework ADR;
- confirm or revise the TRD choice;
- do not treat a placeholder in a PoC as approval.

### G0.3 — Deployment topology

The TRD proposed Vercel + Render + Supabase + managed queue infrastructure.

The post-PoC architecture intentionally leaves final deployment topology open.

Required action before Staging bootstrap:

- define Web hosting;
- API hosting;
- Worker hosting;
- database/auth/storage/realtime projects;
- queue service;
- environment boundaries;
- secrets ownership;
- region strategy.

Local implementation may proceed while this decision is being finalized, but Staging must not be assembled from assumptions.

### G0.4 — Branding

The final product name is not decided.

Until a branding decision exists:

- package names;
- domains;
- namespaces;
- environment variables;
- documentation titles;
- internal service names

must remain brand-neutral.

## 5. Repository target

The implementation converges on one TypeScript monorepo:

```text
apps/
  web/
  api/
  worker/
  mobile/

packages/
  api-client/
  design-tokens/
  ui-web/
  domain-types/
  validation/
  config/
```

Additional packages may be introduced only when they represent a real reusable boundary.

Rules:

- apps are deployable units;
- packages are reusable contracts/implementation libraries;
- no circular workspace dependencies;
- one package manager: pnpm;
- PoC packages are not promoted wholesale;
- provider SDK objects do not become domain models.

## 6. Implementation sequence

The sequence follows the handoff defined by the Technical Validation & PoC Plan.

```text
Epic 0  Foundation / Monorepo / CI / Environments
   ↓
Epic 1  Identity / Workspace / Membership / Permissions
   ↓
Epic 2  Data Architecture / Database / Storage / Audit
   ↓
Epic 3  CRM + Sales Foundations
   ↓
Epic 4  Jobs + Services + Scheduling Core
   ↓
Epic 5  Field Operations / Daily Logs / Change Orders / Materials
   ↓
Epic 6  Financial / Payments / Accounting Integrations
   ↓
Epic 7  Communications / Inbox / Tasks / Automations
   ↓
Epic 8  Client Portal
   ↓
Epic 9  Mobile Hardening / Push / Deep Links
   ↓
Epic 10 Reports / Super Admin / Entitlements
   ↓
Epic 11 Security Hardening / Performance / GA Readiness
```

No later Epic implicitly authorizes skipping a blocking gate in an earlier Epic.

---

# Epic 0 — Foundation / Monorepo / CI / Environments

## Goal

Create the definitive production foundation from the validated technical decisions without copying experimental PoC code blindly.

## Required work

1. Close G0.1 Web framework authority.
2. Close G0.2 API framework authority.
3. Close G0.3 deployment topology before Staging.
4. Create definitive `apps/web`, `apps/api`, `apps/worker`, `apps/mobile`.
5. Create shared packages only from approved contracts.
6. Install pinned runtime/package-manager versions.
7. Enable CI quality gates.
8. Configure migrations through Drizzle Kit.
9. Establish environment configuration contract for Development, Staging and Production.
10. Establish secrets policy; no production secret in Git/client bundles.
11. Install observability baseline from the start.
12. Establish health/readiness contracts for API/Worker.
13. Document local bootstrap and Staging bootstrap.
14. Keep all brand identifiers neutral.

## CI baseline

Every PR must be capable of running the applicable subset of:

- dependency integrity;
- lint;
- TypeScript;
- unit tests;
- integration tests;
- database/migration validation;
- build;
- security/dependency/secret checks;
- E2E smoke where applicable.

## Exit gate

Epic 0 exits only when:

- framework authority is reconciled;
- monorepo builds reproducibly from committed lockfiles;
- applications/packages have explicit ownership boundaries;
- CI is green;
- Development bootstrap is reproducible;
- Staging topology is explicitly documented before creation;
- observability is active in the application foundation;
- no PoC secret/fixture/provider ID has leaked into product configuration.

---

# Epic 1 — Identity / Workspace / Membership / Permissions

## Product scope

Implement the tenancy and authorization foundation required by every later domain.

Primary App Flow surfaces:

- `SCR-AUTH-001..008`
- `SCR-ONB-001..002`
- user/workspace/location controls used by Settings and global shell

## Domain scope

- User / identity;
- Workspace;
- Location;
- Membership;
- Role;
- Permission;
- scopes;
- Invite;
- portal-access separation;
- consent/onboarding state required by the approved product flow.

## Required work

1. Implement approved authentication methods from the TRD.
2. Keep external identity separate from business authorization.
3. Create workspace membership and location scope contracts.
4. Implement granular permissions/scopes.
5. Implement invitation lifecycle.
6. Implement multi-workspace selection/switching.
7. Apply RLS/authorization at the database/backend boundary.
8. Establish Primary Owner invariant.
9. Implement authorization-safe deep-link resolution.
10. Emit security/audit events for privileged changes.

## Mandatory tests

- unauthenticated;
- authenticated without membership;
- one workspace;
- multiple workspaces;
- suspended membership;
- cross-workspace direct-ID attempt;
- location scope violation;
- self-elevation attempt;
- invite replay/expiry;
- owner-transfer invariant;
- permission changed during active session.

## Exit gate

No later tenant-owned mutation is released until cross-tenant and permission-negative tests pass.

---

# Epic 2 — Data Architecture / Database / Storage / Audit

## Goal

Turn the logical Backend Domain Model into a migration-controlled PostgreSQL foundation.

## Domain infrastructure

- relational schema conventions;
- foreign keys;
- tenant keys;
- timestamps/timezones;
- money precision;
- immutable/versioned records;
- Audit Log;
- Activity events;
- transactional Outbox;
- idempotency;
- integration mappings;
- file metadata;
- storage abstraction;
- search primitives.

## Required work

1. Translate logical entities into physical schema incrementally.
2. Keep `workspace_id`/tenant ownership explicit where applicable.
3. Implement real foreign keys and logical uniqueness constraints.
4. Implement audit/activity separation.
5. Implement outbox + idempotency infrastructure.
6. Establish FileService contract and private object-storage rules.
7. Establish signed URL policy.
8. Configure FTS/`pg_trgm` search primitives where required.
9. Keep migration history in Git.
10. Define forward migration and recovery procedure.
11. Apply the accepted pooling strategy per runtime.

## Exit gate

- migrations reproduce from empty Development database;
- tenant constraints/RLS tests are automated;
- backup/restore approach is documented for future release gates;
- storage authorization cannot be bypassed by object path guessing;
- no business domain is forced to store binary payloads in PostgreSQL.

---

# Epic 3 — CRM + Sales Foundations

## Product scope

CRM and sales from lead/customer through approved estimate.

App Flow surfaces:

- `SCR-CRM-001..005`
- `SCR-SALES-001..007`

## Backend domains/entities

- ClientAccount;
- ContactPerson;
- Property;
- SalesOpportunity;
- LeadSource;
- Tags / custom fields;
- pipelines/stages;
- SalesAppointment;
- Estimate;
- EstimateVersion;
- EstimateLineItem;
- recipients/views/signatures;
- templates/payment terms.

## Implementation slices

### 3A — CRM

- create/update/archive clients;
- contacts and multiple properties;
- normalization/deduplication warnings;
- notes/tags/custom fields;
- permissions and location scope;
- search/list/detail contracts.

### 3B — Sales pipeline

- opportunities;
- configurable stages;
- appointments/follow-ups;
- ownership/assignment rules.

### 3C — Estimates

- draft;
- versioning;
- line items;
- money/tax/discount precision;
- preview;
- send-ready state;
- view tracking;
- approval/rejection/signature;
- immutable approved snapshot;
- conversion command that creates operational work exactly once.

## UI/UX gate

Implement the approved list/table, pipeline/kanban, estimate editor/preview and responsive states using the approved design tokens/components.

## Mandatory tests

- duplicate CRM records;
- cross-tenant access;
- invalid money/rounding;
- concurrent estimate conversion;
- stale/non-active estimate approval;
- immutable approved version;
- unauthorized financial fields;
- expired/rejected estimate behavior.

## Exit gate

An approved estimate can safely and idempotently create the downstream Job/Project foundation without losing the accepted commercial snapshot.

---

# Epic 4 — Jobs + Services + Scheduling Core

## Product scope

Create the operational core after sale.

App Flow surfaces:

- `SCR-JOB-001..013`
- `SCR-SCH-001..006`
- `SCR-TEAM-001..005` where required by scheduling

## Backend domains/entities

- Project/Job;
- ProjectService;
- Project statuses;
- Service catalog/statuses;
- ProjectEstimateSource;
- milestones;
- crews/teams/members;
- assignments;
- production units/capacity;
- ScheduleEvent;
- recurrence;
- availability;
- holidays;
- schedule conflicts;
- Stair-Step change sets.

## Required work

1. Create Job from approved source.
2. Maintain service-level execution units.
3. Implement project/service transition rules.
4. Implement crew/team assignment.
5. Implement production-capacity calculation.
6. Implement schedule create/move/resize contracts.
7. Detect conflicts server-side.
8. Record authorized conflict override.
9. Implement recurrence semantics.
10. Implement Stair-Step preview/apply/undo contract.
11. Preserve before/after audit for schedule changes.
12. Publish selected realtime updates only after persistent state is committed.

## Mandatory tests

- valid/invalid status transitions;
- double-start/double-complete;
- concurrent scheduling;
- crew/member conflict;
- holiday/business-hours boundaries;
- timezone and U.S. DST;
- completed service excluded from Stair-Step;
- conflict override authorization;
- recurrence one/future/all;
- cross-tenant resource assignment.

## Exit gate

Scheduling state is authoritative in PostgreSQL, conflict-safe and recoverable without relying on client state or Realtime delivery.

---

# Epic 5 — Field Operations / Daily Logs / Change Orders / Materials

## Product scope

Operational execution in the field.

App Flow surfaces:

- `SCR-FIELD-001..007`
- field portions of Job/Service screens

## Backend domains/entities

- service checklists;
- DailyLog / DailyLogWorker;
- MediaAsset;
- PhotoLink / DocumentLink;
- field issues;
- ChangeOrder / items / signature;
- MaterialRequest / items;
- Vendor / Purchase / PurchaseOrder where operationally required.

## Required work

1. Today/assigned-work read model.
2. Service mobile detail with strict field permissions.
3. Checklist execution.
4. One Daily Log per service/day.
5. Photo capture/upload pipeline.
6. Post-completion lock rules.
7. Report Problem flow.
8. Field Change Order request without pricing.
9. Material request flow.
10. Customer-availability/signature completion path.
11. Service completion blocker/warning engine.
12. Push-ready domain events for later mobile delivery.

## Mandatory tests

- duplicate Daily Log;
- unauthorized service;
- upload validation;
- partial upload failure;
- edit after completion;
- re-open authorization;
- field user seeing restricted financial data;
- pending blocker before completion;
- change-order approval snapshot immutability.

## Exit gate

A field user can execute assigned work safely without gaining broader tenant/financial access.

---

# Epic 6 — Financial / Payments / Accounting Integrations

## Product scope

Invoices, payments, refunds, receivables, purchases, commissions and approved provider integrations.

App Flow surfaces:

- `SCR-FIN-001..008`
- `SCR-PUR-001..004`

## Backend domains/entities

- InvoiceRecord / InvoiceLine;
- PaymentSchedule / items;
- Payment / Refund;
- financing records;
- Commission / rules / adjustments;
- Purchase / PurchaseOrder / Vendor;
- provider connections and object mappings.

## Stripe

Implement behind a PaymentProvider adapter using the accepted Stripe Connect architecture.

Required:

- connected-account mapping;
- direct-charge model;
- idempotent payment creation;
- provider-authoritative status;
- signed/idempotent webhook processing;
- no PAN/CVC/bank credentials stored.

## QuickBooks

Implement behind an AccountingProvider adapter.

Required:

- OAuth connection lifecycle;
- Customer/Invoice/Payment mappings;
- SyncToken concurrency handling;
- webhook-as-hint + authoritative refetch;
- periodic reconciliation;
- provider outage must not block core operations.

## Financial invariants

- no floating-point money source of truth;
- emitted invoice snapshot is immutable;
- payment/refund history is append-oriented;
- no silent overwrite of provider conflicts;
- no duplicate financial side effect on retry;
- external API call is not held inside a long database transaction.

## Mandatory tests

- duplicate provider event;
- invalid signature;
- out-of-order event;
- timeout/retry;
- partial/failed payment;
- refund boundaries;
- stale QuickBooks SyncToken;
- overbilling/overpayment guards;
- cross-tenant provider mapping;
- reconciliation after missed webhook.

## Exit gate

Financial state converges safely with providers and remains auditable under retries, duplicates and temporary provider outages.

---

# Epic 7 — Communications / Inbox / Tasks / Automations

## Product scope

App Flow surfaces:

- `SCR-INB-001..004`
- `SCR-TASK-001..003`
- `SCR-NOT-001`
- `SCR-APR-001`
- `SCR-AUT-001..004`
- related Settings surfaces

## Domains

- Conversation / participants;
- Message / attachments / delivery events;
- communication consent;
- templates;
- Tasks / followers / comments / checklist;
- Approval requests/decisions/delegation;
- Notification / preferences;
- Automation definitions/runs/steps.

## Channel scope

Current implementation channels:

- in-app;
- e-mail within validated/approved capabilities;
- push where mobile capability exists.

**SMS is not implemented.**

## Resend rule

- outbound work may proceed behind EmailProvider abstraction when it stays inside validated behavior;
- inbound/public-webhook production completion remains gated by the deferred real webhook proof;
- inbound email is untrusted input;
- signature/replay/idempotency requirements remain mandatory.

## Automation engine

Use declarative WHEN → IF → THEN definitions.

Required:

- no arbitrary customer JavaScript;
- loop prevention;
- execution history;
- retry/error visibility;
- provider failure never reported as successful delivery.

## Exit gate

Communications and automations remain permission-aware, idempotent and auditable without reintroducing SMS.

---

# Epic 8 — Client Portal

## Product scope

App Flow surfaces:

- `SCR-PORT-001..009`

## Security boundary

Client Portal access is separate from internal WorkspaceMembership roles.

Authorization derives from:

- client/contact identity;
- related properties/projects;
- explicit customer visibility;
- portal-specific settings.

## Required work

1. Portal authentication/access boundary.
2. Portal Home.
3. Properties.
4. Project visibility.
5. Estimate approval/rejection/signature.
6. Change Order review/decision.
7. Customer-visible documents.
8. Invoices/payments/financing status.
9. Service/estimate request intake.
10. profile updates within permitted fields.

## Mandatory negative tests

- client A accessing client B;
- hidden document;
- internal note/chat leakage;
- project not related to contact;
- expired/replayed approval link;
- forbidden financial data;
- changing URL IDs manually.

## Exit gate

A client can access only explicitly authorized customer-facing data and actions.

---

# Epic 9 — Mobile Hardening / Push / Deep Links

## Goal

Turn the validated Expo foundation into the production mobile application for approved field/sales flows.

## Required work

1. Promote the accepted Expo decisions into `apps/mobile`.
2. Implement authenticated navigation.
3. Implement universal/app-link routing when deployment domains exist.
4. Revalidate server permissions on every deep link.
5. Implement push-notification adapter and navigation.
6. Implement camera/gallery upload with progress/retry.
7. Keep sensitive auth material in secure storage.
8. Revalidate server state after app resume.
9. Establish Development/Preview/Production EAS profiles.
10. Validate representative iOS/Android device flows before release.

## Scope guard

Offline Mode remains outside V1.

Local cache must never be presented as successfully persisted server state when connectivity failed.

## Exit gate

Critical mobile flows pass on representative device builds and do not bypass API authorization.

---

# Epic 10 — Reports / Super Admin / Entitlements

## Product scope

App Flow surfaces:

- `SCR-REP-001..002`
- `SCR-SEARCH-001`
- `SCR-HELP-001`
- `SCR-SA-001..007`
- remaining Settings/plan/entitlement surfaces

## Domains

- Plans;
- limits/entitlements;
- subscriptions/usage;
- feature flags;
- reports/projections;
- global search;
- platform health;
- support access;
- public API/webhooks/MCP where enabled by approved plan/permissions.

## Required work

1. Entitlements as data/configuration, not scattered plan-name conditionals.
2. Usage metering for approved features.
3. Global search scoped by tenant/permission/location.
4. Report filters, projections and exports.
5. Super Admin boundary separate from tenant access.
6. Audited Support Access.
7. Feature-flag rollout.
8. Integration-health surface.
9. Public API credentials/scopes.
10. customer-configured outbound webhooks with signatures/retries/logs.
11. MCP uses application services + authorization + audit; never generic SQL/database access.

## Exit gate

Platform administration cannot silently bypass tenant privacy/authorization and support access is explicit and auditable.

---

# Epic 11 — Security Hardening / Performance / GA Readiness

## Goal

Close launch-critical risks after the functional product is integrated.

## Security

- full cross-tenant/IDOR review;
- permission/scopes regression;
- webhook signature/replay testing;
- secret inventory/rotation process;
- rate limits;
- XSS/CSRF/SSRF/open-redirect review where applicable;
- file-upload threat controls;
- dependency/supply-chain checks;
- logs/traces redaction;
- privileged/support access review.

## Data reliability

- backup strategy validated;
- restore drill in isolated environment;
- migration recovery procedure;
- financial reconciliation;
- queue dead-letter/reprocessing procedure;
- provider outage behavior;
- retention/export/delete behavior.

## Performance

- API/load tests on critical flows;
- database indexes/query review;
- queue wait/worker throughput;
- browser performance;
- mobile upload/deep-link reliability;
- capacity review before each release stage.

## Quality

- meaningful unit/integration coverage;
- real PostgreSQL integration tests;
- queue integration tests;
- Web E2E;
- Mobile E2E;
- accessibility review against the approved UI/UX rules;
- error/loading/empty/permission/read-only states;
- production-like Staging smoke.

## Operations

- dashboards/alerts;
- request/correlation trace path;
- runbooks;
- incident response;
- safe deploy/rollback;
- feature flags where justified;
- post-deploy smoke tests.

## Exit gate

General Availability is not declared until critical security, restore, observability, financial integrity and E2E gates have evidence.

---

# 7. Cross-cutting implementation rules

These rules apply to every Epic.

## 7.1 Authorization

- authentication never replaces authorization;
- browser/UI visibility is never an authorization boundary;
- tenant/resource scope is revalidated server-side;
- RLS is defense in depth, not the only application rule;
- direct-ID access is tested negatively.

## 7.2 Transactions and side effects

- database invariants use PostgreSQL transactions;
- external calls do not remain inside long transactions;
- external side effects use idempotency;
- retry paths are explicit and finite;
- domain state persists before realtime delivery.

## 7.3 Events

- events are versioned;
- event IDs are stable;
- tenant/resource context is explicit;
- consumers are idempotent;
- outbox is used where losing the event after commit would be unacceptable.

## 7.4 Observability

Every production path must be able to carry:

- request/correlation identity;
- trace context when applicable;
- structured logs;
- safe error context.

Never log secrets or unrestricted PII.

## 7.5 UI/UX

Implementation must follow the approved UI/UX document:

- semantic design tokens;
- approved navigation model;
- Desktop/Tablet/Mobile behavior;
- role-specific mobile surfaces;
- accessibility;
- explicit loading/empty/error/permission/read-only states;
- screen IDs retained for traceability.

## 7.6 Financial data

- money is never ordinary floating point;
- provider state is reconciled;
- signed/approved financial artifacts are immutable/versioned;
- refunds/adjustments preserve original history.

## 7.7 Files

- private by default;
- authorized signed access;
- content/type/size validation;
- tenant-scoped metadata;
- no trust in filename/MIME supplied by the client alone.

## 7.8 Naming

Until branding is approved, new implementation uses neutral technical identifiers.

Historical names may remain only in source evidence.

# 8. Definition of Done for an implementation slice

A slice is not done only because the UI renders.

Applicable completion evidence includes:

1. mapped PRD/App Flow requirement;
2. stable Screen ID when UI exists;
3. domain/application contract;
4. database migration/constraints/RLS when applicable;
5. authorization positive + negative tests;
6. unit/integration tests;
7. provider/queue/database tests where applicable;
8. loading/empty/error/permission states;
9. observability;
10. no secrets/PII leak;
11. rollback/recovery approach;
12. documentation/ADR update if the architecture changed;
13. PR review against scope and dependencies.

# 9. Release environments

## Development

- local or dedicated development infrastructure;
- synthetic/test data;
- provider sandbox/test modes where useful.

## Staging

- separate infrastructure;
- provider sandboxes;
- production-like configuration without real customer/financial activity;
- integration/E2E/release-gate environment.

## Production

- separate projects/secrets;
- production providers only after each provider gate is complete;
- backup/monitoring/alerts/runbooks;
- no PoC credentials or sandbox IDs.

# 10. Release stages

The release stages defined by the TRD remain:

1. Internal Alpha
2. Private Beta
3. Limited Production
4. General Availability

Progression is evidence-based, not calendar-based.

Each transition requires the security, data, observability, backup/recovery, support and capacity evidence appropriate to that stage.

# 11. Traceability map

| Implementation Epic | Primary source areas |
|---|---|
| 0 — Foundation | TRD architecture/CI/infrastructure + PoC ADRs |
| 1 — Identity | PRD identity/onboarding + App Flow Auth/Onboarding + Backend tenancy/IAM |
| 2 — Data | Backend Domain Model + TRD data/storage/audit/events |
| 3 — CRM + Sales | App Flow CRM/Sales + Backend CRM/Sales |
| 4 — Jobs + Scheduling | App Flow Jobs/Schedule + Backend Projects/Scheduling |
| 5 — Field | App Flow Field + Backend Daily Logs/Media/CO/Materials |
| 6 — Financial | App Flow Financial + Backend Financial + Stripe/QBO ADRs |
| 7 — Communications | App Flow Inbox/Tasks/Notifications/Automation + Backend Communications/Tasks |
| 8 — Client Portal | App Flow Portal + Client Portal authorization rules |
| 9 — Mobile | UI/UX Mobile/Field + Expo ADR |
| 10 — Platform | App Flow Reports/Search/Settings/Super Admin + Backend Plans/Integrations/Audit |
| 11 — Hardening | TRD security/testing/operations + observability ADR |

# 12. First execution after approval

After this document is approved and merged, implementation begins with **Epic 0 — Foundation**.

The first actions are:

1. resolve Web framework authority;
2. resolve API framework authority;
3. establish the definitive monorepo/application skeleton;
4. establish CI;
5. establish Development environment contract;
6. finalize Staging topology before creating it.

No feature Epic starts before the Foundation exit gate.
