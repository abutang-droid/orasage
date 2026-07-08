-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "nickname" VARCHAR(50) NOT NULL,
    "gender" VARCHAR(10),
    "birthday" TIMESTAMP(3),
    "avatar" VARCHAR(500),
    "email" VARCHAR(100),
    "password" VARCHAR(200),
    "externalId" VARCHAR(100),
    "occupation" VARCHAR(50),
    "preferredDeity" VARCHAR(50),
    "faith" VARCHAR(80),
    "countryCode" VARCHAR(2),
    "continentCode" VARCHAR(20),
    "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false,
    "onboardingStep" VARCHAR(20) NOT NULL DEFAULT 'welcome',
    "referralCode" VARCHAR(16),
    "referredByUserId" VARCHAR(36),
    "totalSpentCents" INTEGER NOT NULL DEFAULT 0,
    "freeReadingsRemaining" INTEGER NOT NULL DEFAULT 0,
    "freeReadingsGrantMonth" VARCHAR(7),
    "streakDays" INTEGER NOT NULL DEFAULT 0,
    "streakLongest" INTEGER NOT NULL DEFAULT 0,
    "lastCheckinDate" VARCHAR(10),
    "meritTotal" INTEGER NOT NULL DEFAULT 0,
    "meritTime" INTEGER NOT NULL DEFAULT 0,
    "meritShare" INTEGER NOT NULL DEFAULT 0,
    "meritOffer" INTEGER NOT NULL DEFAULT 0,
    "meritLevel" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyCardRecord" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "cardName" VARCHAR(50) NOT NULL,
    "cardType" VARCHAR(20) NOT NULL,
    "message" VARCHAR(500) NOT NULL,
    "luckyTip" VARCHAR(200),
    "imageUrl" VARCHAR(500),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DailyCardRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WishRecord" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "wish" VARCHAR(200) NOT NULL,
    "cardName" VARCHAR(50) NOT NULL,
    "conclusion" VARCHAR(20) NOT NULL,
    "advice" VARCHAR(500) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WishRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReadingRecord" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "spreadType" VARCHAR(20) NOT NULL,
    "question" VARCHAR(500),
    "cards" JSONB NOT NULL,
    "conclusion" VARCHAR(2000),
    "crystalName" VARCHAR(50),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReadingRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FortuneView" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "love" JSONB NOT NULL,
    "work" JSONB NOT NULL,
    "wealth" JSONB NOT NULL,
    "mood" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FortuneView_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KnowledgeRead" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" VARCHAR(100) NOT NULL,
    "content" VARCHAR(500) NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "KnowledgeRead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AngelDraw" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "cardId" VARCHAR(50) NOT NULL,
    "cardName" VARCHAR(50) NOT NULL,
    "intention" VARCHAR(200),
    "message" TEXT NOT NULL,
    "affirmation" VARCHAR(300) NOT NULL,
    "guidance" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AngelDraw_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DreamRecord" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "dreamContent" TEXT NOT NULL,
    "emotion" VARCHAR(20),
    "symbols" JSONB NOT NULL,
    "interpretation" TEXT NOT NULL,
    "subconscious" VARCHAR(500) NOT NULL,
    "suggestion" VARCHAR(300) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DreamRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TempleCheckin" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "deityCode" VARCHAR(50) NOT NULL,
    "deityName" VARCHAR(80) NOT NULL,
    "faithCode" VARCHAR(80),
    "worshipStage" INTEGER NOT NULL DEFAULT 1,
    "durationSec" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "meritEarned" INTEGER NOT NULL DEFAULT 0,
    "checkinDate" VARCHAR(10) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TempleCheckin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MeritLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "path" VARCHAR(10) NOT NULL,
    "amount" INTEGER NOT NULL,
    "reason" VARCHAR(120) NOT NULL,
    "idempotencyKey" VARCHAR(80),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MeritLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyFortuneDay" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "dateKey" VARCHAR(10) NOT NULL,
    "drawsUsed" INTEGER NOT NULL DEFAULT 0,
    "templeBonusGranted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailyFortuneDay_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyFortuneRecord" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "dateKey" VARCHAR(10) NOT NULL,
    "cardId" INTEGER,
    "cardName" VARCHAR(80),
    "orientation" VARCHAR(10),
    "qaAnswers" JSONB,
    "briefText" TEXT,
    "fullReport" JSONB,
    "accessSource" VARCHAR(20) NOT NULL,
    "orderNo" VARCHAR(64),
    "readingSyncId" VARCHAR(100),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DailyFortuneRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ThreeCardReading" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "question" VARCHAR(500) NOT NULL,
    "qaAnswers" JSONB,
    "cards" JSONB NOT NULL,
    "briefText" TEXT,
    "fullReport" TEXT,
    "paidTier" VARCHAR(20),
    "orderNo" VARCHAR(64),
    "readingSyncId" VARCHAR(100),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ThreeCardReading_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_externalId_key" ON "User"("externalId");

-- CreateIndex
CREATE UNIQUE INDEX "User_referralCode_key" ON "User"("referralCode");

-- CreateIndex
CREATE INDEX "DailyCardRecord_userId_createdAt_idx" ON "DailyCardRecord"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "WishRecord_userId_createdAt_idx" ON "WishRecord"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "ReadingRecord_userId_createdAt_idx" ON "ReadingRecord"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "FortuneView_userId_date_idx" ON "FortuneView"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "FortuneView_userId_date_key" ON "FortuneView"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "KnowledgeRead_userId_date_key" ON "KnowledgeRead"("userId", "date");

-- CreateIndex
CREATE INDEX "AngelDraw_userId_createdAt_idx" ON "AngelDraw"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "DreamRecord_userId_createdAt_idx" ON "DreamRecord"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "TempleCheckin_userId_createdAt_idx" ON "TempleCheckin"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "TempleCheckin_userId_checkinDate_key" ON "TempleCheckin"("userId", "checkinDate");

-- CreateIndex
CREATE UNIQUE INDEX "MeritLog_idempotencyKey_key" ON "MeritLog"("idempotencyKey");

-- CreateIndex
CREATE INDEX "MeritLog_userId_createdAt_idx" ON "MeritLog"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "MeritLog_userId_path_idx" ON "MeritLog"("userId", "path");

-- CreateIndex
CREATE INDEX "DailyFortuneDay_userId_dateKey_idx" ON "DailyFortuneDay"("userId", "dateKey");

-- CreateIndex
CREATE UNIQUE INDEX "DailyFortuneDay_userId_dateKey_key" ON "DailyFortuneDay"("userId", "dateKey");

-- CreateIndex
CREATE INDEX "DailyFortuneRecord_userId_dateKey_idx" ON "DailyFortuneRecord"("userId", "dateKey");

-- CreateIndex
CREATE INDEX "DailyFortuneRecord_userId_createdAt_idx" ON "DailyFortuneRecord"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "ThreeCardReading_userId_createdAt_idx" ON "ThreeCardReading"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "DailyCardRecord" ADD CONSTRAINT "DailyCardRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WishRecord" ADD CONSTRAINT "WishRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReadingRecord" ADD CONSTRAINT "ReadingRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FortuneView" ADD CONSTRAINT "FortuneView_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KnowledgeRead" ADD CONSTRAINT "KnowledgeRead_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AngelDraw" ADD CONSTRAINT "AngelDraw_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DreamRecord" ADD CONSTRAINT "DreamRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TempleCheckin" ADD CONSTRAINT "TempleCheckin_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeritLog" ADD CONSTRAINT "MeritLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyFortuneDay" ADD CONSTRAINT "DailyFortuneDay_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyFortuneRecord" ADD CONSTRAINT "DailyFortuneRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ThreeCardReading" ADD CONSTRAINT "ThreeCardReading_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

