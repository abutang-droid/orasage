-- R3: Sync crystal product copy to authoritative zh→en efficacy mapping (§1.3).
-- Applies to all five element SKUs + gift variants (description + description_i18n).

-- crystal-wood
UPDATE products SET
  description = '五行属木 · 生长与丰盛 · 生机拓展',
  description_i18n = jsonb_build_object(
    'zh-CN', '五行属木 · 生长与丰盛 · 生机拓展',
    'en', 'Wood Element · Symbol of Growth & Prosperity · Career Expansion',
    'pt-BR', 'Elemento Madeira · Símbolo de Crescimento e Prosperidade · Expansão de Carreira'
  ),
  updated_at = NOW()
WHERE sku = 'crystal-wood';

UPDATE products SET
  description = '五行属木 · 生长与丰盛 · 生机拓展 · 赠礼专属包装',
  description_i18n = jsonb_build_object(
    'zh-CN', '五行属木 · 生长与丰盛 · 生机拓展 · 赠礼专属包装',
    'en', 'Wood Element · Symbol of Growth & Prosperity · Career Expansion · Exclusive Gift Packaging',
    'pt-BR', 'Elemento Madeira · Símbolo de Crescimento e Prosperidade · Expansão de Carreira · Embalagem de Presente Exclusiva'
  ),
  updated_at = NOW()
WHERE sku = 'crystal-wood-gift';

-- crystal-fire
UPDATE products SET
  description = '五行属火 · 活力与行动 · 勇敢前行',
  description_i18n = jsonb_build_object(
    'zh-CN', '五行属火 · 活力与行动 · 勇敢前行',
    'en', 'Fire Element · Vitality & Action · Courageous Movement',
    'pt-BR', 'Elemento Fogo · Vitalidade e Ação · Movimento Corajoso'
  ),
  updated_at = NOW()
WHERE sku = 'crystal-fire';

UPDATE products SET
  description = '五行属火 · 活力与行动 · 勇敢前行 · 赠礼专属包装',
  description_i18n = jsonb_build_object(
    'zh-CN', '五行属火 · 活力与行动 · 勇敢前行 · 赠礼专属包装',
    'en', 'Fire Element · Vitality & Action · Courageous Movement · Exclusive Gift Packaging',
    'pt-BR', 'Elemento Fogo · Vitalidade e Ação · Movimento Corajoso · Embalagem de Presente Exclusiva'
  ),
  updated_at = NOW()
WHERE sku = 'crystal-fire-gift';

-- crystal-earth
UPDATE products SET
  description = '五行属土 · 稳固与持守 · 守成安定',
  description_i18n = jsonb_build_object(
    'zh-CN', '五行属土 · 稳固与持守 · 守成安定',
    'en', 'Earth Element · Grounding & Steadfastness · Steady Grounding',
    'pt-BR', 'Elemento Terra · Enraizamento e Firmeza · Estabilidade'
  ),
  updated_at = NOW()
WHERE sku = 'crystal-earth';

UPDATE products SET
  description = '五行属土 · 稳固与持守 · 守成安定 · 赠礼专属包装',
  description_i18n = jsonb_build_object(
    'zh-CN', '五行属土 · 稳固与持守 · 守成安定 · 赠礼专属包装',
    'en', 'Earth Element · Grounding & Steadfastness · Steady Grounding · Exclusive Gift Packaging',
    'pt-BR', 'Elemento Terra · Enraizamento e Firmeza · Estabilidade · Embalagem de Presente Exclusiva'
  ),
  updated_at = NOW()
WHERE sku = 'crystal-earth-gift';

-- crystal-metal
UPDATE products SET
  description = '五行属金 · 澄澈与静定 · 思绪澄明',
  description_i18n = jsonb_build_object(
    'zh-CN', '五行属金 · 澄澈与静定 · 思绪澄明',
    'en', 'Metal Element · Clarity & Stillness · Clear Mind',
    'pt-BR', 'Elemento Metal · Clareza e Quietude · Mente Clara'
  ),
  updated_at = NOW()
WHERE sku = 'crystal-metal';

UPDATE products SET
  description = '五行属金 · 澄澈与静定 · 思绪澄明 · 赠礼专属包装',
  description_i18n = jsonb_build_object(
    'zh-CN', '五行属金 · 澄澈与静定 · 思绪澄明 · 赠礼专属包装',
    'en', 'Metal Element · Clarity & Stillness · Clear Mind · Exclusive Gift Packaging',
    'pt-BR', 'Elemento Metal · Clareza e Quietude · Mente Clara · Embalagem de Presente Exclusiva'
  ),
  updated_at = NOW()
WHERE sku = 'crystal-metal-gift';

-- crystal-water
UPDATE products SET
  description = '五行属水 · 守护与边界 · 心理锚点',
  description_i18n = jsonb_build_object(
    'zh-CN', '五行属水 · 守护与边界 · 心理锚点',
    'en', 'Water Element · Protection & Boundaries · Psychological Anchor',
    'pt-BR', 'Elemento Água · Proteção e Limites · Âncora Psicológica'
  ),
  updated_at = NOW()
WHERE sku = 'crystal-water';

UPDATE products SET
  description = '五行属水 · 守护与边界 · 心理锚点 · 赠礼专属包装',
  description_i18n = jsonb_build_object(
    'zh-CN', '五行属水 · 守护与边界 · 心理锚点 · 赠礼专属包装',
    'en', 'Water Element · Protection & Boundaries · Psychological Anchor · Exclusive Gift Packaging',
    'pt-BR', 'Elemento Água · Proteção e Limites · Âncora Psicológica · Embalagem de Presente Exclusiva'
  ),
  updated_at = NOW()
WHERE sku = 'crystal-water-gift';
