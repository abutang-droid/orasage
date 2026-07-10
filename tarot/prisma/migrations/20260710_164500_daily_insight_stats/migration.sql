-- Daily insight global participation counter (per UTC dateKey)
CREATE TABLE IF NOT EXISTS "DailyInsightStats" (
    "dateKey" VARCHAR(10) NOT NULL,
    "extraCount" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailyInsightStats_pkey" PRIMARY KEY ("dateKey")
);
