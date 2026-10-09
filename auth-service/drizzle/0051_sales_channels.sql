-- 销售渠道管理：渠道 + 成员（BD/运营/设计师/业务员/店面）+ 各级分成万分比

DO $$ BEGIN
  CREATE TYPE "channel_member_role" AS ENUM ('bd', 'ops', 'designer', 'salesperson', 'store');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "channel_status" AS ENUM ('active', 'disabled');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "sales_channels" (
  "id" serial PRIMARY KEY NOT NULL,
  "code" varchar(64) NOT NULL,
  "name" varchar(120) NOT NULL,
  "status" "channel_status" DEFAULT 'active' NOT NULL,
  "note" text,
  "owner_user_id" integer,
  "rate_bd_bps" integer DEFAULT 0 NOT NULL,
  "rate_ops_bps" integer DEFAULT 0 NOT NULL,
  "rate_designer_bps" integer DEFAULT 0 NOT NULL,
  "rate_salesperson_bps" integer DEFAULT 0 NOT NULL,
  "rate_store_bps" integer DEFAULT 0 NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "sales_channels_code_unique" UNIQUE ("code")
);

CREATE INDEX IF NOT EXISTS "sales_channels_owner_user_id_idx" ON "sales_channels" ("owner_user_id");
CREATE INDEX IF NOT EXISTS "sales_channels_status_idx" ON "sales_channels" ("status");

CREATE TABLE IF NOT EXISTS "sales_channel_members" (
  "id" serial PRIMARY KEY NOT NULL,
  "channel_id" integer NOT NULL,
  "member_role" "channel_member_role" NOT NULL,
  "name" varchar(120) NOT NULL,
  "user_id" integer,
  "commission_bps" integer,
  "contact" varchar(200),
  "address" varchar(500),
  "note" text,
  "disabled" boolean DEFAULT false NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "sales_channel_members_channel_id_idx" ON "sales_channel_members" ("channel_id");
CREATE INDEX IF NOT EXISTS "sales_channel_members_user_id_idx" ON "sales_channel_members" ("user_id");
CREATE INDEX IF NOT EXISTS "sales_channel_members_role_idx" ON "sales_channel_members" ("member_role");
