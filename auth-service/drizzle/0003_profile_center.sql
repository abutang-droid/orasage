-- displayId + saved profiles + order shipping address
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "display_id" varchar(9);
CREATE UNIQUE INDEX IF NOT EXISTS "users_display_id_idx" ON "users" ("display_id");

ALTER TABLE "user_orders" ADD COLUMN IF NOT EXISTS "shipping_address" text;

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

CREATE INDEX IF NOT EXISTS "saved_profiles_user_id_idx" ON "saved_profiles" ("user_id");
