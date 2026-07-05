import type { BirthFormState } from '@/components/BirthForm';

const READING_ID_KEY = 'ziwei:lastReadingId';
const SESSION_KEY = 'ziwei:chartSession';

export type ChartSession = {
  readingId: string;
  mode: 'single' | 'heming';
  form: BirthFormState;
  formB?: BirthFormState;
};

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

export function saveChartSession(session: ChartSession) {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    saveLastReadingId(session.readingId);
  } catch { /* ignore */ }
}

export function loadChartSession(): ChartSession | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ChartSession;
  } catch {
    return null;
  }
}

export function clearChartSession() {
  try {
    sessionStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(READING_ID_KEY);
  } catch { /* ignore */ }
}
