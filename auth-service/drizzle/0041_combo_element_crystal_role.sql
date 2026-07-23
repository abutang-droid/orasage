-- 组合子项角色：fixed（固定）| element_crystal（按八字五行推荐的可变水晶）
-- component_sku 在 element_crystal 时作为参考价 / 缺省回退 SKU。

ALTER TABLE product_combo_items
  ADD COLUMN IF NOT EXISTS role varchar(30) NOT NULL DEFAULT 'fixed';

-- 八字「报告+手串」组合：水晶改为五行变量（保留原 crystal-* 作回退）
UPDATE product_combo_items
SET role = 'element_crystal'
WHERE combo_sku LIKE 'report-bazi%'
  AND component_sku LIKE 'crystal-%'
  AND role = 'fixed';
