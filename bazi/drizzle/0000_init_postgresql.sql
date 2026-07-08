CREATE TYPE "public"."bazi_user_role" AS ENUM('user', 'admin');
--> statement-breakpoint
CREATE TYPE "public"."bazi_record_type" AS ENUM('single', 'couple');
--> statement-breakpoint
CREATE TYPE "public"."bazi_plan_type" AS ENUM('basic', 'advanced', 'premium');
--> statement-breakpoint
CREATE TYPE "public"."bazi_purchase_status" AS ENUM('pending', 'completed', 'failed');
--> statement-breakpoint
CREATE TYPE "public"."bazi_push_status" AS ENUM('pending', 'pushed', 'failed');
--> statement-breakpoint
CREATE TYPE "public"."bazi_report_type" AS ENUM('single', 'couple');
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"openId" varchar(64) NOT NULL,
	"name" text,
	"email" varchar(320),
	"loginMethod" varchar(64),
	"role" "bazi_user_role" DEFAULT 'user' NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	"lastSignedIn" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_openId_unique" UNIQUE("openId")
);
--> statement-breakpoint
CREATE TABLE "bazi_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"type" "bazi_record_type" NOT NULL,
	"name1" varchar(64) NOT NULL,
	"name2" varchar(64),
	"inputData" jsonb NOT NULL,
	"resultSummary" jsonb,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "purchases" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"baziRecordId" integer,
	"planType" "bazi_plan_type" NOT NULL,
	"price" varchar(32) NOT NULL,
	"stripePaymentId" varchar(255),
	"status" "bazi_purchase_status" DEFAULT 'pending' NOT NULL,
	"name" varchar(64),
	"inputSummary" jsonb,
	"reportUrl" text,
	"pushStatus" "bazi_push_status" DEFAULT 'pending' NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bazi_reports" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"purchaseId" integer,
	"type" "bazi_report_type" NOT NULL,
	"baziData" jsonb NOT NULL,
	"reportContent" text,
	"pdfUrl" varchar(512),
	"recommendedBracelet" varchar(10),
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
