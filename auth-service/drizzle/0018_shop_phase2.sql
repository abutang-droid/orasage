DO $$ BEGIN
  CREATE TYPE "shipment_status" AS ENUM('pending', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS "user_addresses" (
  "id" serial PRIMARY KEY NOT NULL,
  "user_id" integer NOT NULL,
  "label" varchar(50),
  "name" varchar(100) NOT NULL,
  "phone" varchar(40) NOT NULL,
  "country_code" varchar(2) DEFAULT 'CN' NOT NULL,
  "province" varchar(100),
  "city" varchar(100),
  "district" varchar(100),
  "address_line" varchar(500) NOT NULL,
  "postal_code" varchar(20),
  "wrist_cm" varchar(20),
  "is_default" boolean DEFAULT false NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "user_addresses_user_id_idx" ON "user_addresses" ("user_id");

CREATE TABLE IF NOT EXISTS "order_shipments" (
  "id" serial PRIMARY KEY NOT NULL,
  "order_no" varchar(64) NOT NULL,
  "carrier" varchar(100) NOT NULL,
  "tracking_no" varchar(100) NOT NULL,
  "status" "shipment_status" DEFAULT 'in_transit' NOT NULL,
  "shipped_at" timestamp,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "order_shipments_order_no_idx" ON "order_shipments" ("order_no");

CREATE TABLE IF NOT EXISTS "order_shipment_events" (
  "id" serial PRIMARY KEY NOT NULL,
  "shipment_id" integer NOT NULL,
  "status" varchar(32) NOT NULL,
  "description" varchar(500) NOT NULL,
  "location" varchar(200),
  "occurred_at" timestamp NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "order_shipment_events_shipment_id_idx" ON "order_shipment_events" ("shipment_id");
