import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres';

/** 商城商品详情页 + 精选评价（方案 C 内容驱动） */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  DO $$ BEGIN
    CREATE TYPE "public"."enum_shop_product_pages_locale" AS ENUM('zh-CN');
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;

  DO $$ BEGIN
    CREATE TYPE "public"."enum_shop_product_pages_status" AS ENUM('draft', 'published');
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;

  DO $$ BEGIN
    CREATE TYPE "public"."enum_shop_product_pages_sections_type" AS ENUM(
      'richText', 'specList', 'guide', 'quote', 'faq', 'relatedSkus'
    );
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;

  DO $$ BEGIN
    CREATE TYPE "public"."enum_shop_product_testimonials_locale" AS ENUM('zh-CN');
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;

  CREATE TABLE IF NOT EXISTS "shop_product_pages" (
    "id" serial PRIMARY KEY NOT NULL,
    "sku" varchar NOT NULL,
    "locale" "enum_shop_product_pages_locale" DEFAULT 'zh-CN' NOT NULL,
    "status" "enum_shop_product_pages_status" DEFAULT 'draft' NOT NULL,
    "subtitle" varchar,
    "seo_title" varchar,
    "seo_description" varchar,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE INDEX IF NOT EXISTS "shop_product_pages_sku_idx" ON "shop_product_pages" ("sku");
  CREATE UNIQUE INDEX IF NOT EXISTS "shop_product_pages_sku_locale_idx"
    ON "shop_product_pages" ("sku", "locale");

  CREATE TABLE IF NOT EXISTS "shop_product_pages_hero_images" (
    "id" varchar PRIMARY KEY NOT NULL,
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "image_id" integer,
    "alt" varchar,
    "sort" numeric DEFAULT 0
  );

  CREATE INDEX IF NOT EXISTS "shop_product_pages_hero_images_order_idx"
    ON "shop_product_pages_hero_images" ("_order");
  CREATE INDEX IF NOT EXISTS "shop_product_pages_hero_images_parent_id_idx"
    ON "shop_product_pages_hero_images" ("_parent_id");

  DO $$ BEGIN
    ALTER TABLE "shop_product_pages_hero_images"
      ADD CONSTRAINT "shop_product_pages_hero_images_parent_id_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "public"."shop_product_pages"("id")
      ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;

  DO $$ BEGIN
    ALTER TABLE "shop_product_pages_hero_images"
      ADD CONSTRAINT "shop_product_pages_hero_images_image_id_media_id_fk"
      FOREIGN KEY ("image_id") REFERENCES "public"."media"("id")
      ON DELETE set null ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;

  CREATE TABLE IF NOT EXISTS "shop_product_pages_sections" (
    "id" varchar PRIMARY KEY NOT NULL,
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "type" "enum_shop_product_pages_sections_type" NOT NULL,
    "title" varchar,
    "body" varchar,
    "quote" varchar,
    "attribution" varchar
  );

  CREATE INDEX IF NOT EXISTS "shop_product_pages_sections_order_idx"
    ON "shop_product_pages_sections" ("_order");
  CREATE INDEX IF NOT EXISTS "shop_product_pages_sections_parent_id_idx"
    ON "shop_product_pages_sections" ("_parent_id");

  DO $$ BEGIN
    ALTER TABLE "shop_product_pages_sections"
      ADD CONSTRAINT "shop_product_pages_sections_parent_id_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "public"."shop_product_pages"("id")
      ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;

  CREATE TABLE IF NOT EXISTS "shop_product_pages_sections_spec_items" (
    "id" varchar PRIMARY KEY NOT NULL,
    "_order" integer NOT NULL,
    "_parent_id" varchar NOT NULL,
    "label" varchar NOT NULL,
    "value" varchar NOT NULL
  );

  CREATE INDEX IF NOT EXISTS "shop_product_pages_sections_spec_items_order_idx"
    ON "shop_product_pages_sections_spec_items" ("_order");
  CREATE INDEX IF NOT EXISTS "shop_product_pages_sections_spec_items_parent_id_idx"
    ON "shop_product_pages_sections_spec_items" ("_parent_id");

  DO $$ BEGIN
    ALTER TABLE "shop_product_pages_sections_spec_items"
      ADD CONSTRAINT "shop_product_pages_sections_spec_items_parent_id_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "public"."shop_product_pages_sections"("id")
      ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;

  CREATE TABLE IF NOT EXISTS "shop_product_pages_sections_faq_items" (
    "id" varchar PRIMARY KEY NOT NULL,
    "_order" integer NOT NULL,
    "_parent_id" varchar NOT NULL,
    "question" varchar NOT NULL,
    "answer" varchar NOT NULL
  );

  CREATE INDEX IF NOT EXISTS "shop_product_pages_sections_faq_items_order_idx"
    ON "shop_product_pages_sections_faq_items" ("_order");
  CREATE INDEX IF NOT EXISTS "shop_product_pages_sections_faq_items_parent_id_idx"
    ON "shop_product_pages_sections_faq_items" ("_parent_id");

  DO $$ BEGIN
    ALTER TABLE "shop_product_pages_sections_faq_items"
      ADD CONSTRAINT "shop_product_pages_sections_faq_items_parent_id_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "public"."shop_product_pages_sections"("id")
      ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;

  CREATE TABLE IF NOT EXISTS "shop_product_pages_sections_related_skus" (
    "id" varchar PRIMARY KEY NOT NULL,
    "_order" integer NOT NULL,
    "_parent_id" varchar NOT NULL,
    "sku" varchar NOT NULL
  );

  CREATE INDEX IF NOT EXISTS "shop_product_pages_sections_related_skus_order_idx"
    ON "shop_product_pages_sections_related_skus" ("_order");
  CREATE INDEX IF NOT EXISTS "shop_product_pages_sections_related_skus_parent_id_idx"
    ON "shop_product_pages_sections_related_skus" ("_parent_id");

  DO $$ BEGIN
    ALTER TABLE "shop_product_pages_sections_related_skus"
      ADD CONSTRAINT "shop_product_pages_sections_related_skus_parent_id_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "public"."shop_product_pages_sections"("id")
      ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;

  CREATE TABLE IF NOT EXISTS "shop_product_testimonials" (
    "id" serial PRIMARY KEY NOT NULL,
    "sku" varchar NOT NULL,
    "author" varchar NOT NULL,
    "rating" numeric NOT NULL DEFAULT 5,
    "body" varchar NOT NULL,
    "avatar_id" integer,
    "locale" "enum_shop_product_testimonials_locale" DEFAULT 'zh-CN',
    "sort" numeric DEFAULT 0,
    "enabled" boolean DEFAULT true,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE INDEX IF NOT EXISTS "shop_product_testimonials_sku_idx" ON "shop_product_testimonials" ("sku");
  CREATE INDEX IF NOT EXISTS "shop_product_testimonials_locale_idx" ON "shop_product_testimonials" ("locale");

  DO $$ BEGIN
    ALTER TABLE "shop_product_testimonials"
      ADD CONSTRAINT "shop_product_testimonials_avatar_id_media_id_fk"
      FOREIGN KEY ("avatar_id") REFERENCES "public"."media"("id")
      ON DELETE set null ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;

  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "shop_product_pages_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "shop_product_testimonials_id" integer;

  DO $$ BEGIN
    ALTER TABLE "payload_locked_documents_rels"
      ADD CONSTRAINT "payload_locked_documents_rels_shop_product_pages_fk"
      FOREIGN KEY ("shop_product_pages_id") REFERENCES "public"."shop_product_pages"("id")
      ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;

  DO $$ BEGIN
    ALTER TABLE "payload_locked_documents_rels"
      ADD CONSTRAINT "payload_locked_documents_rels_shop_product_testimonials_fk"
      FOREIGN KEY ("shop_product_testimonials_id") REFERENCES "public"."shop_product_testimonials"("id")
      ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;

  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_shop_product_pages_id_idx"
    ON "payload_locked_documents_rels" ("shop_product_pages_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_shop_product_testimonials_id_idx"
    ON "payload_locked_documents_rels" ("shop_product_testimonials_id");
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_shop_product_testimonials_fk";
    ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_shop_product_pages_fk";
    ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "shop_product_testimonials_id";
    ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "shop_product_pages_id";

    DROP TABLE IF EXISTS "shop_product_testimonials" CASCADE;
    DROP TABLE IF EXISTS "shop_product_pages_sections_related_skus" CASCADE;
    DROP TABLE IF EXISTS "shop_product_pages_sections_faq_items" CASCADE;
    DROP TABLE IF EXISTS "shop_product_pages_sections_spec_items" CASCADE;
    DROP TABLE IF EXISTS "shop_product_pages_sections" CASCADE;
    DROP TABLE IF EXISTS "shop_product_pages_hero_images" CASCADE;
    DROP TABLE IF EXISTS "shop_product_pages" CASCADE;

    DROP TYPE IF EXISTS "public"."enum_shop_product_testimonials_locale";
    DROP TYPE IF EXISTS "public"."enum_shop_product_pages_sections_type";
    DROP TYPE IF EXISTS "public"."enum_shop_product_pages_status";
    DROP TYPE IF EXISTS "public"."enum_shop_product_pages_locale";
  `);
}
