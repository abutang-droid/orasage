import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres';

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    DO $$ BEGIN
      ALTER TYPE "public"."enum_pages_app_source" ADD VALUE IF NOT EXISTS 'daozang';
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);
  await db.execute(sql`
    DO $$ BEGIN
      ALTER TYPE "public"."enum_pages_app_source" ADD VALUE IF NOT EXISTS 'famous';
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  // PostgreSQL does not support removing enum values safely; no-op.
  await db.execute(sql`SELECT 1`);
}
