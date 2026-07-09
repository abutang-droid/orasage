-- #8 在线 IM：会话 + 消息（用户 ↔ 运营，Telegram 双向桥接）

CREATE TABLE IF NOT EXISTS "chat_conversations" (
  "id" serial PRIMARY KEY NOT NULL,
  "user_id" integer NOT NULL,
  "status" varchar(20) NOT NULL DEFAULT 'open',
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "chat_conversations_user_id_idx" ON "chat_conversations" ("user_id");
CREATE INDEX IF NOT EXISTS "chat_conversations_status_idx" ON "chat_conversations" ("status");

CREATE TABLE IF NOT EXISTS "chat_messages" (
  "id" serial PRIMARY KEY NOT NULL,
  "conversation_id" integer NOT NULL,
  "direction" varchar(10) NOT NULL,
  "body" text NOT NULL,
  "telegram_message_id" bigint,
  "read_by_user" boolean NOT NULL DEFAULT false,
  "read_by_ops" boolean NOT NULL DEFAULT false,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "chat_messages_conversation_id_idx" ON "chat_messages" ("conversation_id");
CREATE INDEX IF NOT EXISTS "chat_messages_telegram_message_id_idx" ON "chat_messages" ("telegram_message_id");
CREATE INDEX IF NOT EXISTS "chat_messages_created_at_idx" ON "chat_messages" ("created_at");
