-- 7a 子账号权限：额外授予/收回 + 停用标记

ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "staff_grants" jsonb NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "staff_revokes" jsonb NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "staff_disabled" boolean NOT NULL DEFAULT false;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "staff_label" varchar(100);
