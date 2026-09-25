import {
  ServiceUnavailableException,
  UnauthorizedException,
} from "@nestjs/common";
import { reconcileAuthenticatedIdentity } from "./authenticated-reconciliation.ts";
import type { IdentityRepository, VerifiedSupabaseIdentity } from "./identity-reconciliation.ts";

export type TokenVerifier = (token: string) => Promise<VerifiedSupabaseIdentity | null>;

export class IdentityTransport {
  private readonly repository: IdentityRepository | null;
  private readonly verifyToken: TokenVerifier;

  constructor(
    repository: IdentityRepository | null,
    verifyToken: TokenVerifier,
  ) {
    this.repository = repository;
    this.verifyToken = verifyToken;
  }

  async currentIdentity(authorization: string | undefined) {
    const token = extractBearerAccessToken(authorization);
    if (!token) {
      throw new UnauthorizedException({
        code: "UNAUTHENTICATED",
        message: "Authentication required.",
      });
    }

    if (!this.repository) {
      throw new ServiceUnavailableException({
        code: "IDENTITY_SERVICE_UNAVAILABLE",
        message: "Identity service is not configured.",
      });
    }

    const result = await reconcileAuthenticatedIdentity({
      token,
      verifyToken: this.verifyToken,
      repository: this.repository,
    });

    if (!result) {
      throw new UnauthorizedException({
        code: "UNAUTHENTICATED",
        message: "Authentication required.",
      });
    }

    return { user: result.user };
  }
}

export function extractBearerAccessToken(authorization: string | undefined) {
  const match = authorization?.match(/^Bearer ([^\s]+)$/i);
  return match?.[1] ?? null;
}
