import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres';

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "orasage_user_id" numeric;
    CREATE UNIQUE INDEX IF NOT EXISTS "users_orasage_user_id_idx" ON "users" ("orasage_user_id");
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP INDEX IF EXISTS "users_orasage_user_id_idx";
    ALTER TABLE "users" DROP COLUMN IF EXISTS "orasage_user_id";
  `);
}
