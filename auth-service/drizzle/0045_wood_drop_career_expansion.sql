-- P0-1: remove career-outcome suffix from wood crystal copy (zh + en i18n).

UPDATE products
SET
  description = '五行属木 · 生长与丰盛 · 生机拓展',
  description_i18n = jsonb_build_object(
    'zh-CN', '五行属木 · 生长与丰盛 · 生机拓展',
    'en', 'Wood Element · Symbol of Growth & Prosperity · Growth Intention',
    'pt-BR', 'Elemento Madeira · Símbolo de Crescimento e Prosperidade · Intenção de Crescimento'
  ),
  updated_at = NOW()
WHERE sku = 'crystal-wood';

UPDATE products
SET
  description = '五行属木 · 生长与丰盛 · 生机拓展 · 赠礼专属包装',
  description_i18n = jsonb_build_object(
    'zh-CN', '五行属木 · 生长与丰盛 · 生机拓展 · 赠礼专属包装',
    'en', 'Wood Element · Symbol of Growth & Prosperity · Growth Intention · Exclusive Gift Packaging',
    'pt-BR', 'Elemento Madeira · Símbolo de Crescimento e Prosperidade · Intenção de Crescimento · Embalagem de Presente Exclusiva'
  ),
  updated_at = NOW()
WHERE sku = 'crystal-wood-gift';
