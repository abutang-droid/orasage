-- 注册同意：服务协议 + 隐私政策

ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "service_agreement_version" varchar(32);
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "service_agreement_accepted_at" timestamp;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "privacy_agreement_version" varchar(32);
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "privacy_agreement_accepted_at" timestamp;
