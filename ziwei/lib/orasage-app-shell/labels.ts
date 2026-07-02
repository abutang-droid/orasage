import type { AppId } from './config';

type LabelSet = {
  currentApp: Record<string, string>;
  explore: Record<string, string>;
  blessing: Record<string, string>;
  shop: Record<string, string>;
  mine: Record<string, string>;
  exploreTitle: Record<string, string>;
};

export const SHELL_LABELS: LabelSet = {
  currentApp: {
    'zh-CN': '当前应用',
    en: 'App',
    'zh-TW': '當前應用',
    'pt-BR': 'App',
  },
  explore: {
    'zh-CN': '探索',
    en: 'Explore',
    'zh-TW': '探索',
    'pt-BR': 'Explorar',
  },
  blessing: {
    'zh-CN': '祈福',
    en: 'Blessing',
    'zh-TW': '祈福',
    'pt-BR': 'Bênção',
  },
  shop: {
    'zh-CN': '商店',
    en: 'Shop',
    'zh-TW': '商店',
    'pt-BR': 'Loja',
  },
  mine: {
    'zh-CN': '我的',
    en: 'Me',
    'zh-TW': '我的',
    'pt-BR': 'Eu',
  },
  exploreTitle: {
    'zh-CN': '探索',
    en: 'Explore',
    'zh-TW': '探索',
    'pt-BR': 'Explorar',
  },
};

export function pickLabel(map: Record<string, string>, locale: string, fallback?: string): string {
  return map[locale] ?? map['zh-CN'] ?? map.en ?? fallback ?? '';
}

export function currentAppLabel(appId: AppId, locale: string): string {
  return pickLabel(SHELL_LABELS.currentApp, locale);
}
