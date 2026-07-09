-- 工单扩展（消息中枢 #9）：分类、关联订单、用户可见回复

DO $$ BEGIN
  CREATE TYPE "contact_message_category" AS ENUM ('general', 'complaint', 'refund', 'bug');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "contact_messages" ADD COLUMN IF NOT EXISTS "category" "contact_message_category" NOT NULL DEFAULT 'general';
ALTER TABLE "contact_messages" ADD COLUMN IF NOT EXISTS "order_no" varchar(64);
ALTER TABLE "contact_messages" ADD COLUMN IF NOT EXISTS "admin_reply" text;

CREATE INDEX IF NOT EXISTS "contact_messages_user_id_idx" ON "contact_messages" ("user_id");
CREATE INDEX IF NOT EXISTS "contact_messages_category_idx" ON "contact_messages" ("category");
