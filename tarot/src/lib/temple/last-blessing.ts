export const LAST_BLESSING_KEY = 'manto:last-blessing';

export type LastBlessing = {
  text: string;
  deityName: string;
  date: string;
  /** Tarot short lang code (zh/en/pt/es). Legacy entries omit this. */
  lang?: string;
};

export function loadLastBlessing(lang?: string): LastBlessing | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(LAST_BLESSING_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as LastBlessing;
    if (!parsed.text?.trim()) return null;
    // Drop stale Chinese caches when UI language changed.
    if (lang) {
      if (parsed.lang && parsed.lang !== lang) return null;
      if (!parsed.lang && lang !== 'zh') return null;
    }
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
