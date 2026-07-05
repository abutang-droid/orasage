-- 八字合盘分级报告 SKU（单人 report-bazi-* 已有，此处补合盘三档）
INSERT INTO "products" ("sku", "name", "element", "description", "price_cents", "price_cents_usd", "category", "sort_order")
VALUES
  ('report-bazi-couple-basic', '八字合盘深度解读', NULL, '双人合盘 AI 解读报告', 990, 138, 'report', 20),
  ('report-bazi-couple-advanced', '八字合盘报告 + 能量手串', NULL, '合盘解读 + 双人五行水晶推荐', 19800, 2750, 'report', 21),
  ('report-bazi-couple-premium', '八字合盘终极能量礼盒', NULL, '完整合盘报告 + 水晶礼盒', 59800, 8306, 'report', 22)
ON CONFLICT ("sku") DO NOTHING;
