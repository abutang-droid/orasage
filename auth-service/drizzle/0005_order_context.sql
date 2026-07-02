ALTER TABLE "user_orders" ADD COLUMN IF NOT EXISTS "sku" varchar(100);--> statement-breakpoint
ALTER TABLE "user_orders" ADD COLUMN IF NOT EXISTS "recommendation_context" text;--> statement-breakpoint
ALTER TABLE "user_orders" ADD COLUMN IF NOT EXISTS "reading_id" varchar(100);
