const RESEND_API_BASE = "https://api.resend.com";

function requireString(value, field) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`${field} is required`);
  }
  return value.trim();
}

function requireEmailList(value, field) {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error(`${field} must contain at least one address`);
  }
  return value.map((item) => requireString(item, field));
}

function authHeaders(apiKey) {
  const key = requireString(apiKey, "apiKey");
  if (!key.startsWith("re_")) {
    throw new Error("apiKey must use a Resend API key format");
  }
  return {
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
  };
}

export function buildSendEmailRequest(input) {
  const payload = {
    from: requireString(input.from, "from"),
    to: requireEmailList(input.to, "to"),
    subject: requireString(input.subject, "subject"),
    text: requireString(input.text, "text"),
  };

  if (input.attachments !== undefined) {
    if (!Array.isArray(input.attachments)) {
      throw new Error("attachments must be an array");
    }
    payload.attachments = input.attachments.map((attachment) => ({
      filename: requireString(attachment.filename, "attachment.filename"),
      content: requireString(attachment.content, "attachment.content"),
    }));
  }

  return {
    url: `${RESEND_API_BASE}/emails`,
    init: {
      method: "POST",
      headers: authHeaders(input.apiKey),
      body: JSON.stringify(payload),
    },
  };
}

export function buildReceivedEmailRequest({ apiKey, emailId }) {
  return {
    url: `${RESEND_API_BASE}/emails/receiving/${encodeURIComponent(requireString(emailId, "emailId"))}`,
    init: {
      method: "GET",
      headers: authHeaders(apiKey),
    },
  };
}

export function buildAttachmentListRequest({ apiKey, emailId }) {
  return {
    url: `${RESEND_API_BASE}/emails/receiving/${encodeURIComponent(requireString(emailId, "emailId"))}/attachments`,
    init: {
      method: "GET",
      headers: authHeaders(apiKey),
    },
  };
}

export function redactRequestForEvidence(request) {
  const headers = { ...request.init.headers };
  if (headers.Authorization) headers.Authorization = "Bearer [REDACTED]";
  return {
    url: request.url,
    init: {
      ...request.init,
      headers,
    },
  };
}
