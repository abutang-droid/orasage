#!/usr/bin/env bash
# Apply compliant Wear & Care copy to all crystal PDP guide sections (P0-1).
# Run on VPS: bash scripts/cms/p0-rewrite-pdp-guides.sh
set -euo pipefail
DB="${CMS_DATABASE:-orasage_cms}"

sudo -u postgres psql -d "$DB" <<'SQL'
BEGIN;

-- Shared compliant templates (no 左进右出 / 消磁 / chakra / wealth / purify claims)

UPDATE shop_product_pages_sections s
SET body = $zh$一、佩戴建议
可按个人习惯戴在左手或右手。运动、劳动或接触化学清洁剂时请取下。

二、首次佩戴前
建议用软布轻轻擦拭珠面。如随货附有碎石袋，可将手串置于其上静置数小时，作为开箱仪式。

三、日常保养
1. 沐浴、洗发、卸妆、洗碗时取下，避免化学酸碱。
2. 避免高温、温泉、桑拿与长时间暴晒。
3. 避免与硬物强力碰撞；运动健身时请取下。$zh$
FROM shop_product_pages p
WHERE s._parent_id = p.id
  AND s.type = 'guide'
  AND p.locale = 'zh-CN'
  AND p.sku LIKE 'crystal-%';

UPDATE shop_product_pages_sections s
SET body = $en$I. Wearing
Wear on either hand as you prefer. Remove during sports, heavy work, or when using chemical cleaners.

II. Before first wear
Gently wipe the beads with a soft cloth. If crystal chips are included, you may rest the bracelet on them for a few hours as an unboxing ritual.

III. Care
1. Remove when bathing, washing hair, removing makeup, or washing dishes.
2. Avoid high heat, hot springs, saunas, and prolonged direct sun.
3. Avoid hard impacts; remove during workouts.$en$
FROM shop_product_pages p
WHERE s._parent_id = p.id
  AND s.type = 'guide'
  AND p.locale = 'en'
  AND p.sku LIKE 'crystal-%';

UPDATE shop_product_pages_sections s
SET body = $pt$I. Uso
Use em qualquer mão, conforme preferir. Retire durante esportes, trabalho pesado ou ao usar produtos de limpeza químicos.

II. Antes do primeiro uso
Limpe as contas suavemente com um pano macio. Se vierem lascas de cristal, pode descansar a pulseira sobre elas por algumas horas como ritual de abertura.

III. Cuidados
1. Retire ao tomar banho, lavar o cabelo, remover maquiagem ou lavar louça.
2. Evite calor alto, fontes termais, saunas e sol direto prolongado.
3. Evite impactos fortes; retire durante exercícios.$pt$
FROM shop_product_pages p
WHERE s._parent_id = p.id
  AND s.type = 'guide'
  AND p.locale = 'pt-BR'
  AND p.sku LIKE 'crystal-%';

-- P0 A1: specList + FAQ compliance (pairs with CMS migration 20260831_140000)
UPDATE shop_product_pages_sections_spec_items si
SET value = REPLACE(REPLACE(REPLACE(COALESCE(si.value, ''),
  '能量预处理', '开箱检查'),
  '净化仪式（月光照射 + 鼠尾草烟熏）', '软布擦拭与静置'),
  '能量使用指南卡片', '佩戴指南卡片')
FROM shop_product_pages_sections s
JOIN shop_product_pages p ON s._parent_id = p.id
WHERE si._parent_id = s.id
  AND p.locale = 'zh-CN'
  AND p.sku LIKE 'crystal-%';

UPDATE shop_product_pages_sections_faq_items fi
SET
  question = REPLACE(COALESCE(fi.question, ''), '消磁', '保养'),
  answer = REPLACE(REPLACE(REPLACE(COALESCE(fi.answer, ''),
    '消磁', '保养'),
    '能量沉闷', '佩戴感变化'),
    '月光下静置一晚', '软布擦拭后静置')
FROM shop_product_pages_sections s
JOIN shop_product_pages p ON s._parent_id = p.id
WHERE fi._parent_id = s.id
  AND p.locale = 'zh-CN'
  AND p.sku LIKE 'crystal-%';

UPDATE shop_product_pages_sections s
SET body = REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(COALESCE(s.body, ''),
  '能量搭配推荐', '搭配建议'),
  '能量之石', '文化象征'),
  '脉轮', '传统象征'),
  '招财', '文化意象'),
  '负能量', '外界干扰')
FROM shop_product_pages p
WHERE s._parent_id = p.id
  AND s.type = 'richText'
  AND p.locale = 'zh-CN'
  AND p.sku LIKE 'crystal-%';

COMMIT;

SELECT p.sku, p.locale, left(s.body, 60)
FROM shop_product_pages p
JOIN shop_product_pages_sections s ON s._parent_id = p.id
WHERE s.type = 'guide' AND p.sku LIKE 'crystal-%'
ORDER BY p.sku, p.locale;
SQL
