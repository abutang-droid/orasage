import { buildThreeCardSyncPayload } from '@/lib/reading-sync';
import { syncReadingFromServer } from '@/lib/reading-sync-server';
import type { ThreeCardRecordDto } from '@/lib/three-card/types';
import { saveThreeCardReadingSyncId } from '@/lib/three-card/record';

export async function maybeSyncThreeCardReading(
  cookieHeader: string | null | undefined,
  userId: string,
  record: ThreeCardRecordDto,
  loggedIn: boolean,
): Promise<ThreeCardRecordDto> {
  if (!loggedIn) return record;

  const payload = buildThreeCardSyncPayload(record, record.readingSyncId);
  const syncId = await syncReadingFromServer(cookieHeader, payload);
  if (!syncId || syncId === record.readingSyncId) return record;

  await saveThreeCardReadingSyncId(record.id, userId, syncId);
  return { ...record, readingSyncId: syncId };
}
