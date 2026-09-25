# POC-07 — Stripe Connect

## Status

**PARTIAL PASS — local/CI architecture validated; external Connect v2 validation blocked on Stripe Sandbox.**

## Stripe environment discovered

The Stripe account currently connected to ChatGPT is:

- Account: `acct_1TNBRJCtl0zzV1rp`
- Environment: legacy test mode (`livemode = false`)
- Existing connected accounts: 0

Stripe's current documentation states that **new Accounts v2 / Connect integrations must use a general Stripe Sandbox**, not legacy test mode.

The sandbox-only `EnableConnect` API was attempted against the connected test-mode account and Stripe rejected it exactly for that reason: automatic Connect enablement is supported only for Sandbox accounts.

## Architecture confirmed by Stripe planner

CrewCommand is a **SaaS Platform**, not a Marketplace.

V1 model:

- the field-service business is the connected account;
- its customer buys directly from that business;
- the connected business is merchant of record;
- use **direct charges**;
- Stripe owns pricing/processing fees;
- Stripe owns connected-account loss liability / Managed Risk;
- use Stripe-hosted or embedded onboarding;
- no per-transaction CrewCommand `application_fee_amount` in V1;
- CrewCommand never stores raw card or bank details;
- payment completion is based on Stripe authoritative state/webhooks;
- future application fees/platform pricing remain possible later.

## Local/CI evidence

GitHub Actions run `36087392763` completed successfully.

- strict TypeScript: PASS
- Vitest files: 1/1 PASS
- Tests: **6/6 PASS**
- stripe-node: 22.6.2

Validated locally:

1. direct PaymentIntent request is scoped to a connected account via `stripeAccount`;
2. payment amount is represented in minor units;
3. Workspace and Invoice IDs are attached as Stripe metadata;
4. request-level idempotency key is mandatory;
5. V1 request contains no `application_fee_amount`;
6. valid raw-body webhook signature is accepted;
7. tampered webhook body is rejected;
8. duplicated Stripe Event ID is processed once;
9. unsupported event types are handled explicitly.

## External validation still required

POC-07 cannot become PASS until a **general Stripe Sandbox** exists and we validate:

1. Connect platform enablement;
2. Accounts v2 merchant connected account creation;
3. `fees_collector = stripe`;
4. `losses_collector = stripe`;
5. card-payments capability request/status;
6. Stripe-hosted or embedded onboarding;
7. direct PaymentIntent in connected-account context;
8. test card payment confirmation;
9. authoritative PaymentIntent retrieval;
10. webhook delivery/signature/idempotent local update;
11. no live money movement.

## No ADR yet

ADR-007 is intentionally **not created** while the external half of the PoC remains unvalidated.
