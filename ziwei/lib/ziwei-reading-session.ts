const READING_ID_KEY = 'ziwei:lastReadingId';

export function saveLastReadingId(readingId: string) {
  try {
    sessionStorage.setItem(READING_ID_KEY, readingId);
  } catch { /* ignore */ }
}

export function getLastReadingId(): string | null {
  try {
    return sessionStorage.getItem(READING_ID_KEY);
  } catch {
    return null;
  }
}
