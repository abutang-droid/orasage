-- Daily fortune: one result per day; account-stable product recommend

ALTER TABLE "DailyFortuneRecord" ADD COLUMN IF NOT EXISTS "recommendSku" VARCHAR(64);

DROP INDEX IF EXISTS "DailyFortuneRecord_userId_dateKey_inputHash_key";
DROP INDEX IF EXISTS "ThreeCardReading_userId_inputHash_key";
