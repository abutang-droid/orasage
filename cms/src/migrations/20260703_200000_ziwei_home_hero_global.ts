import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres';

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  DO $$ BEGIN
    CREATE TYPE "public"."enum_ziwei_home_hero_display_mode" AS ENUM('text', 'image', 'video');
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;

  CREATE TABLE IF NOT EXISTS "ziwei_home_hero" (
    "id" serial PRIMARY KEY NOT NULL,
    "enabled" boolean DEFAULT true,
    "eyebrow" varchar,
    "headline" varchar NOT NULL,
    "subtitle" varchar,
    "display_mode" "enum_ziwei_home_hero_display_mode" DEFAULT 'text',
    "hero_image_id" integer,
    "hero_video_id" integer,
    "video_external_url" varchar,
    "video_autoplay" boolean DEFAULT true,
    "body_text" varchar,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  DO $$ BEGIN
    ALTER TABLE "ziwei_home_hero"
      ADD CONSTRAINT "ziwei_home_hero_hero_image_id_media_id_fk"
      FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id")
      ON DELETE set null ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;

  DO $$ BEGIN
    ALTER TABLE "ziwei_home_hero"
      ADD CONSTRAINT "ziwei_home_hero_hero_video_id_media_id_fk"
      FOREIGN KEY ("hero_video_id") REFERENCES "public"."media"("id")
      ON DELETE set null ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;

  INSERT INTO "ziwei_home_hero" (
    "enabled", "eyebrow", "headline", "subtitle", "display_mode", "video_autoplay", "created_at", "updated_at"
  )
  SELECT
    true,
    '紫微斗数',
    '紫微排盘，洞察命盘十二宫',
    '输入出生信息，即刻生成紫微命盘与 AI 解读',
    'text',
    true,
    now(),
    now()
  WHERE NOT EXISTS (SELECT 1 FROM "ziwei_home_hero");
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP TABLE IF EXISTS "ziwei_home_hero" CASCADE;
    DROP TYPE IF EXISTS "public"."enum_ziwei_home_hero_display_mode";
  `);
}
