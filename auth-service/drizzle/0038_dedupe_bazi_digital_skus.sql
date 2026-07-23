-- 八字数字商品去重：保留 report-bazi-basic，移除遗留 report-bazi 与合盘 basic SKU。
-- 合盘 basic 计费与组合子项统一改用 report-bazi-basic（与单盘 basic 同款数字报告）。

-- 1) 计费槽位
UPDATE app_billing_slots
SET sku = 'report-bazi-basic', updated_at = NOW()
WHERE app_source = 'bazi'
  AND slot_key = 'report.couple.basic'
  AND sku = 'report-bazi-couple-basic';

-- 2) 组合子项：合盘 advanced/premium 的数字子商品改指向 basic
UPDATE product_combo_items
SET component_sku = 'report-bazi-basic'
WHERE component_sku = 'report-bazi-couple-basic';

-- 3) 首页精选 / 关联 / 评价（若有）
DELETE FROM homepage_featured_products
WHERE sku IN ('report-bazi', 'report-bazi-couple-basic');

DELETE FROM product_links
WHERE sku IN ('report-bazi', 'report-bazi-couple-basic');

DELETE FROM product_reviews
WHERE sku IN ('report-bazi', 'report-bazi-couple-basic');

-- 4) 标签关联
DELETE FROM product_tag_links
WHERE product_id IN (
  SELECT id FROM products WHERE sku IN ('report-bazi', 'report-bazi-couple-basic')
);

-- 5) 删除多余数字 SKU（无历史订单引用时可硬删）
DELETE FROM products
WHERE sku IN ('report-bazi', 'report-bazi-couple-basic');
