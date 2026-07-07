-- SATYA-style emotional naming for remaining crystal SKUs
UPDATE "products"
SET
  "name" = '生长之境 · 绿幽灵能量手串',
  "description" = '五行属木 · 招财旺运 · 生机生长',
  "updated_at" = now()
WHERE "sku" = 'crystal-wood';

UPDATE "products"
SET
  "name" = '焰心觉醒 · 红玛瑙能量手串',
  "description" = '五行属火 · 提振活力 · 勇敢行动',
  "updated_at" = now()
WHERE "sku" = 'crystal-fire';

UPDATE "products"
SET
  "name" = '厚土之根 · 黄水晶能量手串',
  "description" = '五行属土 · 稳固根基 · 聚财守正',
  "updated_at" = now()
WHERE "sku" = 'crystal-earth';

UPDATE "products"
SET
  "name" = '深海静盾 · 黑曜石能量手串',
  "description" = '五行属水 · 辟邪护身 · 建立边界',
  "updated_at" = now()
WHERE "sku" = 'crystal-water';
