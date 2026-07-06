-- P5：祈福乐捐 SKU（可变价 $0.01–$1，checkout 时覆盖 price_cents_usd）

INSERT INTO "products" ("sku", "name", "description", "price_cents", "price_cents_usd", "category", "requires_shipping", "active", "sort_order")
VALUES (
  'temple-donation',
  '祈福乐捐',
  '自愿支持 OraSage 祈福体系维护与软硬件投入（金额可在 $0.01–$1 间自选）',
  1,
  1,
  'service',
  false,
  true,
  5
)
ON CONFLICT ("sku") DO UPDATE SET
  "name" = EXCLUDED."name",
  "description" = EXCLUDED."description",
  "price_cents" = EXCLUDED."price_cents",
  "price_cents_usd" = EXCLUDED."price_cents_usd",
  "category" = EXCLUDED."category",
  "requires_shipping" = EXCLUDED."requires_shipping",
  "active" = EXCLUDED."active";
