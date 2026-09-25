import { uuidv7 } from "uuidv7";

export type InternalUser = {
  id: string;
  email: string;
};

export type VerifiedSupabaseIdentity = {
  subject: string;
  email: string;
};

export type IdentityRepository = {
  findOrCreateUserWithSupabaseIdentity(input: {
    id: string;
    email: string;
    subject: string;
  }): Promise<{ user: InternalUser; created: boolean }>;
};

export async function reconcileIdentity({
  repository,
  identity,
}: {
  repository: IdentityRepository;
  identity: VerifiedSupabaseIdentity;
}): Promise<{ user: InternalUser; created: boolean }> {
  return repository.findOrCreateUserWithSupabaseIdentity({
    id: uuidv7(),
    email: identity.email,
    subject: identity.subject,
  });
}
