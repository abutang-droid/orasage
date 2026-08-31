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

COMMIT;

SELECT p.sku, p.locale, left(s.body, 60)
FROM shop_product_pages p
JOIN shop_product_pages_sections s ON s._parent_id = p.id
WHERE s.type = 'guide' AND p.sku LIKE 'crystal-%'
ORDER BY p.sku, p.locale;
SQL
