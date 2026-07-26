-- 塔罗「今日启示」后推荐：默认五行能量手串（可被后台改写）
-- 同一 slot_key 多行 + seed 轮换；客户端也会按牌面五行回退。

INSERT INTO app_billing_slots (app_source, slot_key, sku, sort_order, active)
SELECT 'tarot', 'recommend.daily', v.sku, v.sort_order, true
FROM (VALUES
  ('crystal-wood',  0),
  ('crystal-fire',  1),
  ('crystal-earth', 2),
  ('crystal-metal', 3),
  ('crystal-water', 4)
) AS v(sku, sort_order)
WHERE EXISTS (SELECT 1 FROM products p WHERE p.sku = v.sku AND p.active = true)
  AND NOT EXISTS (
    SELECT 1 FROM app_billing_slots s
    WHERE s.app_source = 'tarot'
      AND s.slot_key = 'recommend.daily'
      AND s.sku = v.sku
  );
