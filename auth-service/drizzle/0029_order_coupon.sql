-- Checkout coupon: persist applied code and pre-discount subtotal on orders

ALTER TABLE user_orders
  ADD COLUMN IF NOT EXISTS coupon_code varchar(50),
  ADD COLUMN IF NOT EXISTS subtotal_cents integer;
