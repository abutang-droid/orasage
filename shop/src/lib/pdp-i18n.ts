/** Five-element symbols as stored on products / CMS */
const ELEMENT_KEYS = ['木', '火', '土', '金', '水'] as const;
export type FiveElementKey = (typeof ELEMENT_KEYS)[number];

const ELEMENT_EN: Record<FiveElementKey, string> = {
  木: 'Wood',
  火: 'Fire',
  土: 'Earth',
  金: 'Metal',
  水: 'Water',
};

const ELEMENT_PT: Record<FiveElementKey, string> = {
  木: 'Madeira',
  火: 'Fogo',
  土: 'Terra',
  金: 'Metal',
  水: 'Água',
};

/** Localize a five-element code for display (keeps unknown values as-is). */
export function localizeFiveElement(element: string | null | undefined, locale: string): string {
  if (!element) return '';
  const key = element.trim() as FiveElementKey;
  if (!ELEMENT_KEYS.includes(key)) return element;
  if (locale.startsWith('zh')) return key;
  if (locale.startsWith('pt')) return ELEMENT_PT[key];
  return ELEMENT_EN[key];
}

/** True when a CMS title is Chinese-only (no Latin word) — unsafe to show on non-zh locales. */
export function isCjkOnlyTitle(title: string | null | undefined): boolean {
  if (!title?.trim()) return false;
  if (!/[\u4e00-\u9fff]/.test(title)) return false;
  return !/[A-Za-z]{3,}/.test(title);
}

export function pickLocalizedTitle(
  cmsTitle: string | null | undefined,
  fallback: string,
  locale: string,
): string {
  const title = cmsTitle?.trim();
  if (!title) return fallback;
  if (!locale.startsWith('zh') && isCjkOnlyTitle(title)) return fallback;
  return title;
}
