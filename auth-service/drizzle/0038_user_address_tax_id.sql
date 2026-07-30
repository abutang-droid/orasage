-- Personal tax ID on saved shipping addresses (customs / invoice)
ALTER TABLE "user_addresses" ADD COLUMN IF NOT EXISTS "tax_id" varchar(64);
