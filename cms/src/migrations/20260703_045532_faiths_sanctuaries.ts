import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_wp_status" AS ENUM('publish', 'draft');
  CREATE TYPE "public"."enum_pages_wp_type" AS ENUM('doc', 'post', 'page');
  CREATE TYPE "public"."enum_faiths_wp_status" AS ENUM('publish', 'draft');
  CREATE TYPE "public"."enum_sanctuaries_tradition" AS ENUM('latin', 'seasia', 'global');
  CREATE TYPE "public"."enum_sanctuaries_wp_status" AS ENUM('publish', 'draft');
  ALTER TYPE "public"."enum_pages_app_source" ADD VALUE 'daozang' BEFORE 'main';
  ALTER TYPE "public"."enum_pages_app_source" ADD VALUE 'famous' BEFORE 'main';
  CREATE TABLE "faiths" (
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
  
  CREATE TABLE "sanctuaries_domains" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL
  );
  
  CREATE TABLE "sanctuaries" (
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
  
  CREATE TABLE "sanctuaries_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"faiths_id" integer
  );
  
  ALTER TABLE "pages" ALTER COLUMN "app_source" SET DEFAULT 'daozang';
  ALTER TABLE "pages" ALTER COLUMN "app_source" SET NOT NULL;
  ALTER TABLE "pages" ADD COLUMN "wp_status" "enum_pages_wp_status" DEFAULT 'publish';
  ALTER TABLE "pages" ADD COLUMN "legacy_html" varchar;
  ALTER TABLE "pages" ADD COLUMN "source_url" varchar;
  ALTER TABLE "pages" ADD COLUMN "wp_type" "enum_pages_wp_type";
  ALTER TABLE "pages" ADD COLUMN "wp_id" numeric;
  ALTER TABLE "pages" ADD COLUMN "locale" varchar;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "faiths_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "sanctuaries_id" integer;
  ALTER TABLE "sanctuaries_domains" ADD CONSTRAINT "sanctuaries_domains_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."sanctuaries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "sanctuaries" ADD CONSTRAINT "sanctuaries_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "sanctuaries_rels" ADD CONSTRAINT "sanctuaries_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."sanctuaries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "sanctuaries_rels" ADD CONSTRAINT "sanctuaries_rels_faiths_fk" FOREIGN KEY ("faiths_id") REFERENCES "public"."faiths"("id") ON DELETE cascade ON UPDATE no action;
  CREATE UNIQUE INDEX "faiths_code_idx" ON "faiths" USING btree ("code");
  CREATE INDEX "faiths_updated_at_idx" ON "faiths" USING btree ("updated_at");
  CREATE INDEX "faiths_created_at_idx" ON "faiths" USING btree ("created_at");
  CREATE INDEX "sanctuaries_domains_order_idx" ON "sanctuaries_domains" USING btree ("_order");
  CREATE INDEX "sanctuaries_domains_parent_id_idx" ON "sanctuaries_domains" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "sanctuaries_code_idx" ON "sanctuaries" USING btree ("code");
  CREATE INDEX "sanctuaries_image_idx" ON "sanctuaries" USING btree ("image_id");
  CREATE INDEX "sanctuaries_updated_at_idx" ON "sanctuaries" USING btree ("updated_at");
  CREATE INDEX "sanctuaries_created_at_idx" ON "sanctuaries" USING btree ("created_at");
  CREATE INDEX "sanctuaries_rels_order_idx" ON "sanctuaries_rels" USING btree ("order");
  CREATE INDEX "sanctuaries_rels_parent_idx" ON "sanctuaries_rels" USING btree ("parent_id");
  CREATE INDEX "sanctuaries_rels_path_idx" ON "sanctuaries_rels" USING btree ("path");
  CREATE INDEX "sanctuaries_rels_faiths_id_idx" ON "sanctuaries_rels" USING btree ("faiths_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_faiths_fk" FOREIGN KEY ("faiths_id") REFERENCES "public"."faiths"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_sanctuaries_fk" FOREIGN KEY ("sanctuaries_id") REFERENCES "public"."sanctuaries"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_wp_id_idx" ON "pages" USING btree ("wp_id");
  CREATE INDEX "payload_locked_documents_rels_faiths_id_idx" ON "payload_locked_documents_rels" USING btree ("faiths_id");
  CREATE INDEX "payload_locked_documents_rels_sanctuaries_id_idx" ON "payload_locked_documents_rels" USING btree ("sanctuaries_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "faiths" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "sanctuaries_domains" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "sanctuaries" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "sanctuaries_rels" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "faiths" CASCADE;
  DROP TABLE "sanctuaries_domains" CASCADE;
  DROP TABLE "sanctuaries" CASCADE;
  DROP TABLE "sanctuaries_rels" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_faiths_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_sanctuaries_fk";
  
  ALTER TABLE "pages" ALTER COLUMN "app_source" SET DATA TYPE text;
  ALTER TABLE "pages" ALTER COLUMN "app_source" SET DEFAULT 'main'::text;
  DROP TYPE "public"."enum_pages_app_source";
  CREATE TYPE "public"."enum_pages_app_source" AS ENUM('main', 'bazi', 'ziwei', 'tarot', 'shop');
  ALTER TABLE "pages" ALTER COLUMN "app_source" SET DEFAULT 'main'::"public"."enum_pages_app_source";
  ALTER TABLE "pages" ALTER COLUMN "app_source" SET DATA TYPE "public"."enum_pages_app_source" USING "app_source"::"public"."enum_pages_app_source";
  DROP INDEX "pages_wp_id_idx";
  DROP INDEX "payload_locked_documents_rels_faiths_id_idx";
  DROP INDEX "payload_locked_documents_rels_sanctuaries_id_idx";
  ALTER TABLE "pages" ALTER COLUMN "app_source" DROP NOT NULL;
  ALTER TABLE "pages" DROP COLUMN "wp_status";
  ALTER TABLE "pages" DROP COLUMN "legacy_html";
  ALTER TABLE "pages" DROP COLUMN "source_url";
  ALTER TABLE "pages" DROP COLUMN "wp_type";
  ALTER TABLE "pages" DROP COLUMN "wp_id";
  ALTER TABLE "pages" DROP COLUMN "locale";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "faiths_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "sanctuaries_id";
  DROP TYPE "public"."enum_pages_wp_status";
  DROP TYPE "public"."enum_pages_wp_type";
  DROP TYPE "public"."enum_faiths_wp_status";
  DROP TYPE "public"."enum_sanctuaries_tradition";
  DROP TYPE "public"."enum_sanctuaries_wp_status";`)
}
