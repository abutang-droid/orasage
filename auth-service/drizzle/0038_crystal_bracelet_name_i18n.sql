-- Sync crystal bracelet name/description i18n from wold/oricosmos (en / pt-BR / zh-CN).
-- Does not change CNY list prices or World App pricing.

UPDATE products SET
  name_i18n = jsonb_build_object(
    'zh-CN', '生长之境 · 绿幽灵能量手串',
    'zh-TW', '生長之境 · 綠幽靈能量手串',
    'en', 'Realm of Growth · Green Phantom Quartz Energy Bracelet',
    'pt-BR', 'Reino do Crescimento · Pulseira Energética de Quartzo Fantasma Verde'
  ),
  description_i18n = jsonb_build_object(
    'zh-CN', '五行属木 · 招财旺运 · 生机生长',
    'zh-TW', '五行屬木 · 招財旺運 · 生機生長',
    'en', 'Wood Element · Attracts Wealth & Good Fortune · Vitality & Growth',
    'pt-BR', 'Elemento Madeira · Atrai Riqueza e Boa Sorte · Vitalidade e Crescimento'
  ),
  updated_at = now()
WHERE sku = 'crystal-wood';

UPDATE products SET
  name_i18n = jsonb_build_object(
    'zh-CN', '焰心觉醒 · 红玛瑙能量手串',
    'zh-TW', '焰心覺醒 · 紅瑪瑙能量手串',
    'en', 'Awakening of the Inner Flame · Red Agate Energy Bracelet',
    'pt-BR', 'Despertar da Chama Interior · Pulseira Energética de Ágata Vermelha'
  ),
  description_i18n = jsonb_build_object(
    'zh-CN', '五行属火 · 提振活力 · 勇敢行动',
    'zh-TW', '五行屬火 · 提振活力 · 勇敢行動',
    'en', 'Fire Element · Boosts Vitality · Inspires Courageous Action',
    'pt-BR', 'Elemento Fogo · Aumenta a vitalidade · Inspira ações corajosas'
  ),
  updated_at = now()
WHERE sku = 'crystal-fire';

UPDATE products SET
  name_i18n = jsonb_build_object(
    'zh-CN', '厚土之根 · 黄水晶能量手串',
    'zh-TW', '厚土之根 · 黃水晶能量手串',
    'en', 'Roots of the Fertile Earth · Citrine Energy Bracelet',
    'pt-BR', 'Raízes da Terra Fértil · Pulseira de Energia de Citrino'
  ),
  description_i18n = jsonb_build_object(
    'zh-CN', '五行属土 · 稳固根基 · 聚财守正',
    'zh-TW', '五行屬土 · 穩固根基 · 聚財守正',
    'en', 'Earth Element · Solidifying Foundations · Gathering Wealth and Upholding Integrity',
    'pt-BR', 'Elemento Terra · Consolidando Bases · Acumulando Riqueza e Mantendo a Integridade'
  ),
  updated_at = now()
WHERE sku = 'crystal-earth';

UPDATE products SET
  name_i18n = jsonb_build_object(
    'zh-CN', '澄明之境 · 白水晶能量手串',
    'zh-TW', '澄明之境 · 白水晶能量手串',
    'en', 'Realm of Clarity – Clear Quartz Energy Bracelet',
    'pt-BR', 'Reino da Clareza – Pulseira Energética de Quartzo Transparente'
  ),
  description_i18n = jsonb_build_object(
    'zh-CN', '五行属金 · 净化能量 · 思绪澄明',
    'zh-TW', '五行屬金 · 淨化能量 · 思緒澄明',
    'en', 'Metal Element · Purifies Energy · Clarifies the Mind',
    'pt-BR', 'Elemento Metal · Purifica a Energia · Clareia a Mente'
  ),
  updated_at = now()
WHERE sku = 'crystal-metal';

UPDATE products SET
  name_i18n = jsonb_build_object(
    'zh-CN', '深海静盾 · 黑曜石能量手串',
    'zh-TW', '深海靜盾 · 黑曜石能量手串',
    'en', 'Deep-Sea Silent Shield · Obsidian Energy Bracelet',
    'pt-BR', 'Escudo Silencioso das Profundezas · Pulseira de Energia de Obsidiana'
  ),
  description_i18n = jsonb_build_object(
    'zh-CN', '五行属水 · 辟邪护身 · 建立边界',
    'zh-TW', '五行屬水 · 辟邪護身 · 建立邊界',
    'en', 'Water Element · Wards Off Evil & Protects · Establishes Boundaries',
    'pt-BR', 'Elemento Água · Afasta o mal e protege · Estabelece limites'
  ),
  updated_at = now()
WHERE sku = 'crystal-water';
