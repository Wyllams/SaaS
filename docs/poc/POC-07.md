# POC-07 — Stripe Connect

## Status

**PASS — Stripe Connect Accounts v2 + Direct Charges validated in the CrewCommand Dev Sandbox.**

## Goal

Validate the Stripe Connect architecture approved in the TRD for CrewCommand:

- field-service businesses are Stripe connected accounts;
- each connected business is merchant of record for its own customers;
- CrewCommand is a SaaS platform, not a marketplace;
- payments use direct charges;
- Stripe owns processing pricing and connected-account loss liability in V1;
- onboarding is Stripe-hosted;
- CrewCommand stores no raw card/bank data;
- provider state and signed webhooks are authoritative;
- externally visible payment operations are idempotent.

## Stripe environment

Validation used the dedicated general Stripe Sandbox:

- Sandbox: **CrewCommand Dev**
- Platform account context: `acct_1UJPBgCadk4XyIRc`
- Live mode: **false**
- Connect enabled specifically inside the Sandbox
- Secret key stored only as GitHub Actions secret `STRIPE_SANDBOX_SECRET_KEY`

No live payment or live connected account was created.

## Architecture confirmed by Stripe planner

Stripe's implementation planner classified CrewCommand as a **SaaS Platform**.

Selected V1 model:

- merchant businesses are connected accounts;
- buyers purchase directly from those businesses;
- connected businesses are merchant of record;
- **Direct Charges**;
- Stripe-owned pricing/processing fees;
- Stripe-owned connected-account loss liability / Managed Risk;
- Stripe-hosted onboarding;
- Full Stripe Dashboard for connected businesses;
- no per-transaction CrewCommand `application_fee_amount` in V1.

## Local/CI contract evidence

GitHub Actions hardened run: `36087490776`.

Validated with stripe-node 22.6.2:

1. strict TypeScript: PASS;
2. Vitest: **6/6 tests PASS**;
3. direct PaymentIntent request is scoped to a connected account;
4. amount is represented in minor units;
5. Workspace and Invoice references are placed in metadata;
6. request idempotency key is required;
7. V1 direct-charge contract contains no `application_fee_amount`;
8. valid Stripe raw-body webhook signature is accepted;
9. a tampered webhook body is rejected;
10. repeated Stripe Event IDs are processed only once;
11. unsupported event types remain explicitly handled.

## Accounts v2 / onboarding evidence

The Sandbox API successfully created a real `v2.core.account`.

Validated configuration:

- dashboard: `full`;
- `defaults.responsibilities.fees_collector = stripe`;
- `defaults.responsibilities.losses_collector = stripe`;
- merchant/card-payments capability exists;
- `livemode = false`.

Before onboarding, Stripe reported:

- card payments status: `restricted`;
- requirements status: `past_due`.

This is the expected pre-onboarding state.

A real Stripe-hosted Accounts v2 onboarding link was then created successfully:

- object: `v2.core.account_link`;
- URL present: PASS;
- link expiration present: PASS.

Evidence run: `36089729788`.

The raw onboarding URL is intentionally not stored in documentation or logs because Account Links are short-lived, single-use credentials to an onboarding flow.

## Direct payment evidence

A separate, repeatable Sandbox payment probe validated a direct charge on the Accounts v2 connected account.

GitHub Actions run: `36090007775`.

Result:

- amount: **1250 USD minor units = US$ 12.50**;
- currency: `usd`;
- status: `succeeded`;
- `livemode = false`;
- Workspace metadata: PASS;
- Invoice metadata: PASS;
- no application fee: enforced by local contract.

### Idempotency

The same direct-payment request was executed twice with the same idempotency key.

Result:

- both calls resolved to the same PaymentIntent ID;
- `idempotency_same_object = true`.

### Provider-authoritative retrieval

The PaymentIntent was retrieved again directly from Stripe in the connected-account context.

Result:

- same PaymentIntent ID: PASS;
- authoritative status: `succeeded`;
- amount/currency unchanged: PASS;
- `livemode = false`: PASS.

### Provider event

The connected account's Stripe event history was queried for `payment_intent.succeeded`.

Result:

- matching provider event: **1**;
- provider event validation: PASS.

## Important Sandbox limitation

Stripe documents that Sandboxes **might not enforce some capability restrictions**.

In this PoC, the connected account still reported `card_payments.status = restricted` before completing hosted onboarding, yet the Sandbox allowed the direct test payment to succeed.

Therefore this PoC proves the integration mechanics, but **does not authorize CrewCommand to ignore capability state in production**.

Production guardrail:

> Never create a customer-facing direct charge unless the connected account is eligible to process payments according to current Stripe capability/account status.

The application must check the connected account's current merchant/card-payments capability and onboarding/requirements state before exposing payment collection.

## Decision

CrewCommand V1 will use:

1. **Stripe Connect Accounts v2** for new connected businesses.
2. **Direct Charges** so the service company remains merchant of record.
3. **Stripe-hosted onboarding** initially.
4. **Full Stripe Dashboard** for connected businesses in V1.
5. `fees_collector = stripe`.
6. `losses_collector = stripe` / Managed Risk.
7. No CrewCommand `application_fee_amount` in V1.
8. Stripe Elements/hosted provider components for sensitive payment data.
9. Stripe provider state + signed webhooks as payment authority.
10. Request idempotency keys and event-ID deduplication.
11. Manual cash/check/etc. payments remain separate internal transactions and are not represented as Stripe charges.

## Webhook model

CrewCommand must:

- verify Stripe signatures against the exact raw body;
- persist Stripe Event IDs for idempotent processing;
- tolerate duplicate and out-of-order delivery;
- re-fetch Stripe resources when authoritative state is required;
- process connected-account payment events;
- never mark a payment successful solely because the browser/client reported success.

## ACH

The architecture remains compatible with ACH Direct Debit, but POC-07's successful end-to-end payment proof used a Stripe test card.

ACH-specific settlement, mandate, verification and async-state cases must receive their own integration tests during Financial implementation.

## Security

- Sandbox secret key is never committed to Git.
- GitHub Actions reads it only from `STRIPE_SANDBOX_SECRET_KEY`.
- No live-mode Stripe key is used by PoC workflows.
- CrewCommand never stores raw card or bank credentials.
- Production should prefer restricted keys where the required Connect permissions allow it and otherwise protect server-side secrets through managed secret storage.

## ADR

Decision recorded in:

`docs/adr/ADR-007-stripe-connect-direct-charges.md`
