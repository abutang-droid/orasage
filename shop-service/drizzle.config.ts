import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/lib/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL ?? 'postgresql://orasage:orasage@127.0.0.1:5432/orasage_shop',
  },
});
