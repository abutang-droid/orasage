export const LAST_BLESSING_KEY = 'manto:last-blessing';

export type LastBlessing = {
  text: string;
  deityName: string;
  date: string;
};

export function loadLastBlessing(): LastBlessing | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(LAST_BLESSING_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as LastBlessing;
    if (!parsed.text?.trim()) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function storeLastBlessing(blessing: LastBlessing) {
  try {
    localStorage.setItem(LAST_BLESSING_KEY, JSON.stringify(blessing));
  } catch {
    /* ignore */
  }
}
