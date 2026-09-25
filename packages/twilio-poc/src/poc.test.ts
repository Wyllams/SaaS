import { describe, expect, it } from "vitest";
import { buildOutboundSms, SmsComplianceError } from "./outbound.js";
import { parseInboundSms } from "./inbound.js";
import { expectedSignature, validateTwilioWebhook } from "./signature.js";
import { reconcileStatus } from "./status.js";
import { meterSmsUsage } from "./usage.js";

const messagingServiceId = "MG_POC_SERVICE";
const accountId = "AC_POC_ACCOUNT";
const messageId = "SM_POC_MESSAGE";

describe("CrewCommand Twilio Messaging contract", () => {
  it("builds outbound SMS using a Messaging Service and status callback", () => {
    const payload = buildOutboundSms({
      to: "+13055550123",
      body: "Your CrewCommand appointment is confirmed.",
      messagingServiceSid: messagingServiceId,
      statusCallbackUrl: "https://api.crewcommand.example/webhooks/twilio/status",
      consentStatus: "OPTED_IN",
      destinationCountry: "US",
      senderType: "US_10DLC",
      a2pCampaignStatus: "VERIFIED",
    });

    expect(payload).toEqual({
      to: "+13055550123",
      body: "Your CrewCommand appointment is confirmed.",
      messagingServiceSid: messagingServiceId,
      statusCallback: "https://api.crewcommand.example/webhooks/twilio/status",
    });
    expect("from" in payload).toBe(false);
  });

  it("blocks US 10DLC traffic until A2P campaign is verified", () => {
    expect(() =>
      buildOutboundSms({
        to: "+13055550123",
        body: "Scheduled.",
        messagingServiceSid: messagingServiceId,
        statusCallbackUrl: "https://api.example.com/status",
        consentStatus: "OPTED_IN",
        destinationCountry: "US",
        senderType: "US_10DLC",
        a2pCampaignStatus: "PENDING",
      }),
    ).toThrowError(
      expect.objectContaining<Partial<SmsComplianceError>>({
        code: "A2P_CAMPAIGN_NOT_VERIFIED",
      }),
    );
  });

  it("blocks unknown consent and opted-out recipients", () => {
    for (const [status, code] of [
      ["UNKNOWN", "CONSENT_REQUIRED"],
      ["OPTED_OUT", "RECIPIENT_OPTED_OUT"],
    ] as const) {
      try {
        buildOutboundSms({
          to: "+13055550123",
          body: "Scheduled.",
          messagingServiceSid: messagingServiceId,
          statusCallbackUrl: "https://api.example.com/status",
          consentStatus: status,
          destinationCountry: "US",
          senderType: "US_10DLC",
          a2pCampaignStatus: "VERIFIED",
        });
        throw new Error("Expected compliance error");
      } catch (error) {
        expect(error).toBeInstanceOf(SmsComplianceError);
        expect((error as SmsComplianceError).code).toBe(code);
      }
    }
  });

  it("processes Advanced Opt-Out STOP, START and HELP correctly", () => {
    const base = {
      MessageSid: messageId,
      AccountSid: accountId,
      MessagingServiceSid: messagingServiceId,
      From: "+13055550123",
      To: "+13055550999",
      Body: "",
      NumMedia: "0",
      NumSegments: "1",
    };

    expect(parseInboundSms({ ...base, Body: "STOP", OptOutType: "STOP" })).toMatchObject({
      consentTransition: "OPTED_OUT",
      suppressApplicationAutoReply: true,
    });
    expect(parseInboundSms({ ...base, Body: "START", OptOutType: "START" })).toMatchObject({
      consentTransition: "OPTED_IN",
      suppressApplicationAutoReply: true,
    });
    const help = parseInboundSms({ ...base, Body: "HELP", OptOutType: "HELP" });
    expect(help.suppressApplicationAutoReply).toBe(true);
    expect(help).not.toHaveProperty("consentTransition");
  });

  it("keeps normal inbound messages as customer communications", () => {
    const result = parseInboundSms({
      MessageSid: messageId,
      AccountSid: accountId,
      MessagingServiceSid: messagingServiceId,
      From: "+13055550123",
      To: "+13055550999",
      Body: "Can you arrive after 3 PM?",
      NumMedia: "2",
      NumSegments: "1",
    });

    expect(result.body).toContain("after 3 PM");
    expect(result.numMedia).toBe(2);
    expect(result.suppressApplicationAutoReply).toBe(false);
  });

  it("validates Twilio webhook signatures with evolving parameter sets", () => {
    const signingKey = "unit-test-signing-value";
    const url = "https://api.crewcommand.example/webhooks/twilio/inbound";
    const params = {
      AccountSid: accountId,
      MessageSid: messageId,
      From: "+13055550123",
      To: "+13055550999",
      Body: "Hello",
      FutureTwilioParameter: "must-not-be-dropped",
    };

    const signature = expectedSignature(signingKey, url, params);

    expect(validateTwilioWebhook({ signingKey, signature, url, params })).toBe(true);
    expect(
      validateTwilioWebhook({
        signingKey,
        signature,
        url,
        params: { ...params, Body: "tampered" },
      }),
    ).toBe(false);
  });

  it("does not regress delivery state when callbacks arrive out of order", () => {
    expect(
      reconcileStatus("delivered", {
        MessageSid: messageId,
        MessageStatus: "sent",
      }),
    ).toEqual({ action: "IGNORE_REGRESSION", nextStatus: "delivered" });
  });

  it("requires provider re-fetch for conflicting terminal callbacks", () => {
    expect(
      reconcileStatus("failed", {
        MessageSid: messageId,
        MessageStatus: "delivered",
      }).action,
    ).toBe("REFETCH_CONFLICT");
  });

  it("meters actual Twilio message segments instead of one logical message", () => {
    expect(
      meterSmsUsage({
        sid: messageId,
        numSegments: "3",
        price: "-0.0237",
        priceUnit: "USD",
        status: "delivered",
      }),
    ).toEqual({
      providerMessageSid: messageId,
      segments: 3,
      providerPrice: 0.0237,
      currency: "USD",
      status: "delivered",
    });
  });
});
