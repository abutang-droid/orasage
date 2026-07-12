-- 定命切片：商城 SKU + 塔罗计费槽位
INSERT INTO products (sku, name, element, description, price_cents, price_cents_usd, category, requires_shipping, active, sort_order)
VALUES (
  'tarot-destiny-slice',
  '定命切片',
  NULL,
  '面临抉择时从牌堆抽一张，获得简洁行动指引 · 一次付费永久解锁',
  2900,
  403,
  'report',
  false,
  true,
  32
)
ON CONFLICT (sku) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price_cents = EXCLUDED.price_cents,
  price_cents_usd = EXCLUDED.price_cents_usd,
  active = EXCLUDED.active;

INSERT INTO app_billing_slots (app_source, slot_key, sku, sort_order, active)
SELECT 'tarot', 'singlecard.unlock', 'tarot-destiny-slice', 0, true
WHERE NOT EXISTS (
  SELECT 1 FROM app_billing_slots s
  WHERE s.app_source = 'tarot' AND s.slot_key = 'singlecard.unlock'
);
