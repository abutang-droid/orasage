import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from './schema';

const pool = new pg.Pool({
  connectionString:
    process.env.DATABASE_URL ??
    'postgresql://orasage:orasage@127.0.0.1:5432/orasage_shop',
});

export const db = drizzle(pool, { schema });

export async function initDb(): Promise<void> {
  await pool.query('SELECT 1');
}

export { pool };
