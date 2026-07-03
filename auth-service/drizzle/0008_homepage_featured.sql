CREATE TABLE IF NOT EXISTS "homepage_featured_products" (
  "id" serial PRIMARY KEY NOT NULL,
  "sku" varchar(100) NOT NULL,
  "sort_order" integer DEFAULT 0 NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "homepage_featured_products_sku_unique" UNIQUE("sku")
);

-- Default homepage showcase: five crystals + one report (when table is empty, API falls back to active catalog)
INSERT INTO "homepage_featured_products" ("sku", "sort_order")
VALUES
  ('crystal-wood', 0),
  ('crystal-fire', 1),
  ('crystal-earth', 2),
  ('crystal-metal', 3),
  ('crystal-water', 4),
  ('report-bazi-basic', 5)
ON CONFLICT ("sku") DO NOTHING;
