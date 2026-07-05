-- 八字报告推荐商品：可独立于商城目录价设置展示/成交价
ALTER TABLE "bazi_element_recommendations"
  ADD COLUMN IF NOT EXISTS "price_cents" integer,
  ADD COLUMN IF NOT EXISTS "price_cents_usd" integer;
