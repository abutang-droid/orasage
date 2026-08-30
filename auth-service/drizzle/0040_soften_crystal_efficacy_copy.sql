-- Soften crystal product efficacy claims (R3 / Entertainment-Only gate).
-- Prefer cultural symbols & psychological anchors over 招财 / 辟邪 / 聚财 wording.

UPDATE products
SET description = '五行属木 · 生机生长 · 事业拓展',
    updated_at = NOW()
WHERE sku = 'crystal-wood'
  AND description LIKE '%招财%';

UPDATE products
SET description = '五行属土 · 稳固根基 · 守成安定',
    updated_at = NOW()
WHERE sku = 'crystal-earth'
  AND (description LIKE '%聚财%' OR description LIKE '%守正%');

UPDATE products
SET description = '五行属水 · 边界沉静 · 心理锚点',
    updated_at = NOW()
WHERE sku = 'crystal-water'
  AND (description LIKE '%辟邪%' OR description LIKE '%负能量%');

UPDATE products
SET description = '五行属木 · 生机生长 · 事业拓展 · 赠礼专属包装',
    updated_at = NOW()
WHERE sku = 'crystal-wood-gift'
  AND description LIKE '%招财%';

UPDATE products
SET description = '五行属土 · 稳固根基 · 守成安定 · 赠礼专属包装',
    updated_at = NOW()
WHERE sku = 'crystal-earth-gift'
  AND description LIKE '%聚财%';

UPDATE products
SET description = '五行属水 · 边界沉静 · 心理锚点 · 赠礼专属包装',
    updated_at = NOW()
WHERE sku = 'crystal-water-gift'
  AND description LIKE '%辟邪%';
