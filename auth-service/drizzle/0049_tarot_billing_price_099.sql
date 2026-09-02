-- Tarot in-app billing unlocks → $0.99 USD (digital unlock / overage SKUs).

UPDATE products
SET
  price_cents = 99,
  price_cents_usd = 99,
  sale_price_cents = NULL,
  sale_price_cents_usd = NULL,
  updated_at = NOW()
WHERE sku IN (
  'report-tarot',
  'report-tarot-bundle',
  'tarot-destiny-slice',
  'tarot-daily-draw'
);

-- Clear any admin slot price overrides so catalog $0.99 wins.
UPDATE app_billing_slots
SET
  price_override_cents = NULL,
  price_override_usd_cents = NULL,
  updated_at = NOW()
WHERE app_source = 'tarot'
  AND sku IN (
    'report-tarot',
    'report-tarot-bundle',
    'tarot-destiny-slice',
    'tarot-daily-draw'
  );

SELECT sku, price_cents, price_cents_usd, sale_price_cents, sale_price_cents_usd
FROM products
WHERE sku IN (
  'report-tarot',
  'report-tarot-bundle',
  'tarot-destiny-slice',
  'tarot-daily-draw'
);
