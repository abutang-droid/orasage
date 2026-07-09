-- 7d-v1：Stripe 流水只读镜像（Charges / Refunds / Payouts / Balance）

CREATE TABLE IF NOT EXISTS "stripe_sync_runs" (
  "id" serial PRIMARY KEY NOT NULL,
  "status" varchar(20) NOT NULL DEFAULT 'running',
  "charges_upserted" integer NOT NULL DEFAULT 0,
  "refunds_upserted" integer NOT NULL DEFAULT 0,
  "payouts_upserted" integer NOT NULL DEFAULT 0,
  "error_message" text,
  "started_at" timestamp DEFAULT now() NOT NULL,
  "finished_at" timestamp
);

CREATE TABLE IF NOT EXISTS "stripe_balance_snapshots" (
  "id" serial PRIMARY KEY NOT NULL,
  "sync_run_id" integer,
  "currency" varchar(8) NOT NULL,
  "available_cents" integer NOT NULL DEFAULT 0,
  "pending_cents" integer NOT NULL DEFAULT 0,
  "captured_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "stripe_balance_snapshots_captured_at_idx"
  ON "stripe_balance_snapshots" ("captured_at" DESC);

CREATE TABLE IF NOT EXISTS "stripe_charges" (
  "id" serial PRIMARY KEY NOT NULL,
  "stripe_id" varchar(120) NOT NULL UNIQUE,
  "payment_intent_id" varchar(120),
  "order_no" varchar(64),
  "amount_cents" integer NOT NULL,
  "amount_refunded_cents" integer NOT NULL DEFAULT 0,
  "currency" varchar(8) NOT NULL DEFAULT 'cny',
  "status" varchar(30) NOT NULL,
  "paid" boolean NOT NULL DEFAULT false,
  "customer_email" varchar(320),
  "description" text,
  "metadata" jsonb NOT NULL DEFAULT '{}'::jsonb,
  "stripe_created_at" timestamp NOT NULL,
  "synced_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "stripe_charges_order_no_idx" ON "stripe_charges" ("order_no");
CREATE INDEX IF NOT EXISTS "stripe_charges_stripe_created_at_idx" ON "stripe_charges" ("stripe_created_at");

CREATE TABLE IF NOT EXISTS "stripe_refunds" (
  "id" serial PRIMARY KEY NOT NULL,
  "stripe_id" varchar(120) NOT NULL UNIQUE,
  "charge_stripe_id" varchar(120) NOT NULL,
  "order_no" varchar(64),
  "amount_cents" integer NOT NULL,
  "currency" varchar(8) NOT NULL DEFAULT 'cny',
  "status" varchar(30) NOT NULL,
  "reason" varchar(50),
  "stripe_created_at" timestamp NOT NULL,
  "synced_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "stripe_refunds_charge_stripe_id_idx" ON "stripe_refunds" ("charge_stripe_id");
CREATE INDEX IF NOT EXISTS "stripe_refunds_stripe_created_at_idx" ON "stripe_refunds" ("stripe_created_at");

CREATE TABLE IF NOT EXISTS "stripe_payouts" (
  "id" serial PRIMARY KEY NOT NULL,
  "stripe_id" varchar(120) NOT NULL UNIQUE,
  "amount_cents" integer NOT NULL,
  "currency" varchar(8) NOT NULL DEFAULT 'cny',
  "status" varchar(30) NOT NULL,
  "arrival_date" date,
  "stripe_created_at" timestamp NOT NULL,
  "synced_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "stripe_payouts_stripe_created_at_idx" ON "stripe_payouts" ("stripe_created_at");
