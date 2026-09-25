# ADR-007 — Stripe Connect Accounts v2 + Direct Charges

- **Status:** Accepted
- **Date:** 2026-09-24
- **Validated by:** POC-07

## Context

CrewCommand allows independent field-service businesses to collect payments from their own customers.

CrewCommand is software used by those merchants; it is not the seller of roofing, HVAC, plumbing, landscaping, cleaning or other field services.

The payment architecture therefore needs to preserve the service company as the merchant of record while allowing CrewCommand to provide payment UX, payment status, invoicing integration and operational automation.

## Decision

Use **Stripe Connect Accounts v2** with **Direct Charges**.

For V1 connected accounts:

- Stripe Dashboard: `full`;
- onboarding: Stripe-hosted;
- fees collector: `stripe`;
- losses collector: `stripe`;
- merchant/card-payments capability requested;
- Stripe manages connected-account processing pricing and Managed Risk;
- CrewCommand does not add `application_fee_amount` to V1 customer payments.

## Merchant-of-record model

The connected field-service company is the merchant of record for its end-customer payment.

CrewCommand orchestrates the payment experience but does not receive the customer payment first and then transfer it to the merchant.

This avoids incorrectly modeling CrewCommand as a marketplace.

## Evidence

POC-07 validated three layers.

### 1. Local integration contract

Hardened CI run `36087490776`:

- 6/6 tests passed;
- Stripe request scoping to connected account;
- minor-unit money handling;
- Workspace/Invoice metadata;
- request idempotency;
- no V1 application fee;
- raw webhook signature verification;
- tampered-body rejection;
- duplicate Event ID suppression.

### 2. Accounts v2 and hosted onboarding

Sandbox evidence:

- real `v2.core.account` created;
- `dashboard = full`;
- `fees_collector = stripe`;
- `losses_collector = stripe`;
- merchant card-payments capability present;
- pre-onboarding status observed as restricted/past_due;
- Accounts v2 hosted onboarding link created successfully.

Representative run: `36089729788`.

### 3. Direct charge / provider authority

Sandbox run `36090007775`:

- US$ 12.50 direct test PaymentIntent succeeded;
- `livemode = false`;
- duplicate create with same idempotency key returned the same PaymentIntent;
- authoritative retrieval returned `succeeded`;
- matching `payment_intent.succeeded` event existed in the connected-account event history.

## Sandbox caveat

Stripe documents that Sandbox environments might not enforce all capability restrictions.

The PoC payment succeeded even though the test connected account still reported a restricted card-payments capability before onboarding completion.

This is acceptable as integration evidence but is **not production eligibility evidence**.

Production code must check current connected-account capability/onboarding state before allowing payment collection.

## Webhook authority

Payment lifecycle state is provider-authoritative.

CrewCommand must:

1. verify webhook signatures from the raw request body;
2. store/process Stripe Event IDs idempotently;
3. tolerate duplicates and out-of-order events;
4. re-fetch a PaymentIntent or related resource when necessary;
5. update internal Payment/Invoice state from trusted backend/provider evidence;
6. never trust browser redirect state as final payment proof.

## Idempotency

Payment creation receives an explicit CrewCommand idempotency key derived from the business operation.

Example conceptual key:

`payment:{workspaceId}:{invoiceId}:{attemptVersion}`

The exact formatting is an implementation detail, but uniqueness and replay behavior are mandatory.

## Sensitive payment data

CrewCommand must not store raw:

- card PAN;
- CVC;
- bank account credentials;
- other Stripe-restricted payment authentication material.

Use Stripe-hosted/Elements/provider surfaces and store only provider-safe identifiers/status/metadata needed by the CrewCommand domain.

## Refunds

Refunds remain separate immutable payment transactions in CrewCommand. The original Payment record is retained.

Stripe refund behavior will be implemented through the provider adapter and webhook reconciliation.

## Manual payments

Cash, check, Zelle, wire and other manually recorded payment methods are separate CrewCommand operations.

They are not fabricated as Stripe transactions.

## ACH

ACH Direct Debit remains part of the V1 payment-method architecture.

Because ACH has asynchronous verification/processing/settlement behavior, implementation must include dedicated ACH tests in addition to this card-based Connect PoC.

## Provider abstraction

Stripe is the primary online-payment provider, but the domain layer uses a payment-provider adapter.

Core CrewCommand financial state must not depend on Stripe SDK object structures leaking across the application.

## Future monetization

V1 does not collect a per-transaction CrewCommand application fee.

The architecture intentionally preserves the option to introduce:

- application fees;
- Stripe platform pricing tools;
- other SaaS monetization strategies

in a future explicitly approved product/business change.

## Consequences

### Positive

- service company remains merchant of record;
- Stripe handles onboarding/KYC surfaces;
- Stripe owns connected-account fee collection and Managed Risk in V1;
- CrewCommand's PCI exposure is reduced by avoiding raw payment credentials;
- direct charge maps naturally to each service company's invoices/payments;
- idempotency/webhook design protects against duplicated financial side effects.

### Trade-offs

- each service company must onboard with Stripe;
- payment availability depends on connected-account capability state;
- connected-account event handling is required;
- provider outages must degrade gracefully;
- payment and onboarding status reconciliation add backend complexity.

## Guardrails

1. No live charge unless the connected account is currently eligible for the payment method.
2. No raw card/bank credentials in CrewCommand.
3. No payment success based only on client-side state.
4. Signed webhook verification is mandatory.
5. Event processing is idempotent.
6. Payment creation is idempotent.
7. Provider errors do not corrupt Invoice/Payment state.
8. Manual payments remain separate from Stripe.
9. No V1 `application_fee_amount`.
10. Stripe Sandbox and Production credentials/environments remain completely separated.

## Evidence reference

- POC document: `docs/poc/POC-07.md`
- Local hardened run: `36087490776`
- Direct payment run: `36090007775`
- Sandbox: CrewCommand Dev
