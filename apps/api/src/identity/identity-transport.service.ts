import {
  Inject,
  Injectable,
} from "@nestjs/common";
import type { IdentityRepository } from "./identity-reconciliation.js";
import { IdentityTransport, type TokenVerifier } from "./identity-transport.js";

export const IDENTITY_REPOSITORY = Symbol("IDENTITY_REPOSITORY");
export const IDENTITY_TOKEN_VERIFIER = Symbol("IDENTITY_TOKEN_VERIFIER");

@Injectable()
export class IdentityTransportService extends IdentityTransport {
  constructor(
    @Inject(IDENTITY_REPOSITORY) repository: IdentityRepository | null,
    @Inject(IDENTITY_TOKEN_VERIFIER) verifyToken: TokenVerifier,
  ) {
    super(repository, verifyToken);
  }
}
