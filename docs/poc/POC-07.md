# POC-07 — Stripe Connect

## Status

**PARTIAL PASS — local/CI architecture validated; external Connect v2 validation blocked on Stripe Sandbox.**

## Stripe account state

The connected Stripe account available to this session is:

- Account: `acct_1TNBRJCtl0zzV1rp`
- Mode: legacy test mode (`livemode = false`)
- Connected accounts currently: 0

Stripe's current Accounts v2 documentation states that new Connect integrations using Accounts v2 must be tested in a **Stripe Sandbox**, not legacy test mode.

An attempt to call Stripe's sandbox-only `EnableConnect` operation against the current test-mode account was rejected with the expected error that automatic Connect enablement is supported only for sandbox accounts.

## Architecture decision already confirmed by Stripe planner

CrewCommand is a **SaaS Platform**, not a marketplace.

The intended V1 model is:

- merchant businesses are connected accounts;
- each business is merchant of record for its own end customer;
- payments use **direct charges**;
- Stripe owns payment pricing for connected accounts;
- Stripe owns connected-account loss liability / Managed Risk;
- onboarding is Stripe-hosted or embedded;
- no CrewCommand application fee is charged per transaction in V1;
- raw card/bank data never enters CrewCommand servers;
- Stripe webhook/provider state is authoritative for payment result;
- future application fees/platform pricing remain possible later.

## Local/CI validation scope

The local package validates:

1. direct-charge PaymentIntent request is created in connected-account context;
2. no `application_fee_amount` is allowed in V1;
3. idempotency key is required at request level;
4. business metadata carries Workspace and Invoice references;
5. webhook signature verification uses Stripe's raw-body verification;
6. tampered payloads fail signature verification;
7. repeated Stripe Event IDs are processed once;
8. supported and unsupported event types are handled explicitly.

## External validation still required

The PoC is not complete until a Stripe Sandbox exists and we validate:

1. Connect platform enabled in Sandbox;
2. Accounts v2 merchant connected account creation;
3. Stripe-managed fees/losses responsibilities;
4. hosted or embedded onboarding link/session creation;
5. connected account capability/status retrieval;
6. direct PaymentIntent created on the connected account;
7. test payment confirmation;
8. authoritative PaymentIntent retrieval;
9. webhook delivery + signature + idempotent local update;
10. no live money movement.

## Decision status

The architecture is approved by the TRD and Stripe planner, but **POC-07 must remain PARTIAL until the external Sandbox tests pass**.
