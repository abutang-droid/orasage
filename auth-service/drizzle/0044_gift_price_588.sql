-- Gift crystal SKUs: $599.00 (59900¢) → $588.00 (58800¢).

UPDATE products
SET
  price_cents = 58800,
  price_cents_usd = 58800,
  updated_at = NOW()
WHERE sku IN (
  'crystal-wood-gift',
  'crystal-fire-gift',
  'crystal-earth-gift',
  'crystal-metal-gift',
  'crystal-water-gift'
);

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
  sale_price_cents_usd IN (59900, 12999)
  OR sale_price_cents IN (59900, 12999)
);
