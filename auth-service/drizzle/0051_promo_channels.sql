-- Promotion channels + per-paid-order commission legs.

CREATE TABLE IF NOT EXISTS promo_channels (
  id serial PRIMARY KEY,
  code varchar(32) NOT NULL UNIQUE,
  name varchar(120) NOT NULL,
  contact varchar(200),
  commission_bps integer NOT NULL DEFAULT 1000,
  leg varchar(16) NOT NULL DEFAULT 'gold',
  notes text,
  active boolean NOT NULL DEFAULT true,
  created_at timestamp NOT NULL DEFAULT NOW(),
  updated_at timestamp NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS promo_commission_legs (
  id serial PRIMARY KEY,
  channel_id integer NOT NULL REFERENCES promo_channels(id),
  order_no varchar(64) NOT NULL UNIQUE,
  order_cents integer NOT NULL,
  rate_bps integer NOT NULL,
  commission_cents integer NOT NULL,
  status varchar(16) NOT NULL DEFAULT 'pending',
  settled_at timestamp,
  created_at timestamp NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS promo_commission_legs_channel_id_idx
  ON promo_commission_legs (channel_id, created_at DESC);

ALTER TABLE user_orders
  ADD COLUMN IF NOT EXISTS promo_channel_id integer,
  ADD COLUMN IF NOT EXISTS promo_channel_code varchar(32);

CREATE INDEX IF NOT EXISTS user_orders_promo_channel_id_idx
  ON user_orders (promo_channel_id);
