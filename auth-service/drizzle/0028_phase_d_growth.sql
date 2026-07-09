-- Phase D: 员工角色扩展 + UGC 评价 + 促销券 + 商品限时价

ALTER TYPE role ADD VALUE IF NOT EXISTS 'shop_ops';
ALTER TYPE role ADD VALUE IF NOT EXISTS 'content_ops';

CREATE TYPE product_review_status AS ENUM ('pending', 'approved', 'rejected', 'featured');

CREATE TABLE IF NOT EXISTS product_reviews (
  id serial PRIMARY KEY,
  user_id integer NOT NULL,
  sku varchar(100) NOT NULL,
  order_no varchar(64),
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  body text NOT NULL,
  status product_review_status NOT NULL DEFAULT 'pending',
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS product_reviews_sku_status_idx ON product_reviews (sku, status);
CREATE INDEX IF NOT EXISTS product_reviews_user_idx ON product_reviews (user_id);

CREATE TABLE IF NOT EXISTS coupons (
  id serial PRIMARY KEY,
  code varchar(50) NOT NULL UNIQUE,
  label_i18n jsonb NOT NULL DEFAULT '{}',
  discount_type varchar(20) NOT NULL DEFAULT 'percent',
  discount_value integer NOT NULL,
  min_order_cents integer NOT NULL DEFAULT 0,
  max_uses integer,
  used_count integer NOT NULL DEFAULT 0,
  starts_at timestamp,
  ends_at timestamp,
  active boolean NOT NULL DEFAULT true,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS sale_price_cents integer,
  ADD COLUMN IF NOT EXISTS sale_price_cents_usd integer,
  ADD COLUMN IF NOT EXISTS sale_starts_at timestamp,
  ADD COLUMN IF NOT EXISTS sale_ends_at timestamp;
