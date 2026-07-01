CREATE TYPE "public"."app_source" AS ENUM('bazi', 'ziwei', 'tarot');--> statement-breakpoint
CREATE TYPE "public"."order_status" AS ENUM('pending', 'paid', 'shipped', 'completed', 'cancelled');--> statement-breakpoint
CREATE TABLE "user_readings" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"app_source" "app_source" NOT NULL,
	"reading_id" varchar(100) NOT NULL,
	"title" varchar(200) NOT NULL,
	"summary" text,
	"recommendation_reason" text,
	"crystal_sku" varchar(100),
	"created_at" timestamp DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE TABLE "user_orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"order_no" varchar(64) NOT NULL,
	"title" varchar(200) NOT NULL,
	"amount_cents" integer DEFAULT 0 NOT NULL,
	"currency" varchar(8) DEFAULT 'CNY' NOT NULL,
	"status" "order_status" DEFAULT 'pending' NOT NULL,
	"app_source" "app_source",
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_orders_order_no_unique" UNIQUE("order_no")
);--> statement-breakpoint
CREATE TABLE "user_recommendations" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"app_source" "app_source" NOT NULL,
	"crystal_sku" varchar(100) NOT NULL,
	"reason" text NOT NULL,
	"reading_id" varchar(100),
	"created_at" timestamp DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE INDEX "user_readings_user_id_idx" ON "user_readings" ("user_id");--> statement-breakpoint
CREATE INDEX "user_orders_user_id_idx" ON "user_orders" ("user_id");
