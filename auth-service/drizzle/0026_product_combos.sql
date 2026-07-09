-- 组合商品：数字 + 实体等子 SKU 组合，支持组件价合计或组合优惠价

ALTER TABLE products ADD COLUMN IF NOT EXISTS combo_use_component_sum boolean NOT NULL DEFAULT true;

CREATE TABLE IF NOT EXISTS product_combo_items (
  id serial PRIMARY KEY,
  combo_sku varchar(100) NOT NULL,
  component_sku varchar(100) NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  sort_order integer NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS product_combo_items_combo_sku_idx ON product_combo_items (combo_sku);

GRANT ALL ON TABLE product_combo_items TO orasage;
GRANT ALL ON SEQUENCE product_combo_items_id_seq TO orasage;

-- 历史「报告+法器」类 SKU 标记为 combo，并回填子项（运营可在后台调整）
UPDATE products SET kind = 'combo', combo_use_component_sum = false
WHERE sku IN (
  'report-bazi-advanced',
  'report-bazi-premium',
  'report-bazi-couple-advanced',
  'report-bazi-couple-premium',
  'report-ziwei-advanced',
  'report-ziwei-premium',
  'report-tarot-bundle'
);

INSERT INTO product_combo_items (combo_sku, component_sku, quantity, sort_order)
SELECT v.combo_sku, v.component_sku, v.quantity, v.sort_order
FROM (VALUES
  ('report-bazi-advanced', 'report-bazi-basic', 1, 0),
  ('report-bazi-advanced', 'crystal-wood', 1, 1),
  ('report-bazi-premium', 'report-bazi-basic', 1, 0),
  ('report-bazi-premium', 'crystal-wood', 1, 1),
  ('report-bazi-couple-advanced', 'report-bazi-couple-basic', 1, 0),
  ('report-bazi-couple-advanced', 'crystal-wood', 1, 1),
  ('report-bazi-couple-premium', 'report-bazi-couple-basic', 1, 0),
  ('report-bazi-couple-premium', 'crystal-wood', 1, 1),
  ('report-ziwei-advanced', 'report-ziwei-basic', 1, 0),
  ('report-ziwei-advanced', 'crystal-wood', 1, 1),
  ('report-ziwei-premium', 'report-ziwei-basic', 1, 0),
  ('report-ziwei-premium', 'crystal-wood', 1, 1),
  ('report-tarot-bundle', 'report-tarot', 1, 0),
  ('report-tarot-bundle', 'crystal-metal', 1, 1)
) AS v(combo_sku, component_sku, quantity, sort_order)
WHERE NOT EXISTS (
  SELECT 1 FROM product_combo_items i WHERE i.combo_sku = v.combo_sku
);

-- 组合含实体子项时自动需要发货
UPDATE products p SET requires_shipping = true
WHERE p.kind = 'combo'
  AND EXISTS (
    SELECT 1 FROM product_combo_items i
    JOIN products c ON c.sku = i.component_sku
    WHERE i.combo_sku = p.sku
      AND (
        c.requires_shipping = true
        OR c.kind = 'standard'
        OR c.category = 'crystal'
      )
  );
