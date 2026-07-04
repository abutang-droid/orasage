-- Per-locale pricing: CNY (price_cents) + USD (price_cents_usd)
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "price_cents_usd" integer;

UPDATE "products"
SET "price_cents_usd" = GREATEST(50, ROUND("price_cents" / 7.2))
WHERE "price_cents_usd" IS NULL;
