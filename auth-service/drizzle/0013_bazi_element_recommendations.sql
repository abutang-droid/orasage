-- 八字报告商品推荐：五行 → 商城 SKU（基础版报告内展示）
CREATE TABLE IF NOT EXISTS "bazi_element_recommendations" (
  "element" varchar(10) PRIMARY KEY,
  "sku" varchar(100) NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

INSERT INTO "bazi_element_recommendations" ("element", "sku") VALUES
  ('木', 'crystal-wood'),
  ('火', 'crystal-fire'),
  ('土', 'crystal-earth'),
  ('金', 'crystal-metal'),
  ('水', 'crystal-water')
ON CONFLICT ("element") DO NOTHING;
