# POC-08 — QuickBooks Online Sandbox

## Status

**IN PROGRESS — local integration contract being validated; external Sandbox OAuth authorization pending one-time consent.**

## Goal

Validate the QuickBooks Online integration model approved in the CrewCommand TRD:

- QuickBooks Online is the first accounting provider;
- CrewCommand remains the operational source of truth;
- QBO receives accounting records through an integration adapter;
- Customer/Invoice/Payment mappings are explicit;
- updates respect QBO `SyncToken`;
- OAuth refresh-token rotation is handled server-side;
- webhooks are treated as change hints and trigger provider re-fetch/reconciliation;
- duplicate/out-of-order webhook delivery cannot corrupt local state.

## External target

- QuickBooks Online US Sandbox company
- Sandbox API base: `https://sandbox-quickbooks.api.intuit.com`
- OAuth credentials stored only in GitHub Actions secrets:
  - `QBO_CLIENT_ID`
  - `QBO_CLIENT_SECRET`

The first authorization of a Sandbox company requires interactive OAuth consent. After that, CI will use a refresh token and realm/company ID.

## Local validation scope

1. OAuth refresh-token request contract;
2. Customer mapping;
3. Invoice mapping;
4. Payment-to-Invoice mapping;
5. sparse update with `Id + SyncToken`;
6. webhook signature verification using the raw body;
7. webhook duplicate suppression;
8. webhook strategy always re-fetches provider state;
9. Invoice balance/status/`SyncToken` reconciliation.

## External validation still required

1. authorize the CrewCommand app against the US Sandbox company;
2. refresh an OAuth access token using the development Client ID/Secret;
3. query CompanyInfo and verify realm ID;
4. create/find a Customer without name-only accidental duplication;
5. create/read an Invoice;
6. update Invoice with current `SyncToken`;
7. prove stale `SyncToken` update is rejected;
8. create a Payment linked to the Invoice;
9. re-read Invoice and confirm balance/status reconciliation;
10. prove provider state can be recovered by query/read;
11. preserve refreshed refresh token securely.

## Architecture guardrails

- No production QBO company or production credential is used in the PoC.
- CrewCommand never assumes a webhook payload is the final provider state.
- QBO IDs and `SyncToken` values are stored in integration mappings.
- Customer matching is never name-only in production.
- A provider outage must not block CRM/Job operations.
- Failed syncs remain visible and retryable.
