-- 八字/紫微分级报告 SKU（design-unify PaywallCard 使用）
INSERT INTO "products" ("sku", "name", "element", "description", "price_cents", "category", "sort_order")
VALUES
  ('report-bazi-basic', '八字深度解读', NULL, '完整命盘 AI 解读报告', 990, 'report', 10),
  ('report-bazi-advanced', '八字报告 + 能量手串', NULL, '深度解读 + 五行水晶推荐', 9900, 'report', 11),
  ('report-bazi-premium', '八字终极能量礼盒', NULL, '完整报告 + 水晶礼盒', 29900, 'report', 12),
  ('report-ziwei-basic', '紫微深度解读', NULL, '命盘 AI 解读报告', 990, 'report', 13),
  ('report-ziwei-advanced', '紫微报告 + 能量手串', NULL, '深度解读 + 五行水晶推荐', 9900, 'report', 14),
  ('report-ziwei-premium', '紫微终极能量礼盒', NULL, '完整报告 + 水晶礼盒', 29900, 'report', 15)
ON CONFLICT ("sku") DO NOTHING;
