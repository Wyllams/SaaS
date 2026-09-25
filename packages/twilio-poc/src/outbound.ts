export type A2pCampaignStatus =
  | "NOT_REGISTERED"
  | "PENDING"
  | "VERIFIED"
  | "FAILED"
  | "SUSPENDED";

export type ConsentStatus = "UNKNOWN" | "OPTED_IN" | "OPTED_OUT";

export type OutboundSmsInput = {
  to: string;
  body: string;
  messagingServiceSid: string;
  statusCallbackUrl: string;
  consentStatus: ConsentStatus;
  destinationCountry: string;
  senderType: "US_10DLC" | "TOLL_FREE" | "OTHER";
  a2pCampaignStatus?: A2pCampaignStatus;
};

export class SmsComplianceError extends Error {
  constructor(
    public readonly code:
      | "INVALID_E164"
      | "CONSENT_REQUIRED"
      | "RECIPIENT_OPTED_OUT"
      | "A2P_CAMPAIGN_NOT_VERIFIED"
      | "MESSAGING_SERVICE_REQUIRED",
    message: string,
  ) {
    super(message);
  }
}

const E164 = /^\+[1-9]\d{7,14}$/;

export function buildOutboundSms(input: OutboundSmsInput) {
  if (!E164.test(input.to)) {
    throw new SmsComplianceError("INVALID_E164", "Recipient must use E.164 format");
  }
  if (!input.messagingServiceSid.startsWith("MG")) {
    throw new SmsComplianceError(
      "MESSAGING_SERVICE_REQUIRED",
      "CrewCommand outbound SMS must use a Twilio Messaging Service",
    );
  }
  if (input.consentStatus === "OPTED_OUT") {
    throw new SmsComplianceError(
      "RECIPIENT_OPTED_OUT",
      "Recipient has opted out of SMS",
    );
  }
  if (input.consentStatus !== "OPTED_IN") {
    throw new SmsComplianceError(
      "CONSENT_REQUIRED",
      "Explicit SMS consent is required before outbound messaging",
    );
  }
  if (
    input.destinationCountry === "US" &&
    input.senderType === "US_10DLC" &&
    input.a2pCampaignStatus !== "VERIFIED"
  ) {
    throw new SmsComplianceError(
      "A2P_CAMPAIGN_NOT_VERIFIED",
      "US 10DLC traffic requires a verified A2P campaign",
    );
  }

  return {
    to: input.to,
    body: input.body,
    messagingServiceSid: input.messagingServiceSid,
    statusCallback: input.statusCallbackUrl,
  };
}
