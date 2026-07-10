import { buildSingleCardSyncPayload } from '@/lib/reading-sync';
import { syncReadingFromServer } from '@/lib/reading-sync-server';
import type { SingleCardRecordDto } from '@/lib/single-card/types';
import { saveSingleCardReadingSyncId } from '@/lib/single-card/record';

export async function maybeSyncSingleCardReading(
  cookieHeader: string | null | undefined,
  userId: string,
  record: SingleCardRecordDto,
  loggedIn: boolean,
): Promise<SingleCardRecordDto> {
  if (!loggedIn) return record;

  const payload = buildSingleCardSyncPayload(record, record.readingSyncId);
  const syncId = await syncReadingFromServer(cookieHeader, payload);
  if (!syncId || syncId === record.readingSyncId) return record;

  await saveSingleCardReadingSyncId(record.id, userId, syncId);
  return { ...record, readingSyncId: syncId };
}
