import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres';

/** Geo regions, countries, country-faith links for tarot temple journey */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  DO $$ BEGIN
    CREATE TYPE "public"."enum_geo_regions_wp_status" AS ENUM('publish', 'draft');
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;

  DO $$ BEGIN
    CREATE TYPE "public"."enum_geo_countries_wp_status" AS ENUM('publish', 'draft');
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;

  DO $$ BEGIN
    CREATE TYPE "public"."enum_country_faiths_wp_status" AS ENUM('publish', 'draft');
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;

  CREATE TABLE IF NOT EXISTS "geo_regions" (
    "id" serial PRIMARY KEY NOT NULL,
    "code" varchar NOT NULL,
    "name_zh" varchar NOT NULL,
    "name_en" varchar NOT NULL,
    "map_x" numeric NOT NULL,
    "map_y" numeric NOT NULL,
    "sort_order" numeric DEFAULT 0,
    "wp_status" "enum_geo_regions_wp_status" DEFAULT 'publish',
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE UNIQUE INDEX IF NOT EXISTS "geo_regions_code_idx" ON "geo_regions" ("code");

  CREATE TABLE IF NOT EXISTS "geo_countries" (
    "id" serial PRIMARY KEY NOT NULL,
    "code" varchar NOT NULL,
    "name_zh" varchar NOT NULL,
    "name_en" varchar NOT NULL,
    "region_id" integer NOT NULL,
    "sort_order" numeric DEFAULT 0,
    "wp_status" "enum_geo_countries_wp_status" DEFAULT 'publish',
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE UNIQUE INDEX IF NOT EXISTS "geo_countries_code_idx" ON "geo_countries" ("code");
  CREATE INDEX IF NOT EXISTS "geo_countries_region_idx" ON "geo_countries" ("region_id");

  CREATE TABLE IF NOT EXISTS "country_faiths" (
    "id" serial PRIMARY KEY NOT NULL,
    "label" varchar,
    "country_id" integer NOT NULL,
    "faith_id" integer NOT NULL,
    "prevalence" numeric NOT NULL DEFAULT 50,
    "is_primary" boolean DEFAULT false,
    "note" varchar,
    "wp_status" "enum_country_faiths_wp_status" DEFAULT 'publish',
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE INDEX IF NOT EXISTS "country_faiths_country_idx" ON "country_faiths" ("country_id");
  CREATE INDEX IF NOT EXISTS "country_faiths_faith_idx" ON "country_faiths" ("faith_id");

  DO $$ BEGIN
    ALTER TABLE "geo_countries" ADD CONSTRAINT "geo_countries_region_id_geo_regions_id_fk"
      FOREIGN KEY ("region_id") REFERENCES "public"."geo_regions"("id") ON DELETE restrict ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;

  DO $$ BEGIN
    ALTER TABLE "country_faiths" ADD CONSTRAINT "country_faiths_country_id_geo_countries_id_fk"
      FOREIGN KEY ("country_id") REFERENCES "public"."geo_countries"("id") ON DELETE restrict ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;

  DO $$ BEGIN
    ALTER TABLE "country_faiths" ADD CONSTRAINT "country_faiths_faith_id_faiths_id_fk"
      FOREIGN KEY ("faith_id") REFERENCES "public"."faiths"("id") ON DELETE restrict ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;

  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "geo_regions_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "geo_countries_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "country_faiths_id" integer;

  DO $$ BEGIN
    ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_geo_regions_fk"
      FOREIGN KEY ("geo_regions_id") REFERENCES "public"."geo_regions"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;

  DO $$ BEGIN
    ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_geo_countries_fk"
      FOREIGN KEY ("geo_countries_id") REFERENCES "public"."geo_countries"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;

  DO $$ BEGIN
    ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_country_faiths_fk"
      FOREIGN KEY ("country_faiths_id") REFERENCES "public"."country_faiths"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "country_faiths_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "geo_countries_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "geo_regions_id";
  DROP TABLE IF EXISTS "country_faiths" CASCADE;
  DROP TABLE IF EXISTS "geo_countries" CASCADE;
  DROP TABLE IF EXISTS "geo_regions" CASCADE;
  DROP TYPE IF EXISTS "enum_country_faiths_wp_status";
  DROP TYPE IF EXISTS "enum_geo_countries_wp_status";
  DROP TYPE IF EXISTS "enum_geo_regions_wp_status";
  `);
}
