-- CreateTable (idempotent — safe if an earlier mis-ordered migration already created these)
CREATE TABLE IF NOT EXISTS "SingleCardDay" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "dateKey" VARCHAR(10) NOT NULL,
    "drawsUsed" INTEGER NOT NULL DEFAULT 0,
    "templeBonusGranted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SingleCardDay_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "SingleCardDay_userId_dateKey_key" ON "SingleCardDay"("userId", "dateKey");
CREATE INDEX IF NOT EXISTS "SingleCardDay_userId_dateKey_idx" ON "SingleCardDay"("userId", "dateKey");

DO $$ BEGIN
  ALTER TABLE "SingleCardDay"
    ADD CONSTRAINT "SingleCardDay_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- CreateTable
CREATE TABLE IF NOT EXISTS "SingleCardReading" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "question" VARCHAR(500) NOT NULL,
    "cardId" INTEGER NOT NULL,
    "cardName" VARCHAR(80) NOT NULL,
    "cardNameEn" VARCHAR(80),
    "orientation" VARCHAR(10) NOT NULL,
    "element" VARCHAR(20),
    "briefText" TEXT,
    "fullReport" TEXT,
    "paidTier" VARCHAR(20),
    "orderNo" VARCHAR(64),
    "readingSyncId" VARCHAR(100),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SingleCardReading_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "SingleCardReading_userId_createdAt_idx" ON "SingleCardReading"("userId", "createdAt");

DO $$ BEGIN
  ALTER TABLE "SingleCardReading"
    ADD CONSTRAINT "SingleCardReading_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
