import type { BirthFormState } from '@/components/BirthForm';
import type { TimeView } from '@/components/TimeNav';

const READING_ID_KEY = 'ziwei:lastReadingId';
const SESSION_KEY = 'ziwei:chartSession';
const SESSION_VERSION = 1;

export type ChartSessionUi = {
  selectedBranch: number | null;
  timeView: TimeView;
  liunianYear: number;
  hemingTab: 'A' | 'B';
};

export type ChartSession = {
  v?: number;
  readingId: string;
  mode: 'single' | 'heming';
  form: BirthFormState;
  formB?: BirthFormState;
  ui?: ChartSessionUi;
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
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({ ...session, v: SESSION_VERSION }));
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
