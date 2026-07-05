-- 塔罗 V2：计费 SKU 配置 + 每日运势报告后推荐商品

CREATE TABLE IF NOT EXISTS "tarot_billing_config" (
  "id" integer PRIMARY KEY DEFAULT 1,
  "daily_overage_sku" varchar(100) NOT NULL DEFAULT 'tarot-daily-draw',
  "three_card_report_sku" varchar(100) NOT NULL DEFAULT 'report-tarot',
  "three_card_bundle_sku" varchar(100) NOT NULL DEFAULT 'report-tarot-bundle',
  "updated_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "tarot_billing_config_singleton" CHECK ("id" = 1)
);

INSERT INTO "tarot_billing_config" ("id", "daily_overage_sku", "three_card_report_sku", "three_card_bundle_sku")
VALUES (1, 'tarot-daily-draw', 'report-tarot', 'report-tarot-bundle')
ON CONFLICT ("id") DO NOTHING;

CREATE TABLE IF NOT EXISTS "tarot_daily_recommend_products" (
  "id" serial PRIMARY KEY NOT NULL,
  "sku" varchar(100) NOT NULL,
  "sort_order" integer NOT NULL DEFAULT 0,
  "active" boolean NOT NULL DEFAULT true,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

INSERT INTO "products" ("sku", "name", "description", "price_cents", "price_cents_usd", "category", "requires_shipping", "active", "sort_order")
VALUES
  ('tarot-daily-draw', '塔罗每日运势加抽', '当日免费运势次数用尽后，额外抽取一次 AI 四维运势解读', 990, 138, 'report', false, true, 30),
  ('report-tarot-bundle', '塔罗深度解读+能量法器', '三牌阵完整报告 + 专属能量法器（实体发货）', 12800, 1778, 'report', true, true, 31)
ON CONFLICT ("sku") DO UPDATE SET
  "name" = EXCLUDED."name",
  "description" = EXCLUDED."description",
  "price_cents" = EXCLUDED."price_cents",
  "price_cents_usd" = EXCLUDED."price_cents_usd",
  "category" = EXCLUDED."category",
  "requires_shipping" = EXCLUDED."requires_shipping",
  "active" = EXCLUDED."active";
