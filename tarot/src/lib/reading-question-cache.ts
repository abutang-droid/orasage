import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';

export async function getCachedQuestions(
  userId: string,
  flowType: 'three-card' | 'daily-fortune',
  contextHash: string,
) {
  const row = await prisma.readingQuestionCache.findUnique({
    where: {
      userId_flowType_contextHash: { userId, flowType, contextHash },
    },
  });
  if (!row) return null;
  return {
    questions: row.questions as unknown[],
    llm: row.llm,
  };
}

export async function saveCachedQuestions(
  userId: string,
  flowType: 'three-card' | 'daily-fortune',
  contextHash: string,
  questions: unknown[],
  llm: boolean,
) {
  const payload = questions as Prisma.InputJsonValue;
  await prisma.readingQuestionCache.upsert({
    where: {
      userId_flowType_contextHash: { userId, flowType, contextHash },
    },
    create: {
      userId,
      flowType,
      contextHash,
      questions: payload,
      llm,
    },
    update: {
      questions: payload,
      llm,
    },
  });
}
