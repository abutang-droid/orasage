-- R3 naming layer: drop 能量/Energy and outcome claims from crystal titles + taglines.
-- Source of truth for fallback copy: shared/shop-crystal/naming.ts

-- crystal-wood
UPDATE products SET
  name = '生长之境 · 绿幽灵手串',
  name_i18n = jsonb_build_object(
    'zh-CN', '生长之境 · 绿幽灵手串',
    'en', 'Realm of Growth · Green Phantom Quartz Bracelet',
    'pt-BR', 'Reino do Crescimento · Pulseira de Quartzo Fantasma Verde'
  ),
  description = '五行属木 · 生发之象 · 生长提醒',
  description_i18n = jsonb_build_object(
    'zh-CN', '五行属木 · 生发之象 · 生长提醒',
    'en', 'Wood Element · Symbol of Becoming · Growth Reminder',
    'pt-BR', 'Elemento Madeira · Símbolo do Devir · Lembrete de Crescimento'
  ),
  seo_title_i18n = jsonb_build_object(
    'zh-CN', '生长之境 · 绿幽灵手串 · OraSage Crystal Shop',
    'en', 'Realm of Growth · Green Phantom Quartz Bracelet · OraSage Crystal Shop',
    'pt-BR', 'Reino do Crescimento · Pulseira de Quartzo Fantasma Verde · OraSage Crystal Shop'
  ),
  seo_desc_i18n = jsonb_build_object(
    'zh-CN', '生长之境 · 绿幽灵手串：8mm 绿幽灵圆珠，蜡线手工打结，15-18cm 可调手围。OraSage 设计师手作，五行属木，作为''生长''的日常提醒。文化意象，非疗效承诺。',
    'en', 'Realm of Growth · Green Phantom Quartz Bracelet: 8mm beads, hand-knotted waxed cord, 15–18cm adjustable. A daily growth reminder. Cultural symbol, not a health claim.',
    'pt-BR', 'Reino do Crescimento · Pulseira de Quartzo Fantasma Verde: contas de 8mm, cordão encerado, 15–18cm ajustável. Lembrete cotidiano de crescimento. Símbolo cultural, não uma promessa terapêutica.'
  ),
  updated_at = NOW()
WHERE sku = 'crystal-wood';

UPDATE products SET
  name = '生长之境 · 绿幽灵手串 · 礼盒装',
  name_i18n = jsonb_build_object(
    'zh-CN', '生长之境 · 绿幽灵手串 · 礼盒装',
    'en', 'Realm of Growth · Green Phantom Quartz Bracelet · Gift Box',
    'pt-BR', 'Reino do Crescimento · Pulseira de Quartzo Fantasma Verde · Caixa de Presente'
  ),
  description = '五行属木 · 生发之象 · 生长提醒 · 赠礼专属包装',
  description_i18n = jsonb_build_object(
    'zh-CN', '五行属木 · 生发之象 · 生长提醒 · 赠礼专属包装',
    'en', 'Wood Element · Symbol of Becoming · Growth Reminder · Exclusive Gift Packaging',
    'pt-BR', 'Elemento Madeira · Símbolo do Devir · Lembrete de Crescimento · Embalagem de Presente Exclusiva'
  ),
  updated_at = NOW()
WHERE sku = 'crystal-wood-gift';

-- crystal-fire
UPDATE products SET
  name = '焰心觉醒 · 红玛瑙手串',
  name_i18n = jsonb_build_object(
    'zh-CN', '焰心觉醒 · 红玛瑙手串',
    'en', 'Awakening of the Inner Flame · Red Agate Bracelet',
    'pt-BR', 'Despertar da Chama Interior · Pulseira de Ágata Vermelha'
  ),
  description = '五行属火 · 温煦之象 · 行动提醒',
  description_i18n = jsonb_build_object(
    'zh-CN', '五行属火 · 温煦之象 · 行动提醒',
    'en', 'Fire Element · Symbol of Warmth · Action Reminder',
    'pt-BR', 'Elemento Fogo · Símbolo do Calor · Lembrete de Ação'
  ),
  seo_title_i18n = jsonb_build_object(
    'zh-CN', '焰心觉醒 · 红玛瑙手串 · OraSage Crystal Shop',
    'en', 'Awakening of the Inner Flame · Red Agate Bracelet · OraSage Crystal Shop',
    'pt-BR', 'Despertar da Chama Interior · Pulseira de Ágata Vermelha · OraSage Crystal Shop'
  ),
  seo_desc_i18n = jsonb_build_object(
    'zh-CN', '焰心觉醒 · 红玛瑙手串：8mm 红玛瑙圆珠，蜡线手工打结，15-18cm 可调手围。OraSage 设计师手作，五行属火，作为''行动''的日常提醒。文化意象，非疗效承诺。',
    'en', 'Awakening of the Inner Flame · Red Agate Bracelet: 8mm beads, hand-knotted waxed cord, 15–18cm adjustable. A daily action reminder. Cultural symbol, not a health claim.',
    'pt-BR', 'Despertar da Chama Interior · Pulseira de Ágata Vermelha: contas de 8mm, cordão encerado, 15–18cm ajustável. Lembrete cotidiano de ação. Símbolo cultural, não uma promessa terapêutica.'
  ),
  updated_at = NOW()
WHERE sku = 'crystal-fire';

UPDATE products SET
  name = '焰心觉醒 · 红玛瑙手串 · 礼盒装',
  name_i18n = jsonb_build_object(
    'zh-CN', '焰心觉醒 · 红玛瑙手串 · 礼盒装',
    'en', 'Awakening of the Inner Flame · Red Agate Bracelet · Gift Box',
    'pt-BR', 'Despertar da Chama Interior · Pulseira de Ágata Vermelha · Caixa de Presente'
  ),
  description = '五行属火 · 温煦之象 · 行动提醒 · 赠礼专属包装',
  description_i18n = jsonb_build_object(
    'zh-CN', '五行属火 · 温煦之象 · 行动提醒 · 赠礼专属包装',
    'en', 'Fire Element · Symbol of Warmth · Action Reminder · Exclusive Gift Packaging',
    'pt-BR', 'Elemento Fogo · Símbolo do Calor · Lembrete de Ação · Embalagem de Presente Exclusiva'
  ),
  updated_at = NOW()
WHERE sku = 'crystal-fire-gift';

-- crystal-earth
UPDATE products SET
  name = '厚土之根 · 黄水晶手串',
  name_i18n = jsonb_build_object(
    'zh-CN', '厚土之根 · 黄水晶手串',
    'en', 'Roots of the Fertile Earth · Citrine Bracelet',
    'pt-BR', 'Raízes da Terra Fértil · Pulseira de Citrino'
  ),
  description = '五行属土 · 承载之象 · 守成提醒',
  description_i18n = jsonb_build_object(
    'zh-CN', '五行属土 · 承载之象 · 守成提醒',
    'en', 'Earth Element · Symbol of Bearing · Steadfast Reminder',
    'pt-BR', 'Elemento Terra · Símbolo do Sustento · Lembrete de Constância'
  ),
  seo_title_i18n = jsonb_build_object(
    'zh-CN', '厚土之根 · 黄水晶手串 · OraSage Crystal Shop',
    'en', 'Roots of the Fertile Earth · Citrine Bracelet · OraSage Crystal Shop',
    'pt-BR', 'Raízes da Terra Fértil · Pulseira de Citrino · OraSage Crystal Shop'
  ),
  seo_desc_i18n = jsonb_build_object(
    'zh-CN', '厚土之根 · 黄水晶手串：8mm 黄水晶圆珠，蜡线手工打结，15-18cm 可调手围。OraSage 设计师手作，五行属土，作为''守成''的日常提醒。文化意象，非疗效承诺。',
    'en', 'Roots of the Fertile Earth · Citrine Bracelet: 8mm beads, hand-knotted waxed cord, 15–18cm adjustable. A daily steadfast reminder. Cultural symbol, not a health claim.',
    'pt-BR', 'Raízes da Terra Fértil · Pulseira de Citrino: contas de 8mm, cordão encerado, 15–18cm ajustável. Lembrete cotidiano de constância. Símbolo cultural, não uma promessa terapêutica.'
  ),
  updated_at = NOW()
WHERE sku = 'crystal-earth';

UPDATE products SET
  name = '厚土之根 · 黄水晶手串 · 礼盒装',
  name_i18n = jsonb_build_object(
    'zh-CN', '厚土之根 · 黄水晶手串 · 礼盒装',
    'en', 'Roots of the Fertile Earth · Citrine Bracelet · Gift Box',
    'pt-BR', 'Raízes da Terra Fértil · Pulseira de Citrino · Caixa de Presente'
  ),
  description = '五行属土 · 承载之象 · 守成提醒 · 赠礼专属包装',
  description_i18n = jsonb_build_object(
    'zh-CN', '五行属土 · 承载之象 · 守成提醒 · 赠礼专属包装',
    'en', 'Earth Element · Symbol of Bearing · Steadfast Reminder · Exclusive Gift Packaging',
    'pt-BR', 'Elemento Terra · Símbolo do Sustento · Lembrete de Constância · Embalagem de Presente Exclusiva'
  ),
  updated_at = NOW()
WHERE sku = 'crystal-earth-gift';

-- crystal-metal
UPDATE products SET
  name = '澄明之境 · 白水晶手串',
  name_i18n = jsonb_build_object(
    'zh-CN', '澄明之境 · 白水晶手串',
    'en', 'Realm of Clarity – Clear Quartz Bracelet',
    'pt-BR', 'Reino da Clareza · Pulseira de Quartzo Incolor'
  ),
  description = '五行属金 · 收敛之象 · 静定提醒',
  description_i18n = jsonb_build_object(
    'zh-CN', '五行属金 · 收敛之象 · 静定提醒',
    'en', 'Metal Element · Symbol of Refinement · Stillness Reminder',
    'pt-BR', 'Elemento Metal · Símbolo do Refinamento · Lembrete de Quietude'
  ),
  seo_title_i18n = jsonb_build_object(
    'zh-CN', '澄明之境 · 白水晶手串 · OraSage Crystal Shop',
    'en', 'Realm of Clarity – Clear Quartz Bracelet · OraSage Crystal Shop',
    'pt-BR', 'Reino da Clareza · Pulseira de Quartzo Incolor · OraSage Crystal Shop'
  ),
  seo_desc_i18n = jsonb_build_object(
    'zh-CN', '澄明之境 · 白水晶手串：8mm 白水晶圆珠，蜡线手工打结，15-18cm 可调手围。OraSage 设计师手作，五行属金，作为''静定''的日常提醒。文化意象，非疗效承诺。',
    'en', 'Realm of Clarity – Clear Quartz Bracelet: 8mm beads, hand-knotted waxed cord, 15–18cm adjustable. A daily stillness reminder. Cultural symbol, not a health claim.',
    'pt-BR', 'Reino da Clareza · Pulseira de Quartzo Incolor: contas de 8mm, cordão encerado, 15–18cm ajustável. Lembrete cotidiano de quietude. Símbolo cultural, não uma promessa terapêutica.'
  ),
  updated_at = NOW()
WHERE sku = 'crystal-metal';

UPDATE products SET
  name = '澄明之境 · 白水晶手串 · 礼盒装',
  name_i18n = jsonb_build_object(
    'zh-CN', '澄明之境 · 白水晶手串 · 礼盒装',
    'en', 'Realm of Clarity – Clear Quartz Bracelet · Gift Box',
    'pt-BR', 'Reino da Clareza · Pulseira de Quartzo Incolor · Caixa de Presente'
  ),
  description = '五行属金 · 收敛之象 · 静定提醒 · 赠礼专属包装',
  description_i18n = jsonb_build_object(
    'zh-CN', '五行属金 · 收敛之象 · 静定提醒 · 赠礼专属包装',
    'en', 'Metal Element · Symbol of Refinement · Stillness Reminder · Exclusive Gift Packaging',
    'pt-BR', 'Elemento Metal · Símbolo do Refinamento · Lembrete de Quietude · Embalagem de Presente Exclusiva'
  ),
  updated_at = NOW()
WHERE sku = 'crystal-metal-gift';

-- crystal-water
UPDATE products SET
  name = '深海静盾 · 黑曜石手串',
  name_i18n = jsonb_build_object(
    'zh-CN', '深海静盾 · 黑曜石手串',
    'en', 'Deep-Sea Silent Shield · Obsidian Bracelet',
    'pt-BR', 'Escudo Silencioso do Mar Profundo · Pulseira de Obsidiana'
  ),
  description = '五行属水 · 润下之象 · 边界提醒',
  description_i18n = jsonb_build_object(
    'zh-CN', '五行属水 · 润下之象 · 边界提醒',
    'en', 'Water Element · Symbol of Flow · Boundary Reminder',
    'pt-BR', 'Elemento Água · Símbolo do Fluxo · Lembrete de Limite'
  ),
  seo_title_i18n = jsonb_build_object(
    'zh-CN', '深海静盾 · 黑曜石手串 · OraSage Crystal Shop',
    'en', 'Deep-Sea Silent Shield · Obsidian Bracelet · OraSage Crystal Shop',
    'pt-BR', 'Escudo Silencioso do Mar Profundo · Pulseira de Obsidiana · OraSage Crystal Shop'
  ),
  seo_desc_i18n = jsonb_build_object(
    'zh-CN', '深海静盾 · 黑曜石手串：8mm 黑曜石圆珠，蜡线手工打结，15-18cm 可调手围。OraSage 设计师手作，五行属水，作为''边界''的日常提醒。文化意象，非疗效承诺。',
    'en', 'Deep-Sea Silent Shield · Obsidian Bracelet: 8mm beads, hand-knotted waxed cord, 15–18cm adjustable. A daily boundary reminder. Cultural symbol, not a health claim.',
    'pt-BR', 'Escudo Silencioso do Mar Profundo · Pulseira de Obsidiana: contas de 8mm, cordão encerado, 15–18cm ajustável. Lembrete cotidiano de limite. Símbolo cultural, não uma promessa terapêutica.'
  ),
  updated_at = NOW()
WHERE sku = 'crystal-water';

UPDATE products SET
  name = '深海静盾 · 黑曜石手串 · 礼盒装',
  name_i18n = jsonb_build_object(
    'zh-CN', '深海静盾 · 黑曜石手串 · 礼盒装',
    'en', 'Deep-Sea Silent Shield · Obsidian Bracelet · Gift Box',
    'pt-BR', 'Escudo Silencioso do Mar Profundo · Pulseira de Obsidiana · Caixa de Presente'
  ),
  description = '五行属水 · 润下之象 · 边界提醒 · 赠礼专属包装',
  description_i18n = jsonb_build_object(
    'zh-CN', '五行属水 · 润下之象 · 边界提醒 · 赠礼专属包装',
    'en', 'Water Element · Symbol of Flow · Boundary Reminder · Exclusive Gift Packaging',
    'pt-BR', 'Elemento Água · Símbolo do Fluxo · Lembrete de Limite · Embalagem de Presente Exclusiva'
  ),
  updated_at = NOW()
WHERE sku = 'crystal-water-gift';

-- Sweep remaining 能量手串 / Energy Bracelet on any SKU (reports, DIY, gifts).
UPDATE products SET
  name = REPLACE(REPLACE(name, '能量手串', '水晶手串'), 'Energy Bracelet', 'Crystal Bracelet'),
  description = REPLACE(REPLACE(description, '能量手串', '水晶手串'), 'Energy Bracelet', 'Crystal Bracelet'),
  name_i18n = CASE
    WHEN name_i18n IS NULL THEN name_i18n
    ELSE REPLACE(REPLACE(name_i18n::text, '能量手串', '水晶手串'), 'Energy Bracelet', 'Crystal Bracelet')::jsonb
  END,
  description_i18n = CASE
    WHEN description_i18n IS NULL THEN description_i18n
    ELSE REPLACE(REPLACE(description_i18n::text, '能量手串', '水晶手串'), 'Energy Bracelet', 'Crystal Bracelet')::jsonb
  END,
  seo_title_i18n = CASE
    WHEN seo_title_i18n IS NULL THEN seo_title_i18n
    ELSE REPLACE(REPLACE(seo_title_i18n::text, '能量手串', '水晶手串'), 'Energy Bracelet', 'Crystal Bracelet')::jsonb
  END,
  seo_desc_i18n = CASE
    WHEN seo_desc_i18n IS NULL THEN seo_desc_i18n
    ELSE REPLACE(REPLACE(seo_desc_i18n::text, '能量手串', '水晶手串'), 'Energy Bracelet', 'Crystal Bracelet')::jsonb
  END,
  updated_at = NOW()
WHERE name LIKE '%能量手串%'
   OR description LIKE '%能量手串%'
   OR name ILIKE '%Energy Bracelet%'
   OR description ILIKE '%Energy Bracelet%'
   OR COALESCE(name_i18n::text, '') LIKE '%能量手串%'
   OR COALESCE(name_i18n::text, '') ILIKE '%Energy Bracelet%'
   OR COALESCE(description_i18n::text, '') LIKE '%能量手串%'
   OR COALESCE(description_i18n::text, '') ILIKE '%Energy Bracelet%'
   OR COALESCE(seo_title_i18n::text, '') LIKE '%能量手串%'
   OR COALESCE(seo_title_i18n::text, '') ILIKE '%Energy Bracelet%'
   OR COALESCE(seo_desc_i18n::text, '') LIKE '%能量手串%'
   OR COALESCE(seo_desc_i18n::text, '') ILIKE '%Energy Bracelet%';
