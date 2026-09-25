# POC-08 — QuickBooks Online Sandbox

## Status

**PASS — QuickBooks Online Sandbox integration validated end to end.**

## Goal

Validate the accounting integration model approved in the CrewCommand TRD:

- QuickBooks Online is the first accounting provider;
- CrewCommand remains the operational source of truth;
- QBO is accessed through a provider adapter;
- OAuth 2.0 refresh-token flow is server-side;
- Customer / Invoice / Payment mappings are explicit;
- updates respect QBO `SyncToken`;
- stale-token conflicts are detected rather than overwritten;
- webhook notifications are treated as change hints;
- provider re-read/reconciliation is authoritative.

## Environment

External validation used a **QuickBooks Online US Sandbox company**.

- API base: `https://sandbox-quickbooks.api.intuit.com`
- Company country returned by CompanyInfo: `US`
- Development credentials are stored only in GitHub Actions Secrets:
  - `QBO_CLIENT_ID`
  - `QBO_CLIENT_SECRET`
  - `QBO_REFRESH_TOKEN`
  - `QBO_REALM_ID`

No production QuickBooks company or production credential was used.

## Local contract evidence

The hardened local workflow passed before the external validation.

Validated:

1. OAuth refresh-token request uses HTTP Basic for Client ID/Secret;
2. Client Secret is not placed in the request body;
3. CrewCommand Customer → QBO Customer mapping;
4. CrewCommand Invoice → QBO Invoice mapping;
5. CrewCommand Payment → QBO Payment linked to a specific Invoice;
6. sparse updates require `Id + SyncToken`;
7. webhook signature verification uses the exact raw body;
8. modified webhook payloads fail verification;
9. duplicate webhook hints are suppressed;
10. webhook handling strategy re-fetches provider state;
11. Invoice balance/status/`SyncToken` reconciliation.

Representative hardened local run: `36091689185`.

## External Sandbox evidence

The real Sandbox job passed successfully on GitHub Actions run `36092493464` after the correct Development credentials were installed.

### OAuth

- Client ID / Client Secret authentication: PASS
- Refresh-token exchange: PASS
- Access token obtained without exposing it in logs
- Refresh-token hard-expiry information returned by Intuit: PASS
- The successful response did not rotate the refresh token during this specific run

### CompanyInfo

- CompanyInfo request: PASS
- Country: `US`
- The supplied realm/company identifier was accepted by the Sandbox API for all entity operations

Note: QBO's `CompanyInfo.Id` is not treated as a substitute for the OAuth `realmId`; the successful company-scoped API operations are the validation of the realm identifier.

### Customer

A real Sandbox Customer was created:

- Customer ID: `58`
- Display name contained the CrewCommand POC marker
- Customer mapping: PASS

### Invoice

A real Sandbox Invoice was created:

- Invoice ID: `145`
- amount: **125 USD**
- initial `SyncToken = 0`

The Invoice was then updated using its current SyncToken.

Result:

- updated `SyncToken = 1`
- SyncToken increment: PASS

### Stale SyncToken conflict

The PoC intentionally attempted a second Invoice update using the original stale `SyncToken = 0`.

QuickBooks rejected it:

- HTTP: `400`
- QBO error code: `5010`
- stale SyncToken rejection: **PASS**

This validates that CrewCommand must never blindly overwrite QBO state after concurrent changes.

### Payment and reconciliation

A real Sandbox Payment was created:

- Payment ID: `146`
- amount: **125 USD**
- linked to Invoice `145`: PASS

The Invoice was re-read from QuickBooks after the Payment.

Result:

- total: `125`
- final balance: `0`
- provider reconciliation: **PASS**

Therefore the accounting-side Invoice correctly reflected the applied Payment.

## Decision

CrewCommand V1 will integrate with **QuickBooks Online** through a dedicated accounting provider adapter.

### Source of truth

CrewCommand remains the operational source of truth for:

- CRM;
- Jobs/Services;
- operational scheduling;
- Crew/Team execution;
- Estimates and operational payment state.

QuickBooks is the accounting provider of record for accounting objects that CrewCommand explicitly syncs.

### Initial synchronized entities

V1 integration supports at minimum:

- Customer;
- Invoice;
- Payment;
- Service/Item mappings required to create Invoice lines.

Additional mappings may be introduced through explicit implementation work.

## Customer matching

Production sync must **not match customers by display name alone**.

Use stored integration mappings and provider IDs. If a mapping does not exist, use controlled matching rules and explicit conflict handling rather than silently attaching to a similarly named QBO customer.

## SyncToken rule

For QBO entities that use `SyncToken`:

1. store the latest provider `Id` and `SyncToken`;
2. include the latest token on update;
3. if QBO rejects a stale token, re-fetch the current provider object;
4. reconcile or surface a conflict;
5. never overwrite newer provider changes using an old token.

Error code `5010` was reproduced by this PoC and is part of the expected conflict path.

## Payment rule

A CrewCommand Payment synchronized to QuickBooks is linked to a specific QBO Invoice.

CrewCommand must not create an unallocated accounting payment when the internal payment is allocated to a known Invoice, unless a future explicit accounting rule supports that scenario.

## Webhooks

QBO webhooks are treated as **change notifications**, not complete authoritative business objects.

Webhook processing must:

- verify the signature against the exact raw body;
- identify Workspace/integration connection using the QBO realm/company mapping;
- deduplicate repeated notifications;
- enqueue provider re-fetch;
- retrieve the current QBO object;
- reconcile local integration state;
- tolerate duplicate/out-of-order delivery.

## OAuth lifecycle

Production implementation must:

- encrypt OAuth credentials/tokens at rest;
- keep Development/Sandbox and Production credentials separate;
- refresh access tokens server-side;
- persist the **latest refresh token returned by Intuit** when rotation occurs;
- track token expiry/connection health;
- require reauthorization when the provider connection can no longer refresh.

The PoC intentionally avoids logging access or refresh tokens.

## Provider outage behavior

QuickBooks outages or expired authorization must **not block CrewCommand CRM or Job operations**.

Instead:

- the accounting sync moves to a visible failed/pending state;
- retry/backoff is queued;
- operators can see the sync error;
- a manual retry/reconnect path exists.

## PoC data

POC-08 created Sandbox-only accounting records for validation. They are test records and have no production financial meaning.

## ADR

Decision recorded in:

`docs/adr/ADR-008-quickbooks-online-accounting-integration.md`
