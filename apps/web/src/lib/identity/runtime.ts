import { createDatabase, createIdentityRepository } from "@saas/db";
import { createClient } from "@supabase/supabase-js";
import { uuidv7 } from "uuidv7";

import type { IdentityDependencies } from "./handle-identity-request";

/**
 * Dependências reais do contrato de identidade.
 *
 * Configuração lida do ambiente:
 *
 * - `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` — valores
 *   públicos por definição, conforme `docs/implementation/SECRETS.md`, usados aqui
 *   no servidor apenas para verificar o access token contra o Supabase Auth;
 * - `SUPABASE_DB_URL` — **server-only**, nunca espelhado em `NEXT_PUBLIC_*`.
 *
 * Faltando qualquer uma, a fábrica devolve `null` e o handler responde o 503 de
 * serviço não configurado previsto no contrato.
 */

let cached: IdentityDependencies | null | undefined;

export function getIdentityDependencies(): IdentityDependencies | null {
  if (cached !== undefined) {
    return cached;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const databaseUrl = process.env.SUPABASE_DB_URL;

  if (!supabaseUrl || !publishableKey || !databaseUrl) {
    cached = null;
    return cached;
  }

  const auth = createClient(supabaseUrl, publishableKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const repository = createIdentityRepository(createDatabase(databaseUrl));

  cached = {
    async verifyAccessToken(token) {
      const { data, error } = await auth.auth.getUser(token);
      if (error || !data.user?.email) {
        return null;
      }
      return { subject: data.user.id, email: data.user.email };
    },

    async reconcileIdentity(identity) {
      const result = await repository.findOrCreateUserWithSupabaseIdentity({
        id: uuidv7(),
        email: identity.email,
        subject: identity.subject,
      });
      return result.user;
    },

    logError(message, detail) {
      console.error(message, detail);
    },
  };

  return cached;
}
