export const QBO_TOKEN_ENDPOINT =
  "https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer";

export function buildRefreshTokenRequest(input: {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
}) {
  if (!input.clientId || !input.clientSecret || !input.refreshToken) {
    throw new Error("QuickBooks OAuth credentials are required");
  }

  const basic = Buffer.from(`${input.clientId}:${input.clientSecret}`).toString(
    "base64",
  );

  return {
    url: QBO_TOKEN_ENDPOINT,
    method: "POST" as const,
    headers: {
      Authorization: `Basic ${basic}`,
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: input.refreshToken,
    }).toString(),
  };
}
