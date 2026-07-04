-- 商品是否需要收货地址（实体发货）
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "requires_shipping" boolean NOT NULL DEFAULT false;

-- 水晶类默认需要发货
UPDATE "products" SET "requires_shipping" = true WHERE "category" = 'crystal';

-- 含实体礼盒/手串的报告套餐
UPDATE "products" SET "requires_shipping" = true
WHERE "sku" LIKE '%-advanced' OR "sku" LIKE '%-premium';
