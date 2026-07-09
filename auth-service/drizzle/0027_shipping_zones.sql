-- Phase C: 运费区域模板（替代硬编码 estimateShippingFeeCents）

CREATE TABLE IF NOT EXISTS shipping_zones (
  id serial PRIMARY KEY,
  code varchar(50) NOT NULL UNIQUE,
  label_i18n jsonb NOT NULL DEFAULT '{}',
  country_codes jsonb NOT NULL DEFAULT '[]',
  flat_rate_cents integer NOT NULL DEFAULT 0,
  per_recipient boolean NOT NULL DEFAULT true,
  weight_free_grams integer,
  weight_block_grams integer,
  weight_block_cents integer,
  sort_order integer NOT NULL DEFAULT 0,
  is_default boolean NOT NULL DEFAULT false,
  active boolean NOT NULL DEFAULT true,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);

INSERT INTO shipping_zones (code, label_i18n, country_codes, flat_rate_cents, per_recipient, sort_order, is_default, active)
VALUES
  (
    'domestic',
    '{"zh-CN":"大中华区","en":"Greater China"}',
    '["CN","HK","MO","TW"]',
    0,
    true,
    0,
    false,
    true
  ),
  (
    'international',
    '{"zh-CN":"国际配送","en":"International"}',
    '[]',
    1500,
    true,
    1,
    true,
    true
  )
ON CONFLICT (code) DO NOTHING;

UPDATE shipping_zones SET
  weight_free_grams = 500,
  weight_block_grams = 500,
  weight_block_cents = 500
WHERE code = 'international';
