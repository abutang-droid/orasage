-- 删除后台商品「能量咨询 30 分钟」(service-consult)。
-- 线上无订单 / 计费槽 / 组合子项引用，可硬删。

DELETE FROM homepage_featured_products
WHERE sku = 'service-consult';

DELETE FROM product_links
WHERE sku = 'service-consult';

DELETE FROM product_reviews
WHERE sku = 'service-consult';

DELETE FROM app_billing_slots
WHERE sku = 'service-consult';

DELETE FROM product_combo_items
WHERE combo_sku = 'service-consult'
   OR component_sku = 'service-consult';

DELETE FROM product_tag_links
WHERE product_id IN (
  SELECT id FROM products WHERE sku = 'service-consult'
);

DELETE FROM products
WHERE sku = 'service-consult';
