import Stripe from "stripe";

export class InMemoryProcessedEventStore {
  private readonly ids = new Set<string>();

  claim(eventId: string): boolean {
    if (this.ids.has(eventId)) return false;
    this.ids.add(eventId);
    return true;
  }

  has(eventId: string): boolean {
    return this.ids.has(eventId);
  }
}

export function verifyStripeWebhook(
  stripe: Stripe,
  rawBody: string | Buffer,
  signature: string,
  secret: string,
): Stripe.Event {
  return stripe.webhooks.constructEvent(rawBody, signature, secret);
}

export function handlePaymentWebhook(
  event: Stripe.Event,
  store: InMemoryProcessedEventStore,
): "processed" | "duplicate" | "ignored" {
  if (!store.claim(event.id)) return "duplicate";

  switch (event.type) {
    case "payment_intent.succeeded":
    case "payment_intent.payment_failed":
    case "payment_intent.processing":
      return "processed";
    default:
      return "ignored";
  }
}
