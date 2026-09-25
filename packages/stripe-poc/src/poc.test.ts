import { describe, expect, it } from "vitest";
import Stripe from "stripe";
import {
  assertNoPlatformApplicationFee,
  buildDirectPaymentIntent,
} from "./adapter.js";
import {
  handlePaymentWebhook,
  InMemoryProcessedEventStore,
  verifyStripeWebhook,
} from "./webhook.js";

const stripe = new Stripe("sk_test_123", {
  apiVersion: "2026-08-26.dahlia",
});

describe("CrewCommand Stripe Connect architecture contract", () => {
  it("builds a direct charge in connected-account context", () => {
    const plan = buildDirectPaymentIntent({
      connectedAccountId: "acct_test_crewcommand",
      amountMinor: 12500,
      currency: "usd",
      workspaceId: "ws_123",
      invoiceId: "inv_456",
      idempotencyKey: "payment:ws_123:inv_456:v1",
    });

    expect(plan.params.amount).toBe(12500);
    expect(plan.params.currency).toBe("usd");
    expect(plan.params.automatic_payment_methods).toEqual({ enabled: true });
    expect(plan.params.metadata).toMatchObject({
      workspace_id: "ws_123",
      invoice_id: "inv_456",
      payment_origin: "crewcommand",
    });
    expect(plan.requestOptions.stripeAccount).toBe("acct_test_crewcommand");
    expect(plan.requestOptions.idempotencyKey).toBe("payment:ws_123:inv_456:v1");
    expect("application_fee_amount" in plan.params).toBe(false);
    expect(() => assertNoPlatformApplicationFee(plan.params)).not.toThrow();
  });

  it("rejects platform application fees in V1 direct charges", () => {
    const params = {
      amount: 1000,
      currency: "usd",
      application_fee_amount: 100,
    } as Stripe.PaymentIntentCreateParams;

    expect(() => assertNoPlatformApplicationFee(params)).toThrow(
      /must not set application_fee_amount/,
    );
  });

  it("verifies Stripe webhook signatures from the raw body", () => {
    const secret = "whsec_poc07_local_secret";
    const payload = JSON.stringify({
      id: "evt_poc07_success",
      object: "event",
      type: "payment_intent.succeeded",
      data: { object: { id: "pi_test" } },
    });

    const signature = stripe.webhooks.generateTestHeaderString({
      payload,
      secret,
      timestamp: 1_800_000_000,
    });

    const event = verifyStripeWebhook(stripe, payload, signature, secret);
    expect(event.id).toBe("evt_poc07_success");
    expect(event.type).toBe("payment_intent.succeeded");
  });

  it("rejects a tampered webhook body", () => {
    const secret = "whsec_poc07_local_secret";
    const payload = JSON.stringify({
      id: "evt_poc07_tamper",
      object: "event",
      type: "payment_intent.succeeded",
      data: { object: { id: "pi_test" } },
    });

    const signature = stripe.webhooks.generateTestHeaderString({
      payload,
      secret,
      timestamp: 1_800_000_000,
    });

    expect(() =>
      verifyStripeWebhook(
        stripe,
        payload.replace("pi_test", "pi_modified"),
        signature,
        secret,
      ),
    ).toThrow();
  });

  it("processes a Stripe event once and ignores duplicate delivery", () => {
    const store = new InMemoryProcessedEventStore();
    const event = {
      id: "evt_duplicate",
      object: "event",
      type: "payment_intent.succeeded",
      data: { object: {} },
    } as Stripe.Event;

    expect(handlePaymentWebhook(event, store)).toBe("processed");
    expect(handlePaymentWebhook(event, store)).toBe("duplicate");
    expect(store.has("evt_duplicate")).toBe(true);
  });

  it("records unknown event ids while keeping unsupported event handling explicit", () => {
    const store = new InMemoryProcessedEventStore();
    const event = {
      id: "evt_unhandled",
      object: "event",
      type: "customer.created",
      data: { object: {} },
    } as Stripe.Event;

    expect(handlePaymentWebhook(event, store)).toBe("ignored");
    expect(handlePaymentWebhook(event, store)).toBe("duplicate");
  });
});
