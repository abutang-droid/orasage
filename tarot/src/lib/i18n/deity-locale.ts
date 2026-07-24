/**
 * Localized sanctuary / deity display names (mirrors card-locale.ts).
 * Primary name follows UI lang; subtitle is a secondary form (never duplicate).
 */

import type { Lang } from './context';

export type NamedDeity = {
  name: string;
  nameEN: string;
  namePt?: string | null;
  nameEs?: string | null;
};

export function deityDisplayName(deity: NamedDeity, lang: Lang): string {
  switch (lang) {
    case 'pt':
      return (deity.namePt || deity.nameEN || deity.name).trim();
    case 'es':
      return (deity.nameEs || deity.nameEN || deity.name).trim();
    case 'en':
      return (deity.nameEN || deity.name).trim();
    default:
      return (deity.name || deity.nameEN).trim();
  }
}

/** Secondary line under the primary name — omit when identical. */
export function deitySubtitle(deity: NamedDeity, lang: Lang): string | null {
  const primary = deityDisplayName(deity, lang);
  // Non-Chinese UIs must not fall back to Chinese as the subtitle.
  const candidates =
    lang === 'zh'
      ? [deity.nameEN, deity.namePt, deity.nameEs]
      : [deity.nameEN, deity.namePt, deity.nameEs];
  for (const c of candidates) {
    const t = (c || '').trim();
    if (t && t !== primary) return t;
  }
  return null;
}

export function deityMatchesQuery(deity: NamedDeity, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return [deity.name, deity.nameEN, deity.namePt, deity.nameEs]
    .filter(Boolean)
    .some((v) => String(v).toLowerCase().includes(q));
}
