-- Unify list price: $39.90 (3990¢) → $168.00 (16800¢) for crystal standards + tarot bundle.
-- USD-only catalog: keep price_cents and price_cents_usd in sync.

UPDATE products
SET
  price_cents = 16800,
  price_cents_usd = 16800,
  updated_at = NOW()
WHERE price_cents_usd = 3990
   OR (price_cents = 3990 AND (price_cents_usd IS NULL OR price_cents_usd = 3990));

-- Clear stale sale prices that still sit at the old $39.90 list level.
UPDATE products
SET
  sale_price_cents = NULL,
  sale_price_cents_usd = NULL,
  updated_at = NOW()
WHERE sku IN (
  'crystal-wood',
  'crystal-fire',
  'crystal-earth',
  'crystal-metal',
  'crystal-water',
  'report-tarot-bundle'
)
AND (
  sale_price_cents_usd = 3990
  OR sale_price_cents = 3990
);
