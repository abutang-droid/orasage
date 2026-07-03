import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres';

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  DO $$ BEGIN
    CREATE TYPE "public"."enum_bazi_feed_kind" AS ENUM('order', 'review');
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;

  DO $$ BEGIN
    CREATE TYPE "public"."enum_bazi_feed_locale" AS ENUM('zh-CN', 'zh-TW', 'en', 'pt-BR');
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;

  CREATE TABLE IF NOT EXISTS "bazi_feed" (
    "id" serial PRIMARY KEY NOT NULL,
    "kind" "enum_bazi_feed_kind" DEFAULT 'order' NOT NULL,
    "message" varchar NOT NULL,
    "locale" "enum_bazi_feed_locale" DEFAULT 'zh-CN',
    "sort" numeric DEFAULT 0,
    "enabled" boolean DEFAULT true,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE INDEX IF NOT EXISTS "bazi_feed_sort_idx" ON "bazi_feed" ("sort");
  CREATE INDEX IF NOT EXISTS "bazi_feed_locale_idx" ON "bazi_feed" ("locale");

  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "bazi_feed_id" integer;

  DO $$ BEGIN
    ALTER TABLE "payload_locked_documents_rels"
      ADD CONSTRAINT "payload_locked_documents_rels_bazi_feed_fk"
      FOREIGN KEY ("bazi_feed_id") REFERENCES "public"."bazi_feed"("id")
      ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;

  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_bazi_feed_id_idx"
    ON "payload_locked_documents_rels" USING btree ("bazi_feed_id");

  INSERT INTO "bazi_feed" ("kind", "message", "locale", "sort", "enabled", "created_at", "updated_at")
  SELECT * FROM (VALUES
    ('order'::"enum_bazi_feed_kind", '张** 刚刚完成了八字排盘', 'zh-CN'::"enum_bazi_feed_locale", 10, true, now(), now()),
    ('order'::"enum_bazi_feed_kind", '李** 解锁了完整命盘报告', 'zh-CN'::"enum_bazi_feed_locale", 20, true, now(), now()),
    ('order'::"enum_bazi_feed_kind", '王** 刚刚完成了双人合盘', 'zh-CN'::"enum_bazi_feed_locale", 30, true, now(), now()),
    ('review'::"enum_bazi_feed_kind", '「解读很准，五行分析帮我选对了水晶」— 来自上海的用户', 'zh-CN'::"enum_bazi_feed_locale", 40, true, now(), now()),
    ('review'::"enum_bazi_feed_kind", '「界面清爽，排盘速度快」— 来自广州的用户', 'zh-CN'::"enum_bazi_feed_locale", 50, true, now(), now()),
    ('order'::"enum_bazi_feed_kind", '陈** 刚刚完成了八字排盘', 'zh-CN'::"enum_bazi_feed_locale", 60, true, now(), now())
  ) AS seed(kind, message, locale, sort, enabled, created_at, updated_at)
  WHERE NOT EXISTS (SELECT 1 FROM "bazi_feed" LIMIT 1);
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP TABLE IF EXISTS "bazi_feed" CASCADE;
    DROP TYPE IF EXISTS "public"."enum_bazi_feed_locale";
    DROP TYPE IF EXISTS "public"."enum_bazi_feed_kind";
  `);
}
