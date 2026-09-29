import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import { env } from "@/env";

import * as schema from "./schema";

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

export const db = drizzle({ client: pool, schema });

export type Database = typeof db;
