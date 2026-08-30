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

-- Locale overrides (description_i18n) must be softened too — shop resolves these first.
UPDATE products SET description_i18n = jsonb_build_object(
  'zh-CN', '五行属木 · 生机生长 · 事业拓展',
  'en', 'Wood Element · Growth Intention · Career Expansion',
  'pt-BR', 'Elemento Madeira · Intenção de Crescimento · Expansão de Carreira'
), updated_at = NOW()
WHERE sku = 'crystal-wood';

UPDATE products SET description_i18n = jsonb_build_object(
  'zh-CN', '五行属木 · 生机生长 · 事业拓展 · 赠礼专属包装',
  'en', 'Wood Element · Growth Intention · Career Expansion · Exclusive Gift Packaging',
  'pt-BR', 'Elemento Madeira · Intenção de Crescimento · Expansão de Carreira · Embalagem de Presente Exclusiva'
), updated_at = NOW()
WHERE sku = 'crystal-wood-gift';

UPDATE products SET description_i18n = jsonb_build_object(
  'zh-CN', '五行属土 · 稳固根基 · 守成安定',
  'en', 'Earth Element · Solidifying Foundations · Steady Grounding',
  'pt-BR', 'Elemento Terra · Consolidando Bases · Estabilidade'
), updated_at = NOW()
WHERE sku = 'crystal-earth';

UPDATE products SET description_i18n = jsonb_build_object(
  'zh-CN', '五行属土 · 稳固根基 · 守成安定 · 赠礼专属包装',
  'en', 'Earth Element · Solid Foundation · Steady Grounding · Exclusive Gift Packaging',
  'pt-BR', 'Elemento Terra · Base Sólida · Estabilidade · Embalagem de Presente Exclusiva'
), updated_at = NOW()
WHERE sku = 'crystal-earth-gift';

UPDATE products SET description_i18n = jsonb_build_object(
  'zh-CN', '五行属水 · 边界沉静 · 心理锚点',
  'en', 'Water Element · Calm Boundaries · Psychological Anchor',
  'pt-BR', 'Elemento Água · Limites Serenos · Âncora Psicológica'
), updated_at = NOW()
WHERE sku = 'crystal-water';

UPDATE products SET description_i18n = jsonb_build_object(
  'zh-CN', '五行属水 · 边界沉静 · 心理锚点 · 赠礼专属包装',
  'en', 'Water Element · Calm Boundaries · Psychological Anchor · Exclusive Gift Packaging',
  'pt-BR', 'Elemento Água · Limites Serenos · Âncora Psicológica · Embalagem de Presente Exclusiva'
), updated_at = NOW()
WHERE sku = 'crystal-water-gift';
