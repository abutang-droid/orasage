-- Hotfix: restore core auth tables if missing (users / readings / orders).
-- Safe to re-run: uses IF NOT EXISTS and ADD VALUE IF NOT EXISTS.

DO $$ BEGIN
  CREATE TYPE "public"."role" AS ENUM('user', 'admin');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TYPE "public"."role" ADD VALUE IF NOT EXISTS 'shop_ops';
ALTER TYPE "public"."role" ADD VALUE IF NOT EXISTS 'content_ops';

DO $$ BEGIN
  CREATE TYPE "public"."app_source" AS ENUM('bazi', 'ziwei', 'tarot');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TYPE "public"."app_source" ADD VALUE IF NOT EXISTS 'shop';

DO $$ BEGIN
  CREATE TYPE "public"."order_status" AS ENUM('pending', 'paid', 'shipped', 'completed', 'cancelled');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "users" (
  "id" serial PRIMARY KEY NOT NULL,
  "email" varchar(320) NOT NULL,
  "password_hash" varchar(255) NOT NULL,
  "display_id" varchar(9),
  "nickname" varchar(100) DEFAULT '' NOT NULL,
  "avatar_url" varchar(500),
  "birth_date" varchar(20),
  "birth_hour" varchar(10),
  "birth_place_province" varchar(50),
  "birth_place_city" varchar(50),
  "birthplace_longitude" varchar(20),
  "gender" varchar(10),
  "preferred_deity" varchar(50),
  "language_preference" varchar(10) DEFAULT 'zh-CN',
  "role" "role" DEFAULT 'user' NOT NULL,
  "staff_grants" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "staff_revokes" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "staff_disabled" boolean NOT NULL DEFAULT false,
  "staff_label" varchar(100),
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  "last_signed_in" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "users_email_unique" UNIQUE("email")
);

CREATE UNIQUE INDEX IF NOT EXISTS "users_display_id_idx" ON "users" ("display_id");

CREATE TABLE IF NOT EXISTS "user_readings" (
  "id" serial PRIMARY KEY NOT NULL,
  "user_id" integer NOT NULL,
  "app_source" "app_source" NOT NULL,
  "reading_id" varchar(100) NOT NULL,
  "title" varchar(200) NOT NULL,
  "summary" text,
  "recommendation_reason" text,
  "crystal_sku" varchar(100),
  "report_url" varchar(512),
  "payload_json" text,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "user_orders" (
  "id" serial PRIMARY KEY NOT NULL,
  "user_id" integer NOT NULL,
  "order_no" varchar(64) NOT NULL,
  "title" varchar(200) NOT NULL,
  "sku" varchar(100),
  "amount_cents" integer DEFAULT 0 NOT NULL,
  "currency" varchar(8) DEFAULT 'USD' NOT NULL,
  "status" "order_status" DEFAULT 'pending' NOT NULL,
  "app_source" "app_source",
  "shipping_address" text,
  "recommendation_context" text,
  "reading_id" varchar(100),
  "coupon_code" varchar(50),
  "subtotal_cents" integer,
  "created_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "user_orders_order_no_unique" UNIQUE("order_no")
);

CREATE TABLE IF NOT EXISTS "user_recommendations" (
  "id" serial PRIMARY KEY NOT NULL,
  "user_id" integer NOT NULL,
  "app_source" "app_source" NOT NULL,
  "crystal_sku" varchar(100) NOT NULL,
  "reason" text NOT NULL,
  "reading_id" varchar(100),
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "saved_profiles" (
  "id" serial PRIMARY KEY NOT NULL,
  "user_id" integer NOT NULL,
  "label" varchar(50),
  "name" varchar(100) NOT NULL,
  "gender" varchar(10),
  "birth_year" varchar(4),
  "birth_month" varchar(2),
  "birth_day" varchar(2),
  "birth_hour" varchar(2),
  "birth_minute" varchar(2),
  "birth_place_province" varchar(50),
  "birth_place_city" varchar(50),
  "birthplace_longitude" varchar(20),
  "source_app" "app_source",
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "user_readings_user_id_idx" ON "user_readings" ("user_id");
CREATE INDEX IF NOT EXISTS "user_orders_user_id_idx" ON "user_orders" ("user_id");
CREATE INDEX IF NOT EXISTS "saved_profiles_user_id_idx" ON "saved_profiles" ("user_id");
