import Stripe from "stripe";

export type DirectPaymentInput = {
  connectedAccountId: string;
  amountMinor: number;
  currency: string;
  workspaceId: string;
  invoiceId: string;
  idempotencyKey: string;
};

export type DirectPaymentPlan = {
  params: Stripe.PaymentIntentCreateParams;
  requestOptions: Stripe.RequestOptions;
};

export function buildDirectPaymentIntent(input: DirectPaymentInput): DirectPaymentPlan {
  if (!input.connectedAccountId.startsWith("acct_")) {
    throw new Error("connectedAccountId must be a Stripe account id");
  }
  if (!Number.isInteger(input.amountMinor) || input.amountMinor <= 0) {
    throw new Error("amountMinor must be a positive integer");
  }
  if (!input.idempotencyKey) {
    throw new Error("idempotencyKey is required");
  }

  return {
    params: {
      amount: input.amountMinor,
      currency: input.currency,
      automatic_payment_methods: { enabled: true },
      metadata: {
        workspace_id: input.workspaceId,
        invoice_id: input.invoiceId,
        payment_origin: "crewcommand",
      },
    },
    requestOptions: {
      stripeAccount: input.connectedAccountId,
      idempotencyKey: input.idempotencyKey,
    },
  };
}

export function assertNoPlatformApplicationFee(
  params: Stripe.PaymentIntentCreateParams,
): void {
  if ("application_fee_amount" in params && params.application_fee_amount != null) {
    throw new Error("CrewCommand V1 direct charges must not set application_fee_amount");
  }
}
