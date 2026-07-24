/**
 * Server-safe helpers for localized card names / orientation in AI prompts.
 * UI short codes (zh/en/pt/es) vs AI locales (zh-CN/en/pt-BR) are both supported.
 */

import {
  isNonChineseAiLocale,
  type AiLocale,
} from '../../../../shared/ai-locale/index';
import type { Lang } from './context';
import { orientationLabel } from './reading-copy';

export type NamedCard = {
  name: string;
  nameEn: string;
  namePt: string;
  nameEs: string;
};

export function cardDisplayName(card: NamedCard, lang: Lang): string {
  switch (lang) {
    case 'pt':
      return card.namePt || card.nameEn || card.name;
    case 'es':
      return card.nameEs || card.nameEn || card.name;
    case 'en':
      return card.nameEn || card.name;
    default:
      return card.name;
  }
}

export function langFromAiLocale(locale: AiLocale): Lang {
  if (locale === 'en') return 'en';
  if (locale === 'pt-BR') return 'pt';
  return 'zh';
}

/** Orientation label for AI prompts / fallbacks (never leave Chinese for en/pt-BR). */
export function orientationForAi(locale: AiLocale, orientation: string): string {
  return orientationLabel(langFromAiLocale(locale), orientation);
}

export function cardNameForAi(
  node: { cardName: string; cardNameEn?: string | null },
  locale: AiLocale,
): string {
  if (isNonChineseAiLocale(locale)) {
    return (node.cardNameEn || node.cardName || '').trim();
  }
  return (node.cardName || node.cardNameEn || '').trim();
}

export function promptCardLine(
  node: { cardName: string; cardNameEn?: string | null; orientation: string } | null | undefined,
  locale: AiLocale,
): string {
  if (!node) return '';
  const name = cardNameForAi(node, locale);
  const orient = orientationForAi(locale, node.orientation);
  return `${name} · ${orient}`;
}
