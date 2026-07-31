-- IM 超级群 Forum 话题：每会话一个 topic_id

ALTER TABLE "chat_conversations"
  ADD COLUMN IF NOT EXISTS "telegram_topic_id" integer;

CREATE INDEX IF NOT EXISTS "chat_conversations_telegram_topic_id_idx"
  ON "chat_conversations" ("telegram_topic_id");
