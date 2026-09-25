import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.117.2";
import postgres from "https://deno.land/x/postgresjs@v3.4.5/mod.js";
import { uuidv7 } from "npm:uuidv7@1.2.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
const databaseUrl = Deno.env.get("SUPABASE_DB_URL");

const sql = databaseUrl
  ? postgres(databaseUrl, { prepare: false, max: 1, idle_timeout: 20, max_lifetime: 300 })
  : null;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "GET") return json({ code: "METHOD_NOT_ALLOWED", message: "Method not allowed." }, 405);

  const authorization = req.headers.get("authorization") ?? "";
  const match = authorization.match(/^Bearer ([^\s]+)$/i);
  if (!match) return json({ code: "UNAUTHENTICATED", message: "Authentication required." }, 401);

  if (!supabaseUrl || !anonKey || !sql) {
    return json({ code: "IDENTITY_SERVICE_UNAVAILABLE", message: "Identity service is not configured." }, 503);
  }

  const supabase = createClient(supabaseUrl, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await supabase.auth.getUser(match[1]);
  if (error || !data.user?.email) {
    return json({ code: "UNAUTHENTICATED", message: "Authentication required." }, 401);
  }

  try {
    const user = await reconcileIdentity({ subject: data.user.id, email: data.user.email });
    return json({ user }, 200);
  } catch (error) {
    console.error("identity reconciliation failed", {
      error: error instanceof Error ? error.message : "unknown error",
    });
    return json({ code: "IDENTITY_SERVICE_UNAVAILABLE", message: "Identity service is temporarily unavailable." }, 503);
  }
});

async function reconcileIdentity(input: { subject: string; email: string }) {
  if (!sql) throw new Error("database is not configured");

  return await sql.begin(async (tx) => {
    const existing = await findUserBySubject(tx, input.subject);
    if (existing) return existing;

    const id = uuidv7();
    await tx`insert into public.users (id, email) values (${id}::uuid, ${input.email})`;
    const mapping = await tx`
      insert into public.user_supabase_identities (user_id, subject)
      values (${id}::uuid, ${input.subject}::uuid)
      on conflict (subject) do nothing
      returning subject
    `;

    if (mapping.length === 1) return { id, email: input.email };

    await tx`delete from public.users where id = ${id}::uuid`;
    const resolved = await findUserBySubject(tx, input.subject);
    if (!resolved) throw new Error("identity reconciliation conflict could not be resolved");
    return resolved;
  });
}

async function findUserBySubject(tx: any, subject: string) {
  const rows = await tx`
    select u.id, u.email
    from public.user_supabase_identities i
    join public.users u on u.id = i.user_id
    where i.subject = ${subject}::uuid
    limit 1
  `;
  return rows[0] ? { id: String(rows[0].id), email: String(rows[0].email) } : null;
}

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}
