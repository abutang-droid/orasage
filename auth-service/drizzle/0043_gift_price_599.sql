-- Gift crystal SKUs: $129.99 (12999¢) → $599.00 (59900¢).

UPDATE products
SET
  price_cents = 59900,
  price_cents_usd = 59900,
  updated_at = NOW()
WHERE sku IN (
  'crystal-wood-gift',
  'crystal-fire-gift',
  'crystal-earth-gift',
  'crystal-metal-gift',
  'crystal-water-gift'
);

-- Clear stale sale prices pinned to the old gift list price.
UPDATE products
SET
  sale_price_cents = NULL,
  sale_price_cents_usd = NULL,
  updated_at = NOW()
WHERE sku IN (
  'crystal-wood-gift',
  'crystal-fire-gift',
  'crystal-earth-gift',
  'crystal-metal-gift',
  'crystal-water-gift'
)
AND (
  sale_price_cents_usd = 12999
  OR sale_price_cents = 12999
);
