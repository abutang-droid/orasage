-- 订单归因到已启用的销售渠道。未知或停用编码不写列，下单仍成功。

ALTER TABLE "user_orders" ADD COLUMN IF NOT EXISTS "sales_channel_id" integer;

CREATE INDEX IF NOT EXISTS "user_orders_sales_channel_id_idx" ON "user_orders" ("sales_channel_id");
