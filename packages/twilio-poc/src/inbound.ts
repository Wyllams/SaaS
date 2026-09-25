import type { ConsentStatus } from "./outbound.js";

export type InboundParams = Record<string, string | undefined> & {
  MessageSid: string;
  AccountSid: string;
  MessagingServiceSid?: string;
  From: string;
  To: string;
  Body: string;
  NumMedia?: string;
  NumSegments?: string;
  OptOutType?: "STOP" | "START" | "HELP";
};

export type InboundResult = {
  messageSid: string;
  accountSid: string;
  messagingServiceSid?: string;
  from: string;
  to: string;
  body: string;
  numMedia: number;
  numSegments: number;
  consentTransition?: ConsentStatus;
  suppressApplicationAutoReply: boolean;
};

export function parseInboundSms(params: InboundParams): InboundResult {
  const base = {
    messageSid: params.MessageSid,
    accountSid: params.AccountSid,
    messagingServiceSid: params.MessagingServiceSid,
    from: params.From,
    to: params.To,
    body: params.Body,
    numMedia: Number(params.NumMedia ?? 0),
    numSegments: Number(params.NumSegments ?? 1),
  };

  switch (params.OptOutType) {
    case "STOP":
      return {
        ...base,
        consentTransition: "OPTED_OUT",
        suppressApplicationAutoReply: true,
      };
    case "START":
      return {
        ...base,
        consentTransition: "OPTED_IN",
        suppressApplicationAutoReply: true,
      };
    case "HELP":
      return {
        ...base,
        suppressApplicationAutoReply: true,
      };
    default:
      return {
        ...base,
        suppressApplicationAutoReply: false,
      };
  }
}
