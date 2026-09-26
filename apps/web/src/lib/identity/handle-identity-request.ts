/**
 * Contrato HTTP de identidade do Slice 01.
 *
 * Migrado da Edge Function `identity-me` pelo item 1 do Epic 0 (ADR-017).
 * O comportamento observável é idêntico ao da Edge Function, com uma diferença
 * autorizada pelo Task Packet: os headers de CORS saíram, porque esta rota é
 * same-origin com o `SCR-AUTH-001` e o wildcard não tem mais razão de existir.
 *
 * Este arquivo é deliberadamente autocontido e sem import relativo: o handler é
 * puro e recebe suas dependências por parâmetro, o que permite exercitar todas as
 * linhas do contrato sem banco e sem rede.
 */

export type VerifiedIdentity = {
  subject: string;
  email: string;
};

export type ReconciledUser = {
  id: string;
  email: string;
};

export type IdentityDependencies = {
  verifyAccessToken: (token: string) => Promise<VerifiedIdentity | null>;
  reconcileIdentity: (identity: VerifiedIdentity) => Promise<ReconciledUser>;
  logError?: (message: string, detail: Record<string, string>) => void;
};

const BEARER_PATTERN = /^Bearer ([^\s]+)$/i;

const METHOD_NOT_ALLOWED = {
  status: 405,
  body: { code: "METHOD_NOT_ALLOWED", message: "Method not allowed." },
} as const;

const UNAUTHENTICATED = {
  status: 401,
  body: { code: "UNAUTHENTICATED", message: "Authentication required." },
} as const;

const NOT_CONFIGURED = {
  status: 503,
  body: { code: "IDENTITY_SERVICE_UNAVAILABLE", message: "Identity service is not configured." },
} as const;

const TEMPORARILY_UNAVAILABLE = {
  status: 503,
  body: { code: "IDENTITY_SERVICE_UNAVAILABLE", message: "Identity service is temporarily unavailable." },
} as const;

/**
 * `dependencies` é `null` quando o ambiente não está configurado. A ordem das
 * verificações segue a da Edge Function: método, credencial, configuração. Uma
 * requisição sem Bearer recebe 401 mesmo em ambiente não configurado, para não
 * revelar o estado de configuração a quem não se identificou.
 */
export async function handleIdentityRequest(
  request: Request,
  dependencies: IdentityDependencies | null,
): Promise<Response> {
  if (request.method !== "GET") {
    return respond(METHOD_NOT_ALLOWED);
  }

  const match = BEARER_PATTERN.exec(request.headers.get("authorization") ?? "");
  if (!match?.[1]) {
    return respond(UNAUTHENTICATED);
  }

  if (!dependencies) {
    return respond(NOT_CONFIGURED);
  }

  const identity = await dependencies.verifyAccessToken(match[1]);
  if (!identity) {
    return respond(UNAUTHENTICATED);
  }

  try {
    const user = await dependencies.reconcileIdentity(identity);
    return respond({ status: 200, body: { user } });
  } catch (error) {
    // Falha explícita, sem vazar mensagem de driver, SQL ou stack para o cliente.
    dependencies.logError?.("identity reconciliation failed", {
      error: error instanceof Error ? error.message : "unknown error",
    });
    return respond(TEMPORARILY_UNAVAILABLE);
  }
}

function respond(result: { status: number; body: unknown }): Response {
  return new Response(JSON.stringify(result.body), {
    status: result.status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });
}
