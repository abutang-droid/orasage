-- 1) 删除后台紫微相关商品（报告 / 组合 / 问答加量包与年卡）
-- 2) DIY 珠子仅保留 8mm 规格

-- ── 紫微商品清理 ───────────────────────────────────────────
DELETE FROM homepage_featured_products
WHERE sku IN (
  'report-ziwei',
  'report-ziwei-basic',
  'report-ziwei-advanced',
  'report-ziwei-premium',
  'ziwei-chat-pack-10',
  'ziwei-chat-yearly'
);

DELETE FROM product_links
WHERE sku IN (
  'report-ziwei',
  'report-ziwei-basic',
  'report-ziwei-advanced',
  'report-ziwei-premium',
  'ziwei-chat-pack-10',
  'ziwei-chat-yearly'
);

DELETE FROM product_reviews
WHERE sku IN (
  'report-ziwei',
  'report-ziwei-basic',
  'report-ziwei-advanced',
  'report-ziwei-premium',
  'ziwei-chat-pack-10',
  'ziwei-chat-yearly'
);

DELETE FROM app_billing_slots
WHERE sku IN (
  'report-ziwei',
  'report-ziwei-basic',
  'report-ziwei-advanced',
  'report-ziwei-premium',
  'ziwei-chat-pack-10',
  'ziwei-chat-yearly'
)
OR app_source = 'ziwei';

DELETE FROM product_combo_items
WHERE combo_sku IN (
  'report-ziwei',
  'report-ziwei-basic',
  'report-ziwei-advanced',
  'report-ziwei-premium'
)
OR component_sku IN (
  'report-ziwei',
  'report-ziwei-basic',
  'report-ziwei-advanced',
  'report-ziwei-premium',
  'ziwei-chat-pack-10',
  'ziwei-chat-yearly'
);

DELETE FROM product_tag_links
WHERE product_id IN (
  SELECT id FROM products WHERE sku IN (
    'report-ziwei',
    'report-ziwei-basic',
    'report-ziwei-advanced',
    'report-ziwei-premium',
    'ziwei-chat-pack-10',
    'ziwei-chat-yearly'
  )
);

DELETE FROM products
WHERE sku IN (
  'report-ziwei',
  'report-ziwei-basic',
  'report-ziwei-advanced',
  'report-ziwei-premium',
  'ziwei-chat-pack-10',
  'ziwei-chat-yearly'
);

-- ── DIY：仅保留 8mm ────────────────────────────────────────
DELETE FROM diy_beads
WHERE diameter_mm IS DISTINCT FROM 8;
