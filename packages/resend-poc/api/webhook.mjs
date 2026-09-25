import {
  classifyInboundEmail,
  InMemoryWebhookIdStore,
  verifyResendWebhook,
} from "../src/webhook.mjs";

const processed = new InMemoryWebhookIdStore();

function json(status, payload) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

function allowedSenders() {
  return String(process.env.POC10_ALLOWED_SENDERS ?? "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
}

export default {
  async fetch(request) {
    if (request.method !== "POST") {
      return json(405, { ok: false, error: "method_not_allowed" });
    }

    const webhookSecret = process.env.RESEND_WEBHOOK_SECRET;
    if (!webhookSecret) {
      return json(503, { ok: false, error: "webhook_not_configured" });
    }

    const rawBody = await request.text();

    let event;
    try {
      event = verifyResendWebhook({
        rawBody,
        headers: request.headers,
        webhookSecret,
      });
    } catch {
      return json(400, { ok: false, error: "invalid_webhook" });
    }

    const webhookId =
      request.headers.get("webhook-id") ??
      request.headers.get("svix-id");

    if (!webhookId) {
      return json(400, { ok: false, error: "missing_webhook_id" });
    }

    if (!processed.claim(webhookId)) {
      return json(200, { ok: true, duplicate: true });
    }

    let inbound = "not_applicable";
    if (event.type === "email.received") {
      const senders = allowedSenders();
      if (senders.length === 0) {
        return json(503, { ok: false, error: "allowlist_not_configured" });
      }
      inbound = classifyInboundEmail(event, senders);
    }

    return json(200, {
      ok: true,
      type: event.type ?? "unknown",
      inbound,
    });
  },
};
