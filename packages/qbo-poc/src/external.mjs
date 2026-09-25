import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";

const {
  QBO_CLIENT_ID,
  QBO_CLIENT_SECRET,
  QBO_REFRESH_TOKEN,
  QBO_REALM_ID,
  GITHUB_RUN_ID = "local",
} = process.env;

for (const [name, value] of Object.entries({
  QBO_CLIENT_ID,
  QBO_CLIENT_SECRET,
  QBO_REFRESH_TOKEN,
  QBO_REALM_ID,
})) {
  assert.ok(value, `${name} is required`);
}

const TOKEN_URL = "https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer";
const BASE_URL = "https://sandbox-quickbooks.api.intuit.com";

async function readJson(response, label) {
  const text = await response.text();
  let body;
  try {
    body = text ? JSON.parse(text) : {};
  } catch {
    throw new Error(`${label} returned non-JSON HTTP ${response.status}`);
  }
  return { body, text };
}

async function refreshAccessToken() {
  const basic = Buffer.from(`${QBO_CLIENT_ID}:${QBO_CLIENT_SECRET}`).toString("base64");
  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: QBO_REFRESH_TOKEN,
    }),
  });

  const { body } = await readJson(response, "OAuth refresh");
  if (!response.ok) {
    throw new Error(`OAuth refresh failed HTTP ${response.status}: ${body.error ?? "unknown"}`);
  }

  assert.ok(body.access_token, "access_token missing");
  return {
    accessToken: body.access_token,
    refreshTokenRotated:
      Boolean(body.refresh_token) && body.refresh_token !== QBO_REFRESH_TOKEN,
    xRefreshTokenExpiresIn: body.x_refresh_token_expires_in ?? null,
  };
}

const oauth = await refreshAccessToken();

async function qbo(path, init = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${oauth.accessToken}`,
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });
  const parsed = await readJson(response, path);
  return { response, ...parsed };
}

async function mustQbo(path, init = {}) {
  const result = await qbo(path, init);
  if (!result.response.ok) {
    const fault = result.body?.Fault?.Error?.[0];
    throw new Error(
      `${path} failed HTTP ${result.response.status}: ${fault?.code ?? "unknown"}/${fault?.Message ?? "unknown"}`,
    );
  }
  return result.body;
}

const companyBody = await mustQbo(
  `/v3/company/${QBO_REALM_ID}/companyinfo/${QBO_REALM_ID}`,
);
const company = companyBody.CompanyInfo;
assert.ok(company?.Id, "CompanyInfo missing");

async function query(statement) {
  const body = await mustQbo(
    `/v3/company/${QBO_REALM_ID}/query?query=${encodeURIComponent(statement)}`,
    { headers: { Accept: "application/json" } },
  );
  return body.QueryResponse ?? {};
}

let itemQuery = await query(
  "select * from Item where Type = 'Service' STARTPOSITION 1 MAXRESULTS 1",
);
let item = itemQuery.Item?.[0];
if (!item) {
  itemQuery = await query("select * from Item STARTPOSITION 1 MAXRESULTS 1");
  item = itemQuery.Item?.[0];
}
assert.ok(item?.Id, "No usable QBO Item found in Sandbox");

const runSuffix = String(GITHUB_RUN_ID).slice(-12);
const displayName = `CrewCommand POC08 ${runSuffix}`;

const customerBody = await mustQbo(
  `/v3/company/${QBO_REALM_ID}/customer`,
  {
    method: "POST",
    body: JSON.stringify({
      DisplayName: displayName,
      PrimaryEmailAddr: { Address: `poc08+${runSuffix}@example.com` },
      Notes: `CrewCommand POC-08 GitHub run ${GITHUB_RUN_ID}`,
    }),
  },
);
const customer = customerBody.Customer;
assert.ok(customer?.Id, "Customer create failed");

const invoiceAmount = 125;
const invoiceBody = await mustQbo(
  `/v3/company/${QBO_REALM_ID}/invoice`,
  {
    method: "POST",
    body: JSON.stringify({
      CustomerRef: { value: customer.Id },
      PrivateNote: `CrewCommand POC-08 ${GITHUB_RUN_ID}`,
      Line: [
        {
          Amount: invoiceAmount,
          Description: "CrewCommand POC-08 field service",
          DetailType: "SalesItemLineDetail",
          SalesItemLineDetail: {
            ItemRef: { value: item.Id },
          },
        },
      ],
    }),
  },
);
const invoice = invoiceBody.Invoice;
assert.ok(invoice?.Id, "Invoice create failed");
assert.ok(invoice?.SyncToken != null, "Invoice SyncToken missing");
const originalSyncToken = String(invoice.SyncToken);

const updatedBody = await mustQbo(
  `/v3/company/${QBO_REALM_ID}/invoice`,
  {
    method: "POST",
    body: JSON.stringify({
      Id: invoice.Id,
      SyncToken: originalSyncToken,
      sparse: true,
      DueDate: "2026-10-15",
    }),
  },
);
const updatedInvoice = updatedBody.Invoice;
assert.ok(updatedInvoice?.SyncToken != null, "Updated SyncToken missing");
assert.notEqual(
  String(updatedInvoice.SyncToken),
  originalSyncToken,
  "SyncToken must change after update",
);

const staleAttempt = await qbo(
  `/v3/company/${QBO_REALM_ID}/invoice`,
  {
    method: "POST",
    body: JSON.stringify({
      Id: invoice.Id,
      SyncToken: originalSyncToken,
      sparse: true,
      DueDate: "2026-10-20",
    }),
  },
);
assert.equal(
  staleAttempt.response.ok,
  false,
  "Stale SyncToken update should be rejected",
);
const staleError = staleAttempt.body?.Fault?.Error?.[0] ?? {};

const paymentBody = await mustQbo(
  `/v3/company/${QBO_REALM_ID}/payment`,
  {
    method: "POST",
    body: JSON.stringify({
      CustomerRef: { value: customer.Id },
      TotalAmt: invoiceAmount,
      PrivateNote: `CrewCommand POC-08 payment ${GITHUB_RUN_ID}`,
      Line: [
        {
          Amount: invoiceAmount,
          LinkedTxn: [
            {
              TxnId: invoice.Id,
              TxnType: "Invoice",
            },
          ],
        },
      ],
    }),
  },
);
const payment = paymentBody.Payment;
assert.ok(payment?.Id, "Payment create failed");

const rereadBody = await mustQbo(
  `/v3/company/${QBO_REALM_ID}/invoice/${invoice.Id}`,
);
const rereadInvoice = rereadBody.Invoice;
assert.ok(rereadInvoice?.Id, "Invoice re-read failed");
assert.equal(Number(rereadInvoice.Balance), 0, "Invoice should be fully paid");

const evidence = {
  poc: "POC-08",
  sandbox: true,
  companyInfo: "PASS",
  companyCountry: company.Country ?? null,
  realmIdAcceptedByApi: true,
  itemResolved: true,
  customer: {
    id: customer.Id,
    displayName: customer.DisplayName,
  },
  invoice: {
    id: invoice.Id,
    originalSyncToken,
    updatedSyncToken: String(updatedInvoice.SyncToken),
    staleSyncTokenRejected: true,
    staleHttpStatus: staleAttempt.response.status,
    staleErrorCode: staleError.code ?? null,
    total: Number(rereadInvoice.TotalAmt),
    finalBalance: Number(rereadInvoice.Balance),
  },
  payment: {
    id: payment.Id,
    total: Number(payment.TotalAmt),
    linkedToInvoice: Boolean(
      payment.Line?.some((line) =>
        line.LinkedTxn?.some(
          (txn) => String(txn.TxnId) === String(invoice.Id) && txn.TxnType === "Invoice",
        ),
      ),
    ),
  },
  refreshTokenRotated: oauth.refreshTokenRotated,
  refreshTokenHardExpiresInPresent: oauth.xRefreshTokenExpiresIn != null,
  providerReconciliation: "PASS",
};

assert.equal(evidence.payment.linkedToInvoice, true);
assert.equal(evidence.invoice.finalBalance, 0);

await mkdir(".poc", { recursive: true });
await writeFile(
  ".poc/qbo-external-sanitized.json",
  JSON.stringify(evidence, null, 2),
);

console.log(JSON.stringify(evidence));
