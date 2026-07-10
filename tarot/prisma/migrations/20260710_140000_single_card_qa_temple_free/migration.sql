-- Single-card: store guided Q&A; track temple free detailed report per day
ALTER TABLE "SingleCardReading" ADD COLUMN IF NOT EXISTS "qaAnswers" JSONB;
ALTER TABLE "SingleCardDay" ADD COLUMN IF NOT EXISTS "templeFreeReportUsed" BOOLEAN NOT NULL DEFAULT false;
