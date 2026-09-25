import twilio from "twilio";

export function expectedSignature(
  signingKey: string,
  url: string,
  params: Record<string, string>,
): string {
  return twilio.getExpectedTwilioSignature(signingKey, url, params);
}

export function validateTwilioWebhook(input: {
  signingKey: string;
  signature: string;
  url: string;
  params: Record<string, string>;
}): boolean {
  return twilio.validateRequest(
    input.signingKey,
    input.signature,
    input.url,
    input.params,
  );
}
