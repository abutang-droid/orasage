import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres';

/** Worship facing fields on faiths + sanctuaries (P3) */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  DO $$ BEGIN
    CREATE TYPE "public"."enum_faiths_worship_facing" AS ENUM('none', 'qibla', 'east', 'jerusalem');
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;

  DO $$ BEGIN
    CREATE TYPE "public"."enum_sanctuaries_worship_facing" AS ENUM('inherit', 'none', 'qibla', 'east', 'jerusalem', 'custom');
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;

  ALTER TABLE "faiths" ADD COLUMN IF NOT EXISTS "worship_facing" "enum_faiths_worship_facing" DEFAULT 'none';
  ALTER TABLE "faiths" ADD COLUMN IF NOT EXISTS "facing_label_zh" varchar;
  ALTER TABLE "faiths" ADD COLUMN IF NOT EXISTS "facing_label_en" varchar;
  ALTER TABLE "faiths" ADD COLUMN IF NOT EXISTS "facing_bearing" numeric;

  ALTER TABLE "sanctuaries" ADD COLUMN IF NOT EXISTS "worship_facing" "enum_sanctuaries_worship_facing" DEFAULT 'inherit';
  ALTER TABLE "sanctuaries" ADD COLUMN IF NOT EXISTS "facing_label_zh" varchar;
  ALTER TABLE "sanctuaries" ADD COLUMN IF NOT EXISTS "facing_label_en" varchar;
  ALTER TABLE "sanctuaries" ADD COLUMN IF NOT EXISTS "facing_bearing" numeric;
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "faiths" DROP COLUMN IF EXISTS "worship_facing";
  ALTER TABLE "faiths" DROP COLUMN IF EXISTS "facing_label_zh";
  ALTER TABLE "faiths" DROP COLUMN IF EXISTS "facing_label_en";
  ALTER TABLE "faiths" DROP COLUMN IF EXISTS "facing_bearing";

  ALTER TABLE "sanctuaries" DROP COLUMN IF EXISTS "worship_facing";
  ALTER TABLE "sanctuaries" DROP COLUMN IF EXISTS "facing_label_zh";
  ALTER TABLE "sanctuaries" DROP COLUMN IF EXISTS "facing_label_en";
  ALTER TABLE "sanctuaries" DROP COLUMN IF EXISTS "facing_bearing";

  DROP TYPE IF EXISTS "public"."enum_faiths_worship_facing";
  DROP TYPE IF EXISTS "public"."enum_sanctuaries_worship_facing";
  `);
}
