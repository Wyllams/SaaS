import test from "node:test";
import assert from "node:assert/strict";
import {
  buildAttachmentListRequest,
  buildReceivedEmailRequest,
  buildSendEmailRequest,
  redactRequestForEvidence,
} from "./adapter.mjs";
import webhookHandler from "../api/webhook.mjs";
import {
  classifyInboundEmail,
  InMemoryWebhookIdStore,
  signWebhookForTest,
  verifyResendWebhook,
} from "./webhook.mjs";

const API_KEY = "re_poc10_fake_key";
const WEBHOOK_SECRET = `whsec_${Buffer.from("poc10-local-webhook-secret").toString("base64")}`;

test("builds an outbound email request without placing credentials in the payload", () => {
  const request = buildSendEmailRequest({
    apiKey: API_KEY,
    from: "POC <sender@example.test>",
    to: ["recipient@example.test"],
    subject: "POC-10",
    text: "Controlled test message",
    attachments: [{ filename: "evidence.txt", content: Buffer.from("ok").toString("base64") }],
  });

  assert.equal(request.url, "https://api.resend.com/emails");
  assert.equal(request.init.method, "POST");
  assert.equal(request.init.headers.Authorization, `Bearer ${API_KEY}`);
  assert.doesNotMatch(request.init.body, /re_poc10_fake_key/);
});

test("builds received-email and attachment API requests", () => {
  const received = buildReceivedEmailRequest({ apiKey: API_KEY, emailId: "email_123" });
  const attachments = buildAttachmentListRequest({ apiKey: API_KEY, emailId: "email_123" });

  assert.equal(received.url, "https://api.resend.com/emails/receiving/email_123");
  assert.equal(attachments.url, "https://api.resend.com/emails/receiving/email_123/attachments");
  assert.equal(received.init.method, "GET");
  assert.equal(attachments.init.method, "GET");
});

test("redacts authorization before producing evidence", () => {
  const request = buildReceivedEmailRequest({ apiKey: API_KEY, emailId: "email_123" });
  const safe = redactRequestForEvidence(request);
  assert.equal(safe.init.headers.Authorization, "Bearer [REDACTED]");
});

test("verifies a signed webhook using the exact raw body", () => {
  const now = 1_800_000_000;
  const rawBody = JSON.stringify({
    type: "email.received",
    data: { email_id: "email_123", from: "trusted@example.test" },
  });
  const headers = signWebhookForTest({
    rawBody,
    webhookId: "msg_poc10",
    timestamp: now,
    webhookSecret: WEBHOOK_SECRET,
  });

  const event = verifyResendWebhook({
    rawBody,
    headers,
    webhookSecret: WEBHOOK_SECRET,
    nowSeconds: now,
  });

  assert.equal(event.type, "email.received");
  assert.equal(event.data.email_id, "email_123");
});

test("accepts legacy svix header aliases while preserving exact-body verification", () => {
  const now = 1_800_000_000;
  const rawBody = JSON.stringify({ type: "email.received", data: { email_id: "email_123" } });
  const standard = signWebhookForTest({
    rawBody,
    webhookId: "msg_legacy",
    timestamp: now,
    webhookSecret: WEBHOOK_SECRET,
  });

  const event = verifyResendWebhook({
    rawBody,
    headers: {
      "svix-id": standard["webhook-id"],
      "svix-timestamp": standard["webhook-timestamp"],
      "svix-signature": standard["webhook-signature"],
    },
    webhookSecret: WEBHOOK_SECRET,
    nowSeconds: now,
  });

  assert.equal(event.type, "email.received");
});

test("rejects tampered bodies and replayed timestamps", () => {
  const now = 1_800_000_000;
  const rawBody = JSON.stringify({ type: "email.received", data: { email_id: "email_123" } });
  const headers = signWebhookForTest({
    rawBody,
    webhookId: "msg_tamper",
    timestamp: now,
    webhookSecret: WEBHOOK_SECRET,
  });

  assert.throws(
    () =>
      verifyResendWebhook({
        rawBody: rawBody.replace("email_123", "email_modified"),
        headers,
        webhookSecret: WEBHOOK_SECRET,
        nowSeconds: now,
      }),
    /invalid webhook signature/,
  );

  assert.throws(
    () =>
      verifyResendWebhook({
        rawBody,
        headers,
        webhookSecret: WEBHOOK_SECRET,
        nowSeconds: now + 301,
      }),
    /outside replay window/,
  );
});

test("deduplicates webhook message ids", () => {
  const store = new InMemoryWebhookIdStore();
  assert.equal(store.claim("msg_once"), true);
  assert.equal(store.claim("msg_once"), false);
});

test("uses a strict sender allowlist for inbound email processing", () => {
  const trusted = {
    type: "email.received",
    data: { from: "Trusted Sender <trusted@example.test>" },
  };
  const unknown = {
    type: "email.received",
    data: { from: "Unknown <unknown@example.test>" },
  };

  assert.equal(classifyInboundEmail(trusted, ["trusted@example.test"]), "accepted");
  assert.equal(classifyInboundEmail(unknown, ["trusted@example.test"]), "rejected");
});


test("public webhook handler rejects unsigned requests without exposing secrets", async () => {
  const previousSecret = process.env.RESEND_WEBHOOK_SECRET;
  const previousAllowlist = process.env.POC10_ALLOWED_SENDERS;
  process.env.RESEND_WEBHOOK_SECRET = WEBHOOK_SECRET;
  process.env.POC10_ALLOWED_SENDERS = "trusted@example.test";

  try {
    const request = new Request("https://example.test/api/webhook", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ type: "email.received", data: { from: "trusted@example.test" } }),
    });

    const response = await webhookHandler.fetch(request);
    assert.equal(response.status, 400);
    const body = await response.json();
    assert.deepEqual(body, { ok: false, error: "invalid_webhook" });
  } finally {
    if (previousSecret === undefined) delete process.env.RESEND_WEBHOOK_SECRET;
    else process.env.RESEND_WEBHOOK_SECRET = previousSecret;
    if (previousAllowlist === undefined) delete process.env.POC10_ALLOWED_SENDERS;
    else process.env.POC10_ALLOWED_SENDERS = previousAllowlist;
  }
});
