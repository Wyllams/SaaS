import { createHmac, timingSafeEqual } from "node:crypto";

const DEFAULT_TOLERANCE_SECONDS = 5 * 60;

function readHeader(headers, canonical, legacy) {
  if (headers && typeof headers.get === "function") {
    return headers.get(canonical) ?? headers.get(legacy);
  }

  const normalized = new Map(
    Object.entries(headers ?? {}).map(([key, value]) => [key.toLowerCase(), String(value)]),
  );

  return normalized.get(canonical) ?? normalized.get(legacy);
}

function decodeWebhookSecret(secret) {
  if (typeof secret !== "string" || !secret.startsWith("whsec_")) {
    throw new Error("webhook secret must use whsec_ format");
  }

  const encoded = secret.slice("whsec_".length);
  const key = Buffer.from(encoded, "base64");
  if (key.length === 0) throw new Error("webhook secret is empty");
  return key;
}

function safeEqualBase64(left, right) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function verifyResendWebhook({
  rawBody,
  headers,
  webhookSecret,
  nowSeconds = Math.floor(Date.now() / 1000),
  toleranceSeconds = DEFAULT_TOLERANCE_SECONDS,
}) {
  if (typeof rawBody !== "string") {
    throw new Error("rawBody must be the exact request body string");
  }

  const id = readHeader(headers, "webhook-id", "svix-id");
  const timestampText = readHeader(headers, "webhook-timestamp", "svix-timestamp");
  const signatureHeader = readHeader(headers, "webhook-signature", "svix-signature");

  if (!id || !timestampText || !signatureHeader) {
    throw new Error("missing webhook signature headers");
  }

  const timestamp = Number.parseInt(timestampText, 10);
  if (!Number.isFinite(timestamp)) throw new Error("invalid webhook timestamp");
  if (Math.abs(nowSeconds - timestamp) > toleranceSeconds) {
    throw new Error("webhook timestamp outside replay window");
  }

  const key = decodeWebhookSecret(webhookSecret);
  const signedContent = `${id}.${timestamp}.${rawBody}`;
  const expected = createHmac("sha256", key).update(signedContent).digest("base64");

  const matched = signatureHeader
    .split(" ")
    .map((part) => part.split(",", 2))
    .some(([version, signature]) => version === "v1" && signature && safeEqualBase64(signature, expected));

  if (!matched) throw new Error("invalid webhook signature");

  return JSON.parse(rawBody);
}

export function signWebhookForTest({ rawBody, webhookId, timestamp, webhookSecret }) {
  const key = decodeWebhookSecret(webhookSecret);
  const signature = createHmac("sha256", key)
    .update(`${webhookId}.${timestamp}.${rawBody}`)
    .digest("base64");

  return {
    "webhook-id": webhookId,
    "webhook-timestamp": String(timestamp),
    "webhook-signature": `v1,${signature}`,
  };
}

export class InMemoryWebhookIdStore {
  #ids = new Set();

  claim(id) {
    if (this.#ids.has(id)) return false;
    this.#ids.add(id);
    return true;
  }
}

export function classifyInboundEmail(event, allowedSenders) {
  if (event?.type !== "email.received") return "ignored";
  if (!Array.isArray(allowedSenders) || allowedSenders.length === 0) {
    throw new Error("allowedSenders must not be empty");
  }

  const from = String(event?.data?.from ?? "").toLowerCase();
  const allowed = allowedSenders.some((sender) => from.includes(String(sender).toLowerCase()));
  return allowed ? "accepted" : "rejected";
}
