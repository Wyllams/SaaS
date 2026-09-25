import { type IdentityRepository, reconcileIdentity, type VerifiedSupabaseIdentity } from "./identity-reconciliation.ts";

export async function reconcileAuthenticatedIdentity({ token, verifyToken, repository }: { token: string; verifyToken: (token: string) => Promise<VerifiedSupabaseIdentity | null>; repository: IdentityRepository }) {
  if (!token) return null;
  const identity = await verifyToken(token);
  return identity ? reconcileIdentity({ repository, identity }) : null;
}
