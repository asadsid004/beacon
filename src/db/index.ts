import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import { env } from "@/env";

declare global {
  var postgresPool: Pool | undefined;
}

export const pool =
  globalThis.postgresPool ??
  new Pool({
    connectionString: env.DATABASE_URL,
  });

if (env.NODE_ENV !== "production") {
  globalThis.postgresPool = pool;
}

export const db = drizzle({ client: pool });

export type Database = typeof db;
