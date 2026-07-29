-- Phase D：多租户 partners / partner_modules / staff 绑定 + 配置表 partner_id

CREATE TABLE IF NOT EXISTS "partners" (
  "id" serial PRIMARY KEY,
  "slug" varchar(64) NOT NULL UNIQUE,
  "name" varchar(200) NOT NULL,
  "status" varchar(20) NOT NULL DEFAULT 'active',
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "partner_modules" (
  "id" serial PRIMARY KEY,
  "partner_id" varchar(64) NOT NULL,
  "module_key" varchar(64) NOT NULL,
  "enabled" boolean NOT NULL DEFAULT true,
  "created_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "partner_modules_partner_module_uidx" UNIQUE ("partner_id", "module_key")
);

CREATE INDEX IF NOT EXISTS "partner_modules_partner_idx" ON "partner_modules" ("partner_id");

INSERT INTO "partners" ("slug", "name", "status")
VALUES
  ('orasage', 'OraSage 平台自营', 'active'),
  ('demo-partner', '演示合作方（隔离测试）', 'active')
ON CONFLICT ("slug") DO NOTHING;

-- 平台自营：全模块
INSERT INTO "partner_modules" ("partner_id", "module_key", "enabled")
SELECT 'orasage', m, true
FROM unnest(ARRAY[
  'shop', 'billing', 'content', 'legal', 'ops', 'analytics',
  'app.bazi', 'app.ziwei', 'app.tarot', 'platform'
]) AS m
ON CONFLICT ("partner_id", "module_key") DO NOTHING;

-- 演示合作方：缩略模块（无 platform / finance）
INSERT INTO "partner_modules" ("partner_id", "module_key", "enabled")
SELECT 'demo-partner', m, true
FROM unnest(ARRAY[
  'shop', 'billing', 'content', 'legal', 'ops', 'analytics', 'app.tarot'
]) AS m
ON CONFLICT ("partner_id", "module_key") DO NOTHING;

ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "partner_id" varchar(64);
UPDATE "users"
SET "partner_id" = 'orasage'
WHERE "role" IN ('admin', 'shop_ops', 'content_ops')
  AND ("partner_id" IS NULL OR "partner_id" = '');
CREATE INDEX IF NOT EXISTS "users_partner_id_idx" ON "users" ("partner_id");

-- 配置 / 运营表回填 partner_id（默认 orasage）
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "partner_id" varchar(64) NOT NULL DEFAULT 'orasage';
CREATE INDEX IF NOT EXISTS "products_partner_id_idx" ON "products" ("partner_id");

ALTER TABLE "product_categories" ADD COLUMN IF NOT EXISTS "partner_id" varchar(64) NOT NULL DEFAULT 'orasage';
CREATE INDEX IF NOT EXISTS "product_categories_partner_id_idx" ON "product_categories" ("partner_id");

ALTER TABLE "product_tag_groups" ADD COLUMN IF NOT EXISTS "partner_id" varchar(64) NOT NULL DEFAULT 'orasage';
CREATE INDEX IF NOT EXISTS "product_tag_groups_partner_id_idx" ON "product_tag_groups" ("partner_id");

ALTER TABLE "product_tags" ADD COLUMN IF NOT EXISTS "partner_id" varchar(64) NOT NULL DEFAULT 'orasage';
CREATE INDEX IF NOT EXISTS "product_tags_partner_id_idx" ON "product_tags" ("partner_id");

ALTER TABLE "app_billing_slots" ADD COLUMN IF NOT EXISTS "partner_id" varchar(64) NOT NULL DEFAULT 'orasage';
CREATE INDEX IF NOT EXISTS "app_billing_slots_partner_id_idx" ON "app_billing_slots" ("partner_id");

ALTER TABLE "homepage_featured_products" ADD COLUMN IF NOT EXISTS "partner_id" varchar(64) NOT NULL DEFAULT 'orasage';
DO $$ BEGIN
  ALTER TABLE "homepage_featured_products" DROP CONSTRAINT IF EXISTS "homepage_featured_products_sku_key";
EXCEPTION WHEN undefined_object THEN NULL;
END $$;
CREATE UNIQUE INDEX IF NOT EXISTS "homepage_featured_partner_sku_uidx"
  ON "homepage_featured_products" ("partner_id", "sku");

ALTER TABLE "diy_beads" ADD COLUMN IF NOT EXISTS "partner_id" varchar(64) NOT NULL DEFAULT 'orasage';
CREATE INDEX IF NOT EXISTS "diy_beads_partner_id_idx" ON "diy_beads" ("partner_id");

ALTER TABLE "diy_config" ADD COLUMN IF NOT EXISTS "partner_id" varchar(64) NOT NULL DEFAULT 'orasage';
CREATE UNIQUE INDEX IF NOT EXISTS "diy_config_partner_uidx" ON "diy_config" ("partner_id");

ALTER TABLE "coupons" ADD COLUMN IF NOT EXISTS "partner_id" varchar(64) NOT NULL DEFAULT 'orasage';
CREATE INDEX IF NOT EXISTS "coupons_partner_id_idx" ON "coupons" ("partner_id");

ALTER TABLE "shipping_zones" ADD COLUMN IF NOT EXISTS "partner_id" varchar(64) NOT NULL DEFAULT 'orasage';
CREATE INDEX IF NOT EXISTS "shipping_zones_partner_id_idx" ON "shipping_zones" ("partner_id");

ALTER TABLE "product_reviews" ADD COLUMN IF NOT EXISTS "partner_id" varchar(64) NOT NULL DEFAULT 'orasage';
CREATE INDEX IF NOT EXISTS "product_reviews_partner_id_idx" ON "product_reviews" ("partner_id");

ALTER TABLE "contact_messages" ADD COLUMN IF NOT EXISTS "partner_id" varchar(64) NOT NULL DEFAULT 'orasage';
CREATE INDEX IF NOT EXISTS "contact_messages_partner_id_idx" ON "contact_messages" ("partner_id");

ALTER TABLE "user_orders" ADD COLUMN IF NOT EXISTS "partner_id" varchar(64) NOT NULL DEFAULT 'orasage';
CREATE INDEX IF NOT EXISTS "user_orders_partner_id_idx" ON "user_orders" ("partner_id");

ALTER TABLE "chat_conversations" ADD COLUMN IF NOT EXISTS "partner_id" varchar(64) NOT NULL DEFAULT 'orasage';
CREATE INDEX IF NOT EXISTS "chat_conversations_partner_id_idx" ON "chat_conversations" ("partner_id");

ALTER TABLE "analytics_events" ADD COLUMN IF NOT EXISTS "partner_id" varchar(64) NOT NULL DEFAULT 'orasage';
CREATE INDEX IF NOT EXISTS "analytics_events_partner_id_idx" ON "analytics_events" ("partner_id");

-- shop_settings：复合主键 (partner_id, key)
ALTER TABLE "shop_settings" ADD COLUMN IF NOT EXISTS "partner_id" varchar(64) NOT NULL DEFAULT 'orasage';
DO $$ BEGIN
  ALTER TABLE "shop_settings" DROP CONSTRAINT IF EXISTS "shop_settings_pkey";
EXCEPTION WHEN undefined_object THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE "shop_settings" ADD PRIMARY KEY ("partner_id", "key");
EXCEPTION WHEN invalid_table_definition THEN NULL;
END $$;
