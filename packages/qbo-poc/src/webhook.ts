import {
  createHmac,
  timingSafeEqual,
} from "node:crypto";

export function computeWebhookSignature(
  rawBody: string | Buffer,
  verifierToken: string,
): string {
  return createHmac("sha256", verifierToken)
    .update(rawBody)
    .digest("base64");
}

export function verifyWebhookSignature(input: {
  rawBody: string | Buffer;
  signature: string;
  verifierToken: string;
}): boolean {
  const expected = Buffer.from(
    computeWebhookSignature(input.rawBody, input.verifierToken),
  );
  const actual = Buffer.from(input.signature);
  if (expected.length !== actual.length) return false;
  return timingSafeEqual(expected, actual);
}

export type WebhookEntityHint = {
  realmId: string;
  name: string;
  id: string;
  operation: string;
  lastUpdated: string;
};

export class WebhookDeduplicator {
  private readonly seen = new Set<string>();

  claim(hint: WebhookEntityHint): boolean {
    const key = [
      hint.realmId,
      hint.name,
      hint.id,
      hint.operation,
      hint.lastUpdated,
    ].join(":");

    if (this.seen.has(key)) return false;
    this.seen.add(key);
    return true;
  }
}

export function planWebhookHandling(hint: WebhookEntityHint) {
  return {
    entity: hint.name,
    externalId: hint.id,
    operation: hint.operation,
    strategy: "REFETCH_PROVIDER_RESOURCE" as const,
    reason:
      "QuickBooks webhook is a change hint; provider state is authoritative.",
  };
}
