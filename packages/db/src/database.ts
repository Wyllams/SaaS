import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

export function createDatabase(connectionString: string) {
  const pool = new Pool({
    connectionString,
    max: 5,
    ssl: { rejectUnauthorized: true },
  });

  return drizzle({ client: pool });
}
