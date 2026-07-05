CREATE TYPE "city_record_source" AS ENUM('seed', 'ai_confirmed');
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "city_records" (
  "id" serial PRIMARY KEY NOT NULL,
  "city" varchar(64) NOT NULL,
  "province" varchar(64) DEFAULT '' NOT NULL,
  "country" varchar(64) DEFAULT '中国' NOT NULL,
  "lng" double precision NOT NULL,
  "lat" double precision NOT NULL,
  "timezone" varchar(8) DEFAULT '+8' NOT NULL,
  "alias" jsonb DEFAULT '[]'::jsonb,
  "pinyin" varchar(16),
  "search_keys" jsonb DEFAULT '[]'::jsonb,
  "source" "city_record_source" DEFAULT 'ai_confirmed' NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "city_records_place_uidx" ON "city_records" ("city", "province", "country");
--> statement-breakpoint
GRANT ALL ON TABLE "city_records" TO orasage;
GRANT ALL ON SEQUENCE city_records_id_seq TO orasage;
