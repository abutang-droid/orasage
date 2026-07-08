import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres';

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "pages" ADD COLUMN IF NOT EXISTS "daozang_volume" varchar(20);
    CREATE INDEX IF NOT EXISTS "pages_daozang_volume_idx" ON "pages" ("daozang_volume");
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP INDEX IF EXISTS "pages_daozang_volume_idx";
    ALTER TABLE "pages" DROP COLUMN IF EXISTS "daozang_volume";
  `);
}
