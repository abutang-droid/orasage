import { buildDailyFortuneSyncPayload } from '@/lib/reading-sync';
import { syncReadingFromServer } from '@/lib/reading-sync-server';
import type { DailyFortuneRecordDto } from '@/lib/daily-fortune/types';
import { saveDailyFortuneReadingSyncId } from '@/lib/daily-fortune/record';

export async function maybeSyncDailyFortuneReading(
  cookieHeader: string | null | undefined,
  userId: string,
  record: DailyFortuneRecordDto,
  loggedIn: boolean,
): Promise<DailyFortuneRecordDto> {
  if (!loggedIn) return record;

  const payload = buildDailyFortuneSyncPayload(record, record.readingSyncId);
  const syncId = await syncReadingFromServer(cookieHeader, payload);
  if (!syncId || syncId === record.readingSyncId) return record;

  await saveDailyFortuneReadingSyncId(record.id, userId, syncId);
  return { ...record, readingSyncId: syncId };
}
