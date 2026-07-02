import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "pages" ADD COLUMN IF NOT EXISTS "legacy_html" text;
    ALTER TABLE "pages" ADD COLUMN IF NOT EXISTS "source_url" varchar(500);
    ALTER TABLE "pages" ADD COLUMN IF NOT EXISTS "wp_type" varchar(20);
    ALTER TABLE "pages" ADD COLUMN IF NOT EXISTS "wp_id" numeric;
    ALTER TABLE "pages" ADD COLUMN IF NOT EXISTS "locale" varchar(20);
    ALTER TABLE "pages" ADD COLUMN IF NOT EXISTS "wp_status" varchar(20);
    CREATE UNIQUE INDEX IF NOT EXISTS "pages_wp_type_id_idx" ON "pages" ("wp_type", "wp_id");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP INDEX IF EXISTS "pages_wp_type_id_idx";
    ALTER TABLE "pages" DROP COLUMN IF EXISTS "legacy_html";
    ALTER TABLE "pages" DROP COLUMN IF EXISTS "source_url";
    ALTER TABLE "pages" DROP COLUMN IF EXISTS "wp_type";
    ALTER TABLE "pages" DROP COLUMN IF EXISTS "wp_id";
    ALTER TABLE "pages" DROP COLUMN IF EXISTS "locale";
    ALTER TABLE "pages" DROP COLUMN IF EXISTS "wp_status";
  `)
}
