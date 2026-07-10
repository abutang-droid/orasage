-- Stable reading results: input fingerprint + question cache

ALTER TABLE "DailyFortuneRecord" ADD COLUMN IF NOT EXISTS "inputHash" VARCHAR(32);

CREATE UNIQUE INDEX IF NOT EXISTS "DailyFortuneRecord_userId_dateKey_inputHash_key"
  ON "DailyFortuneRecord"("userId", "dateKey", "inputHash")
  WHERE "inputHash" IS NOT NULL;

ALTER TABLE "ThreeCardReading" ADD COLUMN IF NOT EXISTS "inputHash" VARCHAR(32);

CREATE UNIQUE INDEX IF NOT EXISTS "ThreeCardReading_userId_inputHash_key"
  ON "ThreeCardReading"("userId", "inputHash")
  WHERE "inputHash" IS NOT NULL;

CREATE TABLE IF NOT EXISTS "ReadingQuestionCache" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "flowType" VARCHAR(30) NOT NULL,
  "contextHash" VARCHAR(32) NOT NULL,
  "questions" JSONB NOT NULL,
  "llm" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ReadingQuestionCache_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "ReadingQuestionCache_userId_flowType_contextHash_key"
  ON "ReadingQuestionCache"("userId", "flowType", "contextHash");

CREATE INDEX IF NOT EXISTS "ReadingQuestionCache_userId_flowType_idx"
  ON "ReadingQuestionCache"("userId", "flowType");

ALTER TABLE "ReadingQuestionCache"
  ADD CONSTRAINT "ReadingQuestionCache_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
