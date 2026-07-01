CREATE TYPE "public"."role" AS ENUM('user', 'admin');--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(320) NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"nickname" varchar(100) DEFAULT '' NOT NULL,
	"avatar_url" varchar(500),
	"birth_date" varchar(20),
	"birth_hour" varchar(10),
	"birth_place_province" varchar(50),
	"birth_place_city" varchar(50),
	"birthplace_longitude" varchar(20),
	"gender" varchar(10),
	"preferred_deity" varchar(50),
	"language_preference" varchar(10) DEFAULT 'zh-CN',
	"role" "role" DEFAULT 'user' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"last_signed_in" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
