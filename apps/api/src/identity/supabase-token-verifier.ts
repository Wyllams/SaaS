import { createClient } from "@supabase/supabase-js";

export type VerifiedIdentity = { subject: string; email: string };

export async function verifySupabaseAccessToken(token: string): Promise<VerifiedIdentity | null> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key || !token) return null;
  const client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data, error } = await client.auth.getUser(token);
  if (error || !data.user.email) return null;
  return { subject: data.user.id, email: data.user.email };
}
