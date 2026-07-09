-- #10 行为统计：轻量 events 表（不存 IP 明文，供 7b 统计后台查询）

CREATE TABLE IF NOT EXISTS "analytics_events" (
  "id" serial PRIMARY KEY NOT NULL,
  "app" varchar(20) NOT NULL,
  "event_name" varchar(100) NOT NULL,
  "user_id" integer,
  "session_key" varchar(64) NOT NULL,
  "locale" varchar(12),
  "path" varchar(500),
  "referrer_host" varchar(200),
  "properties" jsonb NOT NULL DEFAULT '{}'::jsonb,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "analytics_events_created_at_idx" ON "analytics_events" ("created_at");
CREATE INDEX IF NOT EXISTS "analytics_events_app_created_idx" ON "analytics_events" ("app", "created_at");
CREATE INDEX IF NOT EXISTS "analytics_events_app_event_idx" ON "analytics_events" ("app", "event_name");
