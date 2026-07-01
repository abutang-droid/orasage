import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from './schema.js';

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(pool, { schema });

export async function initDb(): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      nickname VARCHAR(100),
      avatar_url TEXT,
      birth_date VARCHAR(20),
      birth_hour INTEGER,
      birth_place_province VARCHAR(100),
      birth_place_city VARCHAR(100),
      birthplace_longitude REAL,
      gender VARCHAR(20),
      preferred_deity VARCHAR(100),
      language_preference VARCHAR(10) DEFAULT 'zh-CN',
      role VARCHAR(20) DEFAULT 'user' NOT NULL,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL,
      updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
      last_signed_in TIMESTAMP
    );
  `);
}
