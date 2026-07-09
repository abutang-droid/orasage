-- 商城后台重构 Phase A：可见性/形态/库存 + 分类/标签/关联页 + 应用计费槽位
-- Q4 决策：不做兼容层，数据搬迁后直接 DROP 旧配置表

-- ── 1. products 扩展 ─────────────────────────────────────────
ALTER TABLE products ALTER COLUMN category TYPE varchar(50) USING category::text;
DROP TYPE IF EXISTS product_category;

ALTER TABLE products ADD COLUMN IF NOT EXISTS kind varchar(20) NOT NULL DEFAULT 'standard';
ALTER TABLE products ADD COLUMN IF NOT EXISTS visibility varchar(20) NOT NULL DEFAULT 'public';
ALTER TABLE products ADD COLUMN IF NOT EXISTS stock integer;
ALTER TABLE products ADD COLUMN IF NOT EXISTS low_stock_at integer;
ALTER TABLE products ADD COLUMN IF NOT EXISTS slug varchar(200);
ALTER TABLE products ADD COLUMN IF NOT EXISTS seo_title_i18n jsonb;
ALTER TABLE products ADD COLUMN IF NOT EXISTS seo_desc_i18n jsonb;

-- kind 回填：按历史 category 推断
UPDATE products SET kind = 'digital' WHERE category = 'report' AND kind = 'standard';
UPDATE products SET kind = 'service' WHERE category = 'service' AND kind = 'standard';
UPDATE products SET kind = 'diy' WHERE sku = 'diy-bracelet';

-- visibility 回填：命理 App 计费/加量 SKU 前台不展示（R6）
UPDATE products SET visibility = 'app_only'
  WHERE sku LIKE 'report-bazi%'
     OR sku LIKE 'report-ziwei%'
     OR sku LIKE 'report-tarot%'
     OR sku LIKE 'ziwei-chat-%'
     OR sku = 'tarot-daily-draw';

-- ── 2. 分类表（Q3）────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS product_categories (
  id serial PRIMARY KEY,
  code varchar(50) NOT NULL UNIQUE,
  label_i18n jsonb NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  updated_at timestamp NOT NULL DEFAULT now()
);

INSERT INTO product_categories (code, label_i18n, sort_order) VALUES
  ('crystal', '{"zh-CN":"水晶手串","zh-TW":"水晶手串","en":"Crystal Bracelets","pt-BR":"Pulseiras de Cristal"}', 0),
  ('report',  '{"zh-CN":"数字报告","zh-TW":"數位報告","en":"Digital Reports","pt-BR":"Relatórios Digitais"}', 1),
  ('service', '{"zh-CN":"能量咨询","zh-TW":"能量諮詢","en":"Energy Consultations","pt-BR":"Consultas de Energia"}', 2)
ON CONFLICT (code) DO NOTHING;

-- ── 3. 标签体系（R2）──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS product_tag_groups (
  id serial PRIMARY KEY,
  code varchar(50) NOT NULL UNIQUE,
  label_i18n jsonb NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  updated_at timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS product_tags (
  id serial PRIMARY KEY,
  group_id integer NOT NULL,
  code varchar(50) NOT NULL UNIQUE,
  label_i18n jsonb NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  updated_at timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS product_tag_links (
  id serial PRIMARY KEY,
  product_id integer NOT NULL,
  tag_id integer NOT NULL,
  UNIQUE (product_id, tag_id)
);
CREATE INDEX IF NOT EXISTS product_tag_links_product_idx ON product_tag_links (product_id);
CREATE INDEX IF NOT EXISTS product_tag_links_tag_idx ON product_tag_links (tag_id);

-- 种子：五行标签组 + 按 element 字段挂标签
INSERT INTO product_tag_groups (code, label_i18n, sort_order) VALUES
  ('element', '{"zh-CN":"五行","zh-TW":"五行","en":"Element","pt-BR":"Elemento"}', 0),
  ('effect',  '{"zh-CN":"功效","zh-TW":"功效","en":"Effect","pt-BR":"Efeito"}', 1),
  ('scene',   '{"zh-CN":"场景","zh-TW":"場景","en":"Scene","pt-BR":"Cenário"}', 2)
ON CONFLICT (code) DO NOTHING;

INSERT INTO product_tags (group_id, code, label_i18n, sort_order)
SELECT g.id, v.code, v.label_i18n::jsonb, v.sort_order
FROM product_tag_groups g,
  (VALUES
    ('element-wood',  '{"zh-CN":"木","zh-TW":"木","en":"Wood","pt-BR":"Madeira"}', 0),
    ('element-fire',  '{"zh-CN":"火","zh-TW":"火","en":"Fire","pt-BR":"Fogo"}', 1),
    ('element-earth', '{"zh-CN":"土","zh-TW":"土","en":"Earth","pt-BR":"Terra"}', 2),
    ('element-metal', '{"zh-CN":"金","zh-TW":"金","en":"Metal","pt-BR":"Metal"}', 3),
    ('element-water', '{"zh-CN":"水","zh-TW":"水","en":"Water","pt-BR":"Água"}', 4)
  ) AS v(code, label_i18n, sort_order)
WHERE g.code = 'element'
ON CONFLICT (code) DO NOTHING;

INSERT INTO product_tag_links (product_id, tag_id)
SELECT p.id, t.id
FROM products p
JOIN product_tags t ON t.code = CASE p.element
  WHEN '木' THEN 'element-wood'
  WHEN '火' THEN 'element-fire'
  WHEN '土' THEN 'element-earth'
  WHEN '金' THEN 'element-metal'
  WHEN '水' THEN 'element-water'
END
WHERE p.element IS NOT NULL
ON CONFLICT (product_id, tag_id) DO NOTHING;

-- ── 4. 关联页面（R5）──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS product_links (
  id serial PRIMARY KEY,
  sku varchar(100) NOT NULL,
  kind varchar(20) NOT NULL DEFAULT 'media',
  title varchar(300) NOT NULL,
  title_i18n jsonb,
  url varchar(2000) NOT NULL,
  source_name varchar(200),
  locale varchar(10),
  sort_order integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS product_links_sku_idx ON product_links (sku);

-- ── 5. 应用计费槽位（R6）+ 旧表数据搬迁 ─────────────────────
CREATE TABLE IF NOT EXISTS app_billing_slots (
  id serial PRIMARY KEY,
  app_source varchar(20) NOT NULL,
  slot_key varchar(100) NOT NULL,
  sku varchar(100) NOT NULL,
  price_override_cents integer,
  price_override_usd_cents integer,
  sort_order integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  updated_at timestamp NOT NULL DEFAULT now(),
  UNIQUE (app_source, slot_key, sort_order)
);
CREATE INDEX IF NOT EXISTS app_billing_slots_lookup_idx ON app_billing_slots (app_source, slot_key);

-- 5a. 八字五行推荐（含推荐价 override）
INSERT INTO app_billing_slots (app_source, slot_key, sku, price_override_cents, price_override_usd_cents, sort_order)
SELECT 'bazi',
  'recommend.element.' || CASE element
    WHEN '木' THEN 'wood' WHEN '火' THEN 'fire' WHEN '土' THEN 'earth'
    WHEN '金' THEN 'metal' WHEN '水' THEN 'water' END,
  sku, price_cents, price_cents_usd, 0
FROM bazi_element_recommendations
WHERE element IN ('木','火','土','金','水')
ON CONFLICT DO NOTHING;

-- 八字五行推荐默认兜底（未配置的元素）
INSERT INTO app_billing_slots (app_source, slot_key, sku, sort_order)
SELECT 'bazi', v.slot_key, v.sku, 0
FROM (VALUES
  ('recommend.element.wood',  'crystal-wood'),
  ('recommend.element.fire',  'crystal-fire'),
  ('recommend.element.earth', 'crystal-earth'),
  ('recommend.element.metal', 'crystal-metal'),
  ('recommend.element.water', 'crystal-water')
) AS v(slot_key, sku)
WHERE NOT EXISTS (
  SELECT 1 FROM app_billing_slots s
  WHERE s.app_source = 'bazi' AND s.slot_key = v.slot_key
)
ON CONFLICT DO NOTHING;

-- 5b. 八字报告档位（原客户端硬编码，收入后台）
INSERT INTO app_billing_slots (app_source, slot_key, sku, sort_order) VALUES
  ('bazi', 'report.basic',           'report-bazi-basic', 0),
  ('bazi', 'report.advanced',        'report-bazi-advanced', 0),
  ('bazi', 'report.premium',         'report-bazi-premium', 0),
  ('bazi', 'report.couple.basic',    'report-bazi-couple-basic', 0),
  ('bazi', 'report.couple.advanced', 'report-bazi-couple-advanced', 0),
  ('bazi', 'report.couple.premium',  'report-bazi-couple-premium', 0)
ON CONFLICT DO NOTHING;

-- 5c. 紫微问答 + 对话页推荐
INSERT INTO app_billing_slots (app_source, slot_key, sku, sort_order) VALUES
  ('ziwei', 'chat.pack10', 'ziwei-chat-pack-10', 0),
  ('ziwei', 'chat.yearly', 'ziwei-chat-yearly', 0)
ON CONFLICT DO NOTHING;

INSERT INTO app_billing_slots (app_source, slot_key, sku, sort_order, active)
SELECT 'ziwei', 'recommend.chat', sku, sort_order, active
FROM ziwei_product_recommendations
ON CONFLICT DO NOTHING;

-- 5d. 塔罗计费 + 每日推荐
INSERT INTO app_billing_slots (app_source, slot_key, sku, sort_order)
SELECT 'tarot', v.slot_key, v.sku, 0
FROM tarot_billing_config c,
  LATERAL (VALUES
    ('daily.overage',    c.daily_overage_sku),
    ('threecard.report', c.three_card_report_sku),
    ('threecard.bundle', c.three_card_bundle_sku)
  ) AS v(slot_key, sku)
WHERE c.id = 1
ON CONFLICT DO NOTHING;

-- 塔罗计费默认兜底（tarot_billing_config 无行时）
INSERT INTO app_billing_slots (app_source, slot_key, sku, sort_order)
SELECT 'tarot', v.slot_key, v.sku, 0
FROM (VALUES
  ('daily.overage',    'tarot-daily-draw'),
  ('threecard.report', 'report-tarot'),
  ('threecard.bundle', 'report-tarot-bundle')
) AS v(slot_key, sku)
WHERE NOT EXISTS (
  SELECT 1 FROM app_billing_slots s
  WHERE s.app_source = 'tarot' AND s.slot_key = v.slot_key
)
ON CONFLICT DO NOTHING;

INSERT INTO app_billing_slots (app_source, slot_key, sku, sort_order, active)
SELECT 'tarot', 'recommend.daily', sku, sort_order, active
FROM tarot_daily_recommend_products
ON CONFLICT DO NOTHING;

-- ── 6. 删除旧配置表（Q4：不保留兼容）─────────────────────────
DROP TABLE IF EXISTS bazi_element_recommendations;
DROP TABLE IF EXISTS ziwei_product_recommendations;
DROP TABLE IF EXISTS tarot_billing_config;
DROP TABLE IF EXISTS tarot_daily_recommend_products;
