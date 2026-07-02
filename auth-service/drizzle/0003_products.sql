CREATE TYPE "public"."product_category" AS ENUM('crystal', 'report', 'service');--> statement-breakpoint
CREATE TABLE "products" (
	"id" serial PRIMARY KEY NOT NULL,
	"sku" varchar(100) NOT NULL,
	"name" varchar(200) NOT NULL,
	"element" varchar(10),
	"description" text NOT NULL,
	"price_cents" integer NOT NULL,
	"category" "product_category" NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "products_sku_unique" UNIQUE("sku")
);--> statement-breakpoint
ALTER TABLE "user_orders" ADD COLUMN "sku" varchar(100);--> statement-breakpoint
INSERT INTO "products" ("sku", "name", "element", "description", "price_cents", "category", "sort_order") VALUES
('crystal-wood', '绿幽灵手串', '木', '招财旺运 · 五行补木', 12800, 'crystal', 1),
('crystal-fire', '红玛瑙手串', '火', '补火平衡 · 增强活力', 9800, 'crystal', 2),
('crystal-earth', '黄水晶手串', '土', '稳固根基 · 聚财守正', 10800, 'crystal', 3),
('crystal-metal', '白水晶手串', '金', '净化能量 · 清晰思绪', 8800, 'crystal', 4),
('crystal-water', '黑曜石手串', '水', '辟邪护身 · 吸收负能量', 11800, 'crystal', 5),
('report-bazi', '八字深度报告', NULL, '完整命盘解析 · PDF 交付', 6800, 'report', 10),
('report-ziwei', '紫微斗数报告', NULL, '十二宫详解 · 流年运势', 7800, 'report', 11),
('report-tarot', '塔罗深度解读', NULL, '牌阵详解 · 行动建议', 4800, 'report', 12),
('service-consult', '能量咨询 30 分钟', NULL, '一对一命理师在线答疑', 19800, 'service', 20);
