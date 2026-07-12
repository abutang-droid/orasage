-- 定命切片：一次付费永久解锁
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "destinySliceUnlockedAt" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "destinySliceUnlockOrderNo" VARCHAR(64);
