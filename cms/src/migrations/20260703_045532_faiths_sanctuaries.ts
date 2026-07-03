import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/** Faiths + Sanctuaries only — pages/wp fields were applied in earlier migrations. */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  DO $$ BEGIN
    CREATE TYPE "public"."enum_faiths_wp_status" AS ENUM('publish', 'draft');
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;

  DO $$ BEGIN
    CREATE TYPE "public"."enum_sanctuaries_tradition" AS ENUM('latin', 'seasia', 'global');
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;

  DO $$ BEGIN
    CREATE TYPE "public"."enum_sanctuaries_wp_status" AS ENUM('publish', 'draft');
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;

  CREATE TABLE IF NOT EXISTS "faiths" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"code" varchar NOT NULL,
  	"name_zh" varchar NOT NULL,
  	"name_en" varchar NOT NULL,
  	"emoji" varchar,
  	"rank" numeric DEFAULT 50,
  	"adherents_m" numeric,
  	"wp_status" "enum_faiths_wp_status" DEFAULT 'publish',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE IF NOT EXISTS "sanctuaries" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"code" varchar NOT NULL,
  	"name_zh" varchar NOT NULL,
  	"name_en" varchar NOT NULL,
  	"tradition" "enum_sanctuaries_tradition" DEFAULT 'global',
  	"region" varchar,
  	"color" varchar DEFAULT '#b8943f',
  	"gradient" varchar,
  	"image_url" varchar,
  	"image_id" integer,
  	"blessing_text" varchar,
  	"content" jsonb,
  	"sort_order" numeric DEFAULT 0,
  	"wp_status" "enum_sanctuaries_wp_status" DEFAULT 'publish',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE IF NOT EXISTS "sanctuaries_domains" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL
  );

  CREATE TABLE IF NOT EXISTS "sanctuaries_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"faiths_id" integer
  );

  ALTER TABLE "sanctuaries_domains" DROP CONSTRAINT IF EXISTS "sanctuaries_domains_parent_id_fk";
  ALTER TABLE "sanctuaries" DROP CONSTRAINT IF EXISTS "sanctuaries_image_id_media_id_fk";
  ALTER TABLE "sanctuaries_rels" DROP CONSTRAINT IF EXISTS "sanctuaries_rels_parent_fk";
  ALTER TABLE "sanctuaries_rels" DROP CONSTRAINT IF EXISTS "sanctuaries_rels_faiths_fk";
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_faiths_fk";
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_sanctuaries_fk";

  ALTER TABLE "sanctuaries_domains" ADD CONSTRAINT "sanctuaries_domains_parent_id_fk"
    FOREIGN KEY ("_parent_id") REFERENCES "public"."sanctuaries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "sanctuaries" ADD CONSTRAINT "sanctuaries_image_id_media_id_fk"
    FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "sanctuaries_rels" ADD CONSTRAINT "sanctuaries_rels_parent_fk"
    FOREIGN KEY ("parent_id") REFERENCES "public"."sanctuaries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "sanctuaries_rels" ADD CONSTRAINT "sanctuaries_rels_faiths_fk"
    FOREIGN KEY ("faiths_id") REFERENCES "public"."faiths"("id") ON DELETE cascade ON UPDATE no action;

  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "faiths_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "sanctuaries_id" integer;

  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_faiths_fk"
    FOREIGN KEY ("faiths_id") REFERENCES "public"."faiths"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_sanctuaries_fk"
    FOREIGN KEY ("sanctuaries_id") REFERENCES "public"."sanctuaries"("id") ON DELETE cascade ON UPDATE no action;

  CREATE UNIQUE INDEX IF NOT EXISTS "faiths_code_idx" ON "faiths" USING btree ("code");
  CREATE INDEX IF NOT EXISTS "faiths_updated_at_idx" ON "faiths" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "faiths_created_at_idx" ON "faiths" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "sanctuaries_domains_order_idx" ON "sanctuaries_domains" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "sanctuaries_domains_parent_id_idx" ON "sanctuaries_domains" USING btree ("_parent_id");
  CREATE UNIQUE INDEX IF NOT EXISTS "sanctuaries_code_idx" ON "sanctuaries" USING btree ("code");
  CREATE INDEX IF NOT EXISTS "sanctuaries_image_idx" ON "sanctuaries" USING btree ("image_id");
  CREATE INDEX IF NOT EXISTS "sanctuaries_updated_at_idx" ON "sanctuaries" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "sanctuaries_created_at_idx" ON "sanctuaries" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "sanctuaries_rels_order_idx" ON "sanctuaries_rels" USING btree ("order");
  CREATE INDEX IF NOT EXISTS "sanctuaries_rels_parent_idx" ON "sanctuaries_rels" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "sanctuaries_rels_path_idx" ON "sanctuaries_rels" USING btree ("path");
  CREATE INDEX IF NOT EXISTS "sanctuaries_rels_faiths_id_idx" ON "sanctuaries_rels" USING btree ("faiths_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_faiths_id_idx" ON "payload_locked_documents_rels" USING btree ("faiths_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_sanctuaries_id_idx" ON "payload_locked_documents_rels" USING btree ("sanctuaries_id");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_faiths_fk";
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_sanctuaries_fk";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "faiths_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "sanctuaries_id";
  DROP TABLE IF EXISTS "sanctuaries_rels" CASCADE;
  DROP TABLE IF EXISTS "sanctuaries_domains" CASCADE;
  DROP TABLE IF EXISTS "sanctuaries" CASCADE;
  DROP TABLE IF EXISTS "faiths" CASCADE;
  DROP TYPE IF EXISTS "public"."enum_faiths_wp_status";
  DROP TYPE IF EXISTS "public"."enum_sanctuaries_tradition";
  DROP TYPE IF EXISTS "public"."enum_sanctuaries_wp_status";
  `)
}
