-- 后端列价统一为 USDT 分（price_cents_usd 为源；price_cents 同步为同值，不再表示 CNY）
-- WOLD 仅由运行时汇率派生，不入库。

-- 1) 商品：补齐缺失 USDT，再把遗留 CNY 列对齐为 USDT 分
UPDATE products
SET price_cents_usd = GREATEST(50, ROUND(price_cents / 7.2))
WHERE price_cents_usd IS NULL OR price_cents_usd <= 0;

UPDATE products
SET price_cents = price_cents_usd
WHERE price_cents_usd IS NOT NULL AND price_cents_usd > 0
  AND price_cents IS DISTINCT FROM price_cents_usd;

UPDATE products
SET sale_price_cents_usd = GREATEST(50, ROUND(sale_price_cents / 7.2))
WHERE sale_price_cents IS NOT NULL
  AND (sale_price_cents_usd IS NULL OR sale_price_cents_usd <= 0);

UPDATE products
SET sale_price_cents = sale_price_cents_usd
WHERE sale_price_cents_usd IS NOT NULL AND sale_price_cents_usd > 0
  AND sale_price_cents IS DISTINCT FROM sale_price_cents_usd;

-- 2) DIY 珠子
UPDATE diy_beads
SET price_cents_usd = GREATEST(1, ROUND(price_cents / 7.2))
WHERE price_cents_usd IS NULL OR price_cents_usd <= 0;

UPDATE diy_beads
SET price_cents = price_cents_usd
WHERE price_cents_usd IS NOT NULL AND price_cents_usd > 0
  AND price_cents IS DISTINCT FROM price_cents_usd;

-- 3) DIY 最低下单：历史默认 9900=¥99 → USDT 分（÷7.2）
UPDATE diy_config
SET min_order_cents = GREATEST(50, ROUND(min_order_cents / 7.2))
WHERE min_order_cents >= 5000;

-- 4) 计费覆盖：仅有 CNY 覆盖时换算为 USDT 覆盖，并清空 CNY 列语义
UPDATE app_billing_slots
SET price_override_usd_cents = GREATEST(50, ROUND(price_override_cents / 7.2))
WHERE price_override_cents IS NOT NULL
  AND (price_override_usd_cents IS NULL OR price_override_usd_cents <= 0);

UPDATE app_billing_slots
SET price_override_cents = price_override_usd_cents
WHERE price_override_usd_cents IS NOT NULL;

-- 5) 新订单默认币种 USDT（历史订单 currency 不变）
ALTER TABLE user_orders
  ALTER COLUMN currency SET DEFAULT 'USDT';
