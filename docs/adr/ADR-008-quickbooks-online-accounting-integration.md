# ADR-008 — QuickBooks Online Accounting Integration

- **Status:** Accepted
- **Date:** 2026-09-25
- **Validated by:** POC-08

## Context

CrewCommand requires an accounting integration for U.S. field-service companies.

The accounting integration must not turn QuickBooks into the operational database for Jobs, schedules, Crews, Daily Logs or other CrewCommand workflows. It must also tolerate provider outages, OAuth expiration and concurrent accounting-side edits.

The TRD selected QuickBooks Online as the first accounting provider.

## Decision

Use **QuickBooks Online Accounting API** behind a dedicated provider adapter.

CrewCommand remains the operational source of truth.

Initial synchronization covers at minimum:

- Customer;
- Invoice;
- Payment;
- Item/Service mappings required by Invoice lines.

## Evidence

POC-08 validated both the local integration contract and a real QuickBooks Online US Sandbox.

### Local

Validated:

- OAuth refresh request construction;
- Customer/Invoice/Payment mappings;
- Invoice-linked Payments;
- sparse update with `SyncToken`;
- raw-body webhook signature verification;
- duplicate webhook suppression;
- provider re-fetch/reconciliation strategy.

Representative hardened local run: `36091689185`.

### External Sandbox

GitHub Actions run `36092493464` passed against the real US Sandbox company.

Observed:

- OAuth refresh exchange: PASS;
- CompanyInfo: PASS;
- country: US;
- real Customer created;
- real Invoice created;
- Invoice SyncToken changed from `0` to `1` after update;
- stale update using SyncToken `0` rejected;
- stale-token HTTP response: 400;
- QBO stale-object error code: `5010`;
- real Payment created and linked to the Invoice;
- Invoice re-read after Payment had balance `0`;
- provider reconciliation: PASS.

## Source-of-truth boundary

### CrewCommand authoritative

CrewCommand owns operational state such as:

- Leads/Customers/Properties;
- Estimates and Jobs;
- Services/Work Items;
- Schedule;
- Crews/Teams;
- Daily Logs;
- operational tasks/approvals;
- internal payment/invoice workflow state.

### QuickBooks authoritative for provider-side accounting state

When an object has been synchronized, the current QBO accounting representation must be read/reconciled from the provider before CrewCommand claims provider-side sync success.

Webhook payloads are not sufficient by themselves.

## Provider mapping

CrewCommand stores an Integration Mapping for synchronized objects.

A mapping includes at minimum:

- Workspace;
- provider connection;
- CrewCommand entity type/id;
- QBO entity type/id;
- latest relevant `SyncToken`;
- sync status;
- last successful synchronization time;
- latest provider error where applicable.

## Customer matching

Never use display name alone as the production identity key.

Preferred order:

1. existing integration mapping;
2. deterministic external reference/mapping data where supported;
3. controlled matching using approved stable attributes;
4. explicit operator resolution for ambiguity.

## SyncToken concurrency control

QBO uses `SyncToken` for optimistic concurrency.

CrewCommand must:

1. persist the latest token;
2. send it on updates;
3. recognize stale-object conflicts such as QBO error `5010`;
4. re-fetch the current remote entity;
5. reconcile or surface the conflict;
6. retry only when safe.

Blind overwrite is prohibited.

## Invoice synchronization

CrewCommand decides when to create a QBO Invoice according to the product workflow and user action/settings.

The provider adapter maps:

- Customer;
- selected Invoice lines;
- Item/Service references;
- amounts;
- dates;
- CrewCommand reference metadata/notes as appropriate.

CrewCommand must store the QBO Invoice ID and current SyncToken.

## Payment synchronization

When CrewCommand records/synchronizes a Payment allocated to a known Invoice, the QBO Payment is linked to that Invoice.

The PoC proved that the linked Payment reduced the QBO Invoice balance to zero.

Manual CrewCommand payment methods remain distinct business operations; whether each method is synchronized to QBO is governed by accounting configuration.

## Webhook processing

QuickBooks webhooks are change hints.

Processing flow:

1. receive exact raw body;
2. verify Intuit signature;
3. map `realmId` to the correct Workspace/accounting connection;
4. deduplicate notification;
5. enqueue async reconciliation;
6. re-fetch current QBO entity;
7. compare against stored mapping/state;
8. apply safe integration-state updates;
9. persist sync/audit history.

Webhook delivery order is not trusted.

## OAuth

OAuth credentials/tokens are server-side secrets.

Production requirements:

- encrypt Client Secret/refresh token at rest;
- Development/Sandbox and Production separated;
- access token refreshed server-side;
- latest returned refresh token persisted atomically when Intuit rotates it;
- connection state visible to operators;
- reconnect flow when authorization becomes invalid.

## Failure behavior

QuickBooks failures must not block operational CrewCommand workflows.

Failed syncs:

- remain visible;
- store provider error details safely;
- use controlled retry/backoff;
- support manual retry;
- can be paused/reconnected without corrupting business state.

## Queues

External QBO writes/reconciliation run through the integration worker path rather than holding critical CrewCommand database transactions open.

No external QBO HTTP request is made while a CrewCommand database transaction remains open.

## Auditability

Record meaningful integration actions such as:

- connection/reconnection;
- Customer create/map;
- Invoice create/update;
- Payment create;
- stale SyncToken conflict;
- retry/manual retry;
- reconciliation result.

Sensitive OAuth material is never placed in normal application logs.

## Consequences

### Positive

- QBO fits U.S. accounting workflows.
- CrewCommand retains clean operational ownership.
- SyncToken provides explicit concurrency protection.
- webhook + re-fetch model handles duplicate/out-of-order delivery.
- provider outage is isolated from field operations.
- adapter boundary leaves room for future accounting providers.

### Trade-offs

- OAuth lifecycle requires secure token rotation storage.
- mapping/reconciliation adds integration complexity.
- QBO edits can create conflicts that require re-fetch/operator handling.
- accounting sync is eventually consistent rather than one distributed transaction.

## Guardrails

1. No name-only Customer matching.
2. No update without current SyncToken.
3. No webhook payload treated as complete provider truth.
4. No QBO HTTP call inside an open CrewCommand DB transaction.
5. No production credentials in Sandbox workflows.
6. No refresh/access tokens in logs.
7. Sync failures visible and retryable.
8. Provider connection belongs to a Workspace and is authorization-scoped.
9. CrewCommand operational workflows continue during QBO outages.
10. Integration behavior is covered by fixtures plus Sandbox tests.

## Evidence reference

- POC document: `docs/poc/POC-08.md`
- External Sandbox run: `36092493464`
- External artifact: `poc-08-qbo-external-evidence`
