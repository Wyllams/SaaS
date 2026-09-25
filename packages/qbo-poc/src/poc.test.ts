import { describe, expect, it } from "vitest";
import {
  buildCustomer,
  buildInvoice,
  buildPayment,
  buildSparseInvoiceUpdate,
} from "./mapping.js";
import { buildRefreshTokenRequest } from "./oauth.js";
import {
  computeWebhookSignature,
  planWebhookHandling,
  verifyWebhookSignature,
  WebhookDeduplicator,
} from "./webhook.js";
import { reconcileInvoice } from "./reconcile.js";

describe("CrewCommand QuickBooks Online contract", () => {
  it("builds a refresh-token request without putting credentials in the body", () => {
    const request = buildRefreshTokenRequest({
      clientId: "client-id",
      clientSecret: "client-secret",
      refreshToken: "refresh-token",
    });

    expect(request.url).toContain("oauth.platform.intuit.com");
    expect(request.headers.Authorization).toMatch(/^Basic /);
    expect(request.body).toContain("grant_type=refresh_token");
    expect(request.body).toContain("refresh_token=refresh-token");
    expect(request.body).not.toContain("client-secret");
  });

  it("maps a CrewCommand customer into a QBO Customer payload", () => {
    expect(
      buildCustomer({
        displayName: "CrewCommand POC Customer",
        email: "customer@example.com",
        phone: "+1 555 0100",
        address: {
          line1: "100 Main St",
          city: "Miami",
          region: "FL",
          postalCode: "33101",
          country: "USA",
        },
      }),
    ).toMatchObject({
      DisplayName: "CrewCommand POC Customer",
      PrimaryEmailAddr: { Address: "customer@example.com" },
      BillAddr: {
        Line1: "100 Main St",
        City: "Miami",
        CountrySubDivisionCode: "FL",
        PostalCode: "33101",
      },
    });
  });

  it("maps a CrewCommand invoice to a QBO Invoice with a service item", () => {
    const invoice = buildInvoice({
      customerId: "123",
      itemId: "1",
      amount: 250,
      description: "HVAC service",
      crewCommandInvoiceId: "CC-INV-1001",
    });

    expect(invoice.CustomerRef.value).toBe("123");
    expect(invoice.Line[0].Amount).toBe(250);
    expect(invoice.Line[0].SalesItemLineDetail.ItemRef.value).toBe("1");
    expect(invoice.PrivateNote).toContain("CC-INV-1001");
  });

  it("maps a payment to a specific QBO invoice", () => {
    const payment = buildPayment({
      customerId: "123",
      invoiceId: "456",
      amount: 250,
      crewCommandPaymentId: "CC-PAY-9001",
    });

    expect(payment.TotalAmt).toBe(250);
    expect(payment.Line[0].LinkedTxn[0]).toEqual({
      TxnId: "456",
      TxnType: "Invoice",
    });
  });

  it("requires the latest SyncToken for sparse update payloads", () => {
    expect(
      buildSparseInvoiceUpdate({
        id: "456",
        syncToken: "7",
        dueDate: "2026-10-15",
      }),
    ).toEqual({
      Id: "456",
      SyncToken: "7",
      sparse: true,
      DueDate: "2026-10-15",
    });
  });

  it("verifies webhook payload signatures from the raw body", () => {
    const rawBody = JSON.stringify({
      eventNotifications: [{ realmId: "123", dataChangeEvent: {} }],
    });
    const verifierToken = "qbo-poc-verifier";
    const signature = computeWebhookSignature(rawBody, verifierToken);

    expect(
      verifyWebhookSignature({ rawBody, signature, verifierToken }),
    ).toBe(true);

    expect(
      verifyWebhookSignature({
        rawBody: rawBody.replace("123", "999"),
        signature,
        verifierToken,
      }),
    ).toBe(false);
  });

  it("deduplicates webhook hints and always refetches provider state", () => {
    const hint = {
      realmId: "123",
      name: "Invoice",
      id: "456",
      operation: "Update",
      lastUpdated: "2026-09-25T03:00:00Z",
    };

    const store = new WebhookDeduplicator();
    expect(store.claim(hint)).toBe(true);
    expect(store.claim(hint)).toBe(false);
    expect(planWebhookHandling(hint).strategy).toBe(
      "REFETCH_PROVIDER_RESOURCE",
    );
  });

  it("reconciles invoice status, balance and SyncToken from QBO", () => {
    const result = reconcileInvoice(
      {
        externalId: "456",
        externalSyncToken: "0",
        total: 250,
        balance: 250,
        status: "OPEN",
      },
      {
        Id: "456",
        SyncToken: "1",
        TotalAmt: 250,
        Balance: 0,
      },
    );

    expect(result.changed).toBe(true);
    expect(result.next.status).toBe("PAID");
    expect(result.next.balance).toBe(0);
    expect(result.next.externalSyncToken).toBe("1");
  });
});
