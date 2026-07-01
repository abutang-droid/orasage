import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema.ts";
import { ENV } from "../env.ts";

const pool = new pg.Pool({ connectionString: ENV.databaseUrl });

export const db = drizzle(pool, { schema });

export async function pingDb(): Promise<boolean> {
  try {
    await pool.query("SELECT 1");
    return true;
  } catch {
    return false;
  }
}
