-- Phase E：Module API keys + 配置变更审计

CREATE TABLE IF NOT EXISTS "partner_api_keys" (
  "id" serial PRIMARY KEY,
  "partner_id" varchar(64) NOT NULL,
  "name" varchar(120) NOT NULL DEFAULT 'default',
  "key_prefix" varchar(24) NOT NULL,
  "key_hash" varchar(64) NOT NULL UNIQUE,
  "scopes" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "status" varchar(20) NOT NULL DEFAULT 'active',
  "last_used_at" timestamp,
  "expires_at" timestamp,
  "created_by" integer,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "revoked_at" timestamp
);

CREATE INDEX IF NOT EXISTS "partner_api_keys_partner_idx" ON "partner_api_keys" ("partner_id");
CREATE INDEX IF NOT EXISTS "partner_api_keys_prefix_idx" ON "partner_api_keys" ("key_prefix");

CREATE TABLE IF NOT EXISTS "config_audit_logs" (
  "id" serial PRIMARY KEY,
  "partner_id" varchar(64) NOT NULL,
  "actor_type" varchar(20) NOT NULL,
  "actor_id" varchar(120),
  "module_key" varchar(64),
  "action" varchar(64) NOT NULL,
  "resource_type" varchar(64),
  "resource_id" varchar(120),
  "before" jsonb,
  "after" jsonb,
  "request_id" varchar(64),
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "config_audit_logs_partner_idx"
  ON "config_audit_logs" ("partner_id", "created_at" DESC);

GRANT ALL ON TABLE "partner_api_keys" TO orasage;
GRANT ALL ON TABLE "config_audit_logs" TO orasage;
GRANT USAGE, SELECT ON SEQUENCE "partner_api_keys_id_seq" TO orasage;
GRANT USAGE, SELECT ON SEQUENCE "config_audit_logs_id_seq" TO orasage;
