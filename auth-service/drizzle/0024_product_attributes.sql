-- 商品结构化属性：材质/颜色/重量/尺寸/包装/附件（公制存储）
ALTER TABLE products ADD COLUMN IF NOT EXISTS material varchar(200);
ALTER TABLE products ADD COLUMN IF NOT EXISTS material_i18n jsonb;
ALTER TABLE products ADD COLUMN IF NOT EXISTS color varchar(100);
ALTER TABLE products ADD COLUMN IF NOT EXISTS color_i18n jsonb;
ALTER TABLE products ADD COLUMN IF NOT EXISTS weight_grams integer;
ALTER TABLE products ADD COLUMN IF NOT EXISTS bead_diameter_mm real;
ALTER TABLE products ADD COLUMN IF NOT EXISTS wrist_cm_min real;
ALTER TABLE products ADD COLUMN IF NOT EXISTS wrist_cm_max real;
ALTER TABLE products ADD COLUMN IF NOT EXISTS length_mm real;
ALTER TABLE products ADD COLUMN IF NOT EXISTS packaging text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS packaging_i18n jsonb;
ALTER TABLE products ADD COLUMN IF NOT EXISTS attachments jsonb;

-- 五行水晶 SKU 默认材质回填
UPDATE products SET material = '天然绿幽灵', weight_grams = 28, bead_diameter_mm = 10, wrist_cm_min = 15, wrist_cm_max = 19, length_mm = 180
  WHERE sku = 'crystal-wood' AND material IS NULL;
UPDATE products SET material = '天然红玛瑙', weight_grams = 26, bead_diameter_mm = 10, wrist_cm_min = 15, wrist_cm_max = 19, length_mm = 180
  WHERE sku = 'crystal-fire' AND material IS NULL;
UPDATE products SET material = '天然黄水晶', weight_grams = 27, bead_diameter_mm = 10, wrist_cm_min = 15, wrist_cm_max = 19, length_mm = 180
  WHERE sku = 'crystal-earth' AND material IS NULL;
UPDATE products SET material = '天然白水晶', weight_grams = 25, bead_diameter_mm = 10, wrist_cm_min = 15, wrist_cm_max = 19, length_mm = 180
  WHERE sku = 'crystal-metal' AND material IS NULL;
UPDATE products SET material = '天然黑曜石', weight_grams = 30, bead_diameter_mm = 10, wrist_cm_min = 15, wrist_cm_max = 19, length_mm = 180
  WHERE sku = 'crystal-water' AND material IS NULL;
