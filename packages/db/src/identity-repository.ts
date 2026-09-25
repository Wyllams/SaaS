import { eq } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { userSupabaseIdentities, users } from "./schema.js";

type IdentityDatabase = NodePgDatabase<Record<string, never>>;

export function createIdentityRepository(db: IdentityDatabase) {
  return {
    async findOrCreateUserWithSupabaseIdentity(input: { id: string; email: string; subject: string }) {
      return db.transaction(async (tx) => {
        const existing = await findUserBySubject(tx, input.subject);
        if (existing) return { user: existing, created: false };

        await tx.insert(users).values({ id: input.id, email: input.email });
        const mapping = await tx
          .insert(userSupabaseIdentities)
          .values({ userId: input.id, subject: input.subject })
          .onConflictDoNothing()
          .returning({ subject: userSupabaseIdentities.subject });

        if (mapping.length === 1) {
          return { user: { id: input.id, email: input.email }, created: true };
        }

        await tx.delete(users).where(eq(users.id, input.id));
        const resolved = await findUserBySubject(tx, input.subject);
        if (!resolved) throw new Error("Identity reconciliation conflict could not be resolved");
        return { user: resolved, created: false };
      });
    },
  };
}

async function findUserBySubject(db: IdentityDatabase, subject: string) {
  const rows = await db
    .select({ id: users.id, email: users.email })
    .from(userSupabaseIdentities)
    .innerJoin(users, eq(userSupabaseIdentities.userId, users.id))
    .where(eq(userSupabaseIdentities.subject, subject))
    .limit(1);
  return rows[0];
}
