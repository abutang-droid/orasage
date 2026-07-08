-- 用户联系留言 / 工单（main 门户联系表单 → admin 运营后台处理）

DO $$ BEGIN
  CREATE TYPE "contact_message_status" AS ENUM ('new', 'processing', 'resolved');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "contact_messages" (
  "id" serial PRIMARY KEY NOT NULL,
  "user_id" integer,
  "name" varchar(100) NOT NULL,
  "email" varchar(320) NOT NULL,
  "subject" varchar(200),
  "body" text NOT NULL,
  "locale" varchar(10),
  "status" "contact_message_status" NOT NULL DEFAULT 'new',
  "admin_note" text,
  "handled_by" integer,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "contact_messages_status_idx" ON "contact_messages" ("status");
CREATE INDEX IF NOT EXISTS "contact_messages_created_at_idx" ON "contact_messages" ("created_at");
