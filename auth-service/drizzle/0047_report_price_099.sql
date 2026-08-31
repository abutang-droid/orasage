-- P3 / Q1: digital report basics → $0.99 (in-site HTML delivery).

UPDATE products
SET
  price_cents = 99,
  price_cents_usd = 99,
  updated_at = NOW()
WHERE sku IN (
  'report-bazi-basic',
  'report-bazi-couple-basic',
  'report-ziwei-basic'
);

SELECT sku, price_cents, price_cents_usd
FROM products
WHERE sku IN (
  'report-bazi-basic',
  'report-bazi-couple-basic',
  'report-ziwei-basic'
);
