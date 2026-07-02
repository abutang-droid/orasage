ALTER TABLE "user_readings" ADD COLUMN IF NOT EXISTS "report_url" varchar(512);--> statement-breakpoint
ALTER TABLE "user_readings" ADD COLUMN IF NOT EXISTS "payload_json" text;
