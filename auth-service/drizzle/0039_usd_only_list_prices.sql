-- Unify catalog list prices to USD.
-- Prefer price_cents_usd when set; otherwise keep price_cents and copy into USD.
-- Mirror so both columns store the same USD cents going forward.

UPDATE products
SET
  price_cents_usd = COALESCE(NULLIF(price_cents_usd, 0), price_cents),
  price_cents = COALESCE(NULLIF(price_cents_usd, 0), price_cents),
  sale_price_cents_usd = CASE
    WHEN sale_price_cents IS NULL AND sale_price_cents_usd IS NULL THEN NULL
    ELSE COALESCE(NULLIF(sale_price_cents_usd, 0), sale_price_cents)
  END,
  sale_price_cents = CASE
    WHEN sale_price_cents IS NULL AND sale_price_cents_usd IS NULL THEN NULL
    ELSE COALESCE(NULLIF(sale_price_cents_usd, 0), sale_price_cents)
  END,
  updated_at = now()
WHERE TRUE;

UPDATE products
SET
  price_cents = price_cents_usd,
  updated_at = now()
WHERE price_cents_usd IS NOT NULL AND price_cents_usd > 0;

UPDATE products
SET
  sale_price_cents = sale_price_cents_usd,
  updated_at = now()
WHERE sale_price_cents_usd IS NOT NULL AND sale_price_cents_usd > 0;

UPDATE diy_beads
SET
  price_cents_usd = COALESCE(NULLIF(price_cents_usd, 0), price_cents),
  price_cents = COALESCE(NULLIF(price_cents_usd, 0), price_cents)
WHERE TRUE;

UPDATE diy_beads
SET price_cents = price_cents_usd
WHERE price_cents_usd IS NOT NULL AND price_cents_usd > 0;

-- DIY min order was historically CNY-scale (¥99 → 9900). Re-seed to ~$13.75 if still at old default.
UPDATE diy_config
SET min_order_cents = 1375
WHERE min_order_cents = 9900;

UPDATE app_billing_slots
SET
  price_override_usd_cents = COALESCE(NULLIF(price_override_usd_cents, 0), price_override_cents),
  price_override_cents = COALESCE(NULLIF(price_override_usd_cents, 0), price_override_cents)
WHERE price_override_cents IS NOT NULL OR price_override_usd_cents IS NOT NULL;

UPDATE app_billing_slots
SET price_override_cents = price_override_usd_cents
WHERE price_override_usd_cents IS NOT NULL AND price_override_usd_cents > 0;

ALTER TABLE user_orders ALTER COLUMN currency SET DEFAULT 'USD';

-- Shipping zone amounts are now treated as USD cents in admin UI.
-- Seed international flat_rate was 1500 ($15.00); leave values untouched —
-- operators should review zones after deploy if historical CNY-scale fees remain.

ALTER TABLE stripe_charges ALTER COLUMN currency SET DEFAULT 'usd';
ALTER TABLE stripe_refunds ALTER COLUMN currency SET DEFAULT 'usd';
ALTER TABLE stripe_payouts ALTER COLUMN currency SET DEFAULT 'usd';
