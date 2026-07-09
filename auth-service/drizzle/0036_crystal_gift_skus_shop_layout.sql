-- 水晶礼盒装 SKU（方案 A）+ 商城首页布局开关

CREATE TABLE IF NOT EXISTS "shop_settings" (
  "key" varchar(64) PRIMARY KEY NOT NULL,
  "value" jsonb NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

INSERT INTO "shop_settings" ("key", "value")
VALUES ('home_layout', '"legacy"')
ON CONFLICT ("key") DO NOTHING;

-- 礼盒装：与标准装同材质规格，独立 SKU + 包装说明
INSERT INTO "products" (
  "sku", "name", "element", "material", "weight_grams", "bead_diameter_mm",
  "wrist_cm_min", "wrist_cm_max", "length_mm", "packaging",
  "description", "price_cents", "price_cents_usd", "category", "kind",
  "visibility", "requires_shipping", "active", "sort_order"
) VALUES
(
  'crystal-wood-gift', '生长之境 · 绿幽灵能量手串 · 礼盒装', '木', '天然绿幽灵',
  28, 10, 15, 19, 180, '精美礼盒 · 祝福卡 · 绒布袋',
  '五行属木 · 招财旺运 · 生机生长 · 赠礼专属包装', 16800, 2333,
  'crystal', 'standard', 'public', true, true, 11
),
(
  'crystal-fire-gift', '焰心觉醒 · 红玛瑙能量手串 · 礼盒装', '火', '天然红玛瑙',
  26, 10, 15, 19, 180, '精美礼盒 · 祝福卡 · 绒布袋',
  '五行属火 · 提振活力 · 勇敢行动 · 赠礼专属包装', 13800, 1917,
  'crystal', 'standard', 'public', true, true, 12
),
(
  'crystal-earth-gift', '厚土之根 · 黄水晶能量手串 · 礼盒装', '土', '天然黄水晶',
  27, 10, 15, 19, 180, '精美礼盒 · 祝福卡 · 绒布袋',
  '五行属土 · 稳固根基 · 聚财守正 · 赠礼专属包装', 14800, 2056,
  'crystal', 'standard', 'public', true, true, 13
),
(
  'crystal-metal-gift', '澄明之境 · 白水晶能量手串 · 礼盒装', '金', '天然白水晶',
  25, 10, 15, 19, 180, '精美礼盒 · 祝福卡 · 绒布袋',
  '五行属金 · 净化能量 · 思绪澄明 · 赠礼专属包装', 12800, 1778,
  'crystal', 'standard', 'public', true, true, 14
),
(
  'crystal-water-gift', '深海静盾 · 黑曜石能量手串 · 礼盒装', '水', '天然黑曜石',
  30, 10, 15, 19, 180, '精美礼盒 · 祝福卡 · 绒布袋',
  '五行属水 · 辟邪护身 · 建立边界 · 赠礼专属包装', 15800, 2194,
  'crystal', 'standard', 'public', true, true, 15
)
ON CONFLICT ("sku") DO NOTHING;
