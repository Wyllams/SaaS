export type ProviderMessageForUsage = {
  sid: string;
  numSegments: string | null;
  price?: string | null;
  priceUnit?: string | null;
  status: string;
};

export function meterSmsUsage(message: ProviderMessageForUsage) {
  const segments = Number(message.numSegments ?? 0);
  if (!Number.isInteger(segments) || segments < 0) {
    throw new Error("Invalid Twilio segment count");
  }

  return {
    providerMessageSid: message.sid,
    segments,
    providerPrice:
      message.price == null ? null : Math.abs(Number(message.price)),
    currency: message.priceUnit ?? null,
    status: message.status,
  };
}
