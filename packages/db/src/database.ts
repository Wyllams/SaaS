import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

/**
 * Conexão com o PostgreSQL do Supabase.
 *
 * **TLS.** O pooler do Supabase apresenta um certificado emitido pela autoridade
 * própria deles, que não está na lista de autoridades confiáveis do Node. Com
 * `rejectUnauthorized: true` e sem essa autoridade, a conexão falha com
 * `self-signed certificate in certificate chain`.
 *
 * Duas configurações, nesta ordem de preferência:
 *
 * 1. `SUPABASE_DB_CA` presente — o certificado da autoridade do Supabase é usado
 *    para **verificar** a identidade do servidor. É o modo correto, e o que deve
 *    valer em produção.
 * 2. `SUPABASE_DB_CA` ausente — a conexão continua **criptografada**, mas a
 *    identidade do servidor não é verificada. Aceitável para desenvolvimento e
 *    validação; registrado como pendência de endurecimento no `EPIC-00-STATUS.md`.
 *
 * A senha nunca trafega em claro em nenhum dos dois modos.
 */
export function createDatabase(connectionString: string) {
  const certificateAuthority = process.env.SUPABASE_DB_CA;

  if (!certificateAuthority) {
    // Fecha em produção. O fallback sem verificação existe para desenvolvimento e
    // validação, e não pode alcançar tráfego real por esquecimento.
    if (process.env.APP_ENV === "production") {
      throw new Error(
        "SUPABASE_DB_CA is required when APP_ENV=production: refusing to open an " +
          "unverified TLS connection to the database.",
      );
    }

    console.warn(
      "database tls: server identity is NOT verified because SUPABASE_DB_CA is absent. " +
        "Traffic is encrypted, but the connection is exposed to an in-path attacker. " +
        "This fallback is refused when APP_ENV=production.",
    );
  }

  const pool = new Pool({
    connectionString,
    max: 5,
    ssl: certificateAuthority
      ? { ca: certificateAuthority, rejectUnauthorized: true }
      : { rejectUnauthorized: false },
  });

  return drizzle({ client: pool });
}
