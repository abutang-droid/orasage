-- 7c 用户钱包：余额表 + 流水表（前台暂不展示，仅 internal + admin）

DO $$ BEGIN
  CREATE TYPE "wallet_ledger_kind" AS ENUM ('credit', 'debit', 'adjustment', 'refund', 'hold', 'release');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "user_wallets" (
  "id" serial PRIMARY KEY NOT NULL,
  "user_id" integer NOT NULL,
  "currency" varchar(8) NOT NULL DEFAULT 'CNY',
  "balance_cents" integer NOT NULL DEFAULT 0,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "user_wallets_user_currency_unique" UNIQUE ("user_id", "currency")
);

CREATE INDEX IF NOT EXISTS "user_wallets_user_id_idx" ON "user_wallets" ("user_id");

CREATE TABLE IF NOT EXISTS "wallet_ledger_entries" (
  "id" serial PRIMARY KEY NOT NULL,
  "wallet_id" integer NOT NULL,
  "user_id" integer NOT NULL,
  "currency" varchar(8) NOT NULL,
  "kind" "wallet_ledger_kind" NOT NULL,
  "amount_cents" integer NOT NULL,
  "balance_after_cents" integer NOT NULL,
  "reference_type" varchar(50),
  "reference_id" varchar(100),
  "note" text,
  "created_by" integer,
  "idempotency_key" varchar(120),
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "wallet_ledger_idempotency_key_idx"
  ON "wallet_ledger_entries" ("idempotency_key")
  WHERE "idempotency_key" IS NOT NULL;

CREATE INDEX IF NOT EXISTS "wallet_ledger_user_id_idx" ON "wallet_ledger_entries" ("user_id");
CREATE INDEX IF NOT EXISTS "wallet_ledger_wallet_id_idx" ON "wallet_ledger_entries" ("wallet_id");
CREATE INDEX IF NOT EXISTS "wallet_ledger_created_at_idx" ON "wallet_ledger_entries" ("created_at");
