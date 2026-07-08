-- 共振定制（DIY 手串）：珠子目录 / 设计稿 / 全局配置 / 虚拟结算 SKU

CREATE TABLE IF NOT EXISTS "diy_beads" (
  "id" serial PRIMARY KEY NOT NULL,
  "code" varchar(100) NOT NULL,
  "name" varchar(100) NOT NULL,
  "element" varchar(10),
  "material" varchar(100) NOT NULL,
  "bead_type" varchar(20) NOT NULL DEFAULT 'crystal',
  "diameter_mm" real NOT NULL,
  "thickness_mm" real,
  "price_cents" integer NOT NULL,
  "price_cents_usd" integer,
  "image_url" varchar(500),
  "colors" varchar(120),
  "stock" integer NOT NULL DEFAULT 999,
  "active" boolean NOT NULL DEFAULT true,
  "sort_order" integer NOT NULL DEFAULT 0,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "diy_beads_code_unique" UNIQUE("code")
);

CREATE TABLE IF NOT EXISTS "diy_designs" (
  "id" serial PRIMARY KEY NOT NULL,
  "user_id" integer,
  "share_token" varchar(32),
  "name" varchar(100),
  "beads" jsonb NOT NULL,
  "wrist_cm" real,
  "total_cents" integer,
  "status" varchar(20) NOT NULL DEFAULT 'draft',
  "order_no" varchar(64),
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "diy_designs_share_token_unique" UNIQUE("share_token")
);

CREATE INDEX IF NOT EXISTS "diy_designs_user_id_idx" ON "diy_designs" ("user_id");

-- 单行配置：串长修正 / 最低金额 / 合适度容差 / 松量
CREATE TABLE IF NOT EXISTS "diy_config" (
  "id" integer PRIMARY KEY DEFAULT 1,
  "length_correction_mm" real NOT NULL DEFAULT 3,
  "min_order_cents" integer NOT NULL DEFAULT 9900,
  "fit_tolerance_mm" real NOT NULL DEFAULT 8,
  "wrist_ease_mm" real NOT NULL DEFAULT 10,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "diy_config_singleton" CHECK ("id" = 1)
);

INSERT INTO "diy_config" ("id") VALUES (1) ON CONFLICT ("id") DO NOTHING;

GRANT ALL ON TABLE "diy_beads" TO orasage;
GRANT ALL ON TABLE "diy_designs" TO orasage;
GRANT ALL ON TABLE "diy_config" TO orasage;
GRANT ALL ON SEQUENCE "diy_beads_id_seq" TO orasage;
GRANT ALL ON SEQUENCE "diy_designs_id_seq" TO orasage;

-- 结算用虚拟 SKU（不在商城目录展示，金额按设计验价覆盖）
INSERT INTO "products" ("sku", "name", "element", "description", "price_cents", "price_cents_usd", "category", "requires_shipping", "active", "sort_order")
VALUES ('diy-bracelet', '共振定制 · DIY 能量手串', NULL, '逐颗自选的定制能量手串，金额按设计明细结算', 9900, 1375, 'crystal', true, true, 99)
ON CONFLICT ("sku") DO UPDATE SET
  "name" = EXCLUDED."name",
  "description" = EXCLUDED."description",
  "category" = EXCLUDED."category",
  "requires_shipping" = EXCLUDED."requires_shipping",
  "active" = EXCLUDED."active";

-- 珠子种子数据（价格为占位，可在 admin 珠子配置调整）
INSERT INTO "diy_beads"
  ("code", "name", "element", "material", "bead_type", "diameter_mm", "thickness_mm", "price_cents", "price_cents_usd", "colors", "sort_order")
VALUES
  -- 水晶主珠
  ('clear-6',     '净体白水晶', '金', '白水晶', 'crystal', 6,  NULL, 300,  42,  '#ffffff,#e8e8ec,#c9c9d1,#d5d5db', 10),
  ('clear-8',     '净体白水晶', '金', '白水晶', 'crystal', 8,  NULL, 500,  69,  '#ffffff,#e8e8ec,#c9c9d1,#d5d5db', 11),
  ('clear-10',    '净体白水晶', '金', '白水晶', 'crystal', 10, NULL, 800,  111, '#ffffff,#e8e8ec,#c9c9d1,#d5d5db', 12),
  ('phantom-6',   '绿幽灵',     '木', '绿幽灵', 'crystal', 6,  NULL, 500,  69,  '#e2f3e4,#8fbf95,#4e7a57,#6d9a74', 20),
  ('phantom-8',   '绿幽灵',     '木', '绿幽灵', 'crystal', 8,  NULL, 900,  125, '#e2f3e4,#8fbf95,#4e7a57,#6d9a74', 21),
  ('phantom-10',  '绿幽灵',     '木', '绿幽灵', 'crystal', 10, NULL, 1400, 194, '#e2f3e4,#8fbf95,#4e7a57,#6d9a74', 22),
  ('obsidian-6',  '黑曜石',     '水', '黑曜石', 'crystal', 6,  NULL, 400,  56,  '#5a5a66,#26262e,#0c0c12,#3a3a44', 30),
  ('obsidian-8',  '黑曜石',     '水', '黑曜石', 'crystal', 8,  NULL, 600,  83,  '#5a5a66,#26262e,#0c0c12,#3a3a44', 31),
  ('obsidian-10', '黑曜石',     '水', '黑曜石', 'crystal', 10, NULL, 1000, 139, '#5a5a66,#26262e,#0c0c12,#3a3a44', 32),
  ('carnelian-6', '红玛瑙',     '火', '红玛瑙', 'crystal', 6,  NULL, 300,  42,  '#f6c2a8,#cf5f3a,#8e3018,#b04a28', 40),
  ('carnelian-8', '红玛瑙',     '火', '红玛瑙', 'crystal', 8,  NULL, 500,  69,  '#f6c2a8,#cf5f3a,#8e3018,#b04a28', 41),
  ('carnelian-10','红玛瑙',     '火', '红玛瑙', 'crystal', 10, NULL, 800,  111, '#f6c2a8,#cf5f3a,#8e3018,#b04a28', 42),
  ('citrine-6',   '黄水晶',     '土', '黄水晶', 'crystal', 6,  NULL, 500,  69,  '#fdf3cf,#ecc65f,#c08c2c,#d1a844', 50),
  ('citrine-8',   '黄水晶',     '土', '黄水晶', 'crystal', 8,  NULL, 800,  111, '#fdf3cf,#ecc65f,#c08c2c,#d1a844', 51),
  ('citrine-10',  '黄水晶',     '土', '黄水晶', 'crystal', 10, NULL, 1200, 167, '#fdf3cf,#ecc65f,#c08c2c,#d1a844', 52),
  ('rose-6',      '粉水晶',     '火', '粉水晶', 'crystal', 6,  NULL, 300,  42,  '#fdeef2,#f0b7c8,#d97d9b,#e39cb2', 60),
  ('rose-8',      '粉水晶',     '火', '粉水晶', 'crystal', 8,  NULL, 600,  83,  '#fdeef2,#f0b7c8,#d97d9b,#e39cb2', 61),
  ('rose-10',     '粉水晶',     '火', '粉水晶', 'crystal', 10, NULL, 900,  125, '#fdeef2,#f0b7c8,#d97d9b,#e39cb2', 62),
  ('aqua-6',      '海蓝宝',     '水', '海蓝宝', 'crystal', 6,  NULL, 500,  69,  '#eaf6fa,#a3d3e8,#5e9fc0,#7fb6d2', 70),
  ('aqua-8',      '海蓝宝',     '水', '海蓝宝', 'crystal', 8,  NULL, 800,  111, '#eaf6fa,#a3d3e8,#5e9fc0,#7fb6d2', 71),
  ('aqua-10',     '海蓝宝',     '水', '海蓝宝', 'crystal', 10, NULL, 1300, 181, '#eaf6fa,#a3d3e8,#5e9fc0,#7fb6d2', 72),
  ('tiger-6',     '虎眼石',     '土', '虎眼石', 'crystal', 6,  NULL, 400,  56,  '#e8c98f,#a5762f,#5f3d12,#8a6226', 80),
  ('tiger-8',     '虎眼石',     '土', '虎眼石', 'crystal', 8,  NULL, 700,  97,  '#e8c98f,#a5762f,#5f3d12,#8a6226', 81),
  ('tiger-10',    '虎眼石',     '土', '虎眼石', 'crystal', 10, NULL, 1000, 139, '#e8c98f,#a5762f,#5f3d12,#8a6226', 82),
  ('amethyst-6',  '紫水晶',     '火', '紫水晶', 'crystal', 6,  NULL, 400,  56,  '#f0e6f7,#b48ed6,#7b52a8,#9a72c2', 90),
  ('amethyst-8',  '紫水晶',     '火', '紫水晶', 'crystal', 8,  NULL, 700,  97,  '#f0e6f7,#b48ed6,#7b52a8,#9a72c2', 91),
  ('amethyst-10', '紫水晶',     '火', '紫水晶', 'crystal', 10, NULL, 1100, 153, '#f0e6f7,#b48ed6,#7b52a8,#9a72c2', 92),
  ('moon-6',      '月光石',     '金', '月光石', 'crystal', 6,  NULL, 500,  69,  '#ffffff,#e9ecf4,#c4cbdd,#d2d8e6', 100),
  ('moon-8',      '月光石',     '金', '月光石', 'crystal', 8,  NULL, 900,  125, '#ffffff,#e9ecf4,#c4cbdd,#d2d8e6', 101),
  ('moon-10',     '月光石',     '金', '月光石', 'crystal', 10, NULL, 1400, 194, '#ffffff,#e9ecf4,#c4cbdd,#d2d8e6', 102),
  -- 隔珠
  ('silver-4',    '哑光银隔珠', '金', '银',     'spacer', 4, NULL, 200, 28, '#f4f4f6,#c8c8ce,#96969e,#aeaeb6', 200),
  ('silver-6',    '哑光银隔珠', '金', '银',     'spacer', 6, NULL, 300, 42, '#f4f4f6,#c8c8ce,#96969e,#aeaeb6', 201),
  ('gold-4',      '磨砂金隔珠', '金', '金',     'spacer', 4, NULL, 300, 42, '#f7ecd4,#dcbd7e,#a9853f,#c4a25c', 210),
  ('gold-6',      '磨砂金隔珠', '金', '金',     'spacer', 6, NULL, 400, 56, '#f7ecd4,#dcbd7e,#a9853f,#c4a25c', 211),
  ('sandal-4',    '绿檀木隔珠', '木', '绿檀木', 'spacer', 4, NULL, 200, 28, '#dcead2,#7f9e6a,#46603a,#66845a', 220),
  ('sandal-6',    '绿檀木隔珠', '木', '绿檀木', 'spacer', 6, NULL, 300, 42, '#dcead2,#7f9e6a,#46603a,#66845a', 221),
  ('cinnabar-4',  '朱砂隔珠',   '火', '朱砂',   'spacer', 4, NULL, 400, 56, '#f3b8ac,#c1442e,#7e1f10,#a53823', 230),
  ('cinnabar-6',  '朱砂隔珠',   '火', '朱砂',   'spacer', 6, NULL, 600, 83, '#f3b8ac,#c1442e,#7e1f10,#a53823', 231),
  -- 隔片（thickness_mm 计入串长）
  ('tibet-6',     '藏银隔片',   '金', '藏银',   'disc', 6, 1.5, 200, 28, '#f2f2f4,#bfbfc7,#8b8b95,#a5a5af', 300),
  ('tibet-8',     '藏银隔片',   '金', '藏银',   'disc', 8, 2,   300, 42, '#f2f2f4,#bfbfc7,#8b8b95,#a5a5af', 301),
  ('ebony-6',     '黑檀木隔片', '木', '黑檀木', 'disc', 6, 2,   200, 28, '#6b5f58,#3a3028,#1c1712,#4a3f36', 310),
  ('ebony-8',     '黑檀木隔片', '木', '黑檀木', 'disc', 8, 2,   300, 42, '#6b5f58,#3a3028,#1c1712,#4a3f36', 311),
  ('agated-6',    '玛瑙隔片',   '火', '玛瑙',   'disc', 6, 2,   300, 42, '#f0c4b0,#c96a48,#8e3a20,#b05436', 320),
  ('shell-6',     '砗磲隔片',   '水', '砗磲',   'disc', 6, 2,   300, 42, '#ffffff,#eef0ee,#d2d8d2,#dde2dd', 330)
ON CONFLICT ("code") DO NOTHING;
