-- 紫微问答额度与商品推荐（非报告模式）

CREATE TABLE IF NOT EXISTS "ziwei_chat_accounts" (
  "user_id" integer PRIMARY KEY NOT NULL,
  "pack_credits" integer NOT NULL DEFAULT 0,
  "yearly_expires_at" timestamp,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "ziwei_reading_chat" (
  "id" serial PRIMARY KEY NOT NULL,
  "user_id" integer NOT NULL,
  "reading_id" varchar(100) NOT NULL,
  "free_questions_used" integer NOT NULL DEFAULT 0,
  "total_questions_used" integer NOT NULL DEFAULT 0,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "ziwei_reading_chat_user_reading_unique" UNIQUE("user_id", "reading_id")
);

CREATE INDEX IF NOT EXISTS "ziwei_reading_chat_user_id_idx" ON "ziwei_reading_chat" ("user_id");

CREATE TABLE IF NOT EXISTS "ziwei_product_recommendations" (
  "id" serial PRIMARY KEY NOT NULL,
  "sku" varchar(100) NOT NULL,
  "sort_order" integer NOT NULL DEFAULT 0,
  "active" boolean NOT NULL DEFAULT true,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

INSERT INTO "products" ("sku", "name", "description", "price_cents", "price_cents_usd", "category", "requires_shipping", "active", "sort_order")
VALUES
  ('ziwei-chat-pack-10', '紫微问答加量包', '额外 10 次 Orasage 对话机会（账户内跨排盘累积）', 990, 138, 'service', false, true, 20),
  ('ziwei-chat-yearly', '紫微问答年卡', '365 天无限 Orasage 对话', 9900, 1375, 'service', false, true, 21)
ON CONFLICT ("sku") DO UPDATE SET
  "name" = EXCLUDED."name",
  "description" = EXCLUDED."description",
  "price_cents" = EXCLUDED."price_cents",
  "price_cents_usd" = EXCLUDED."price_cents_usd",
  "category" = EXCLUDED."category",
  "requires_shipping" = EXCLUDED."requires_shipping",
  "active" = EXCLUDED."active";
