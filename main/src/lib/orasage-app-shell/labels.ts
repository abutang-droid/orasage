type LabelSet = {
  back: Record<string, string>;
  home: Record<string, string>;
  explore: Record<string, string>;
  blessing: Record<string, string>;
  shop: Record<string, string>;
  mine: Record<string, string>;
  exploreTitle: Record<string, string>;
};

export const SHELL_LABELS: LabelSet = {
  back: {
    'zh-CN': '返回',
    en: 'Back',
    'zh-TW': '返回',
    'pt-BR': 'Voltar',
  },
  home: {
    'zh-CN': '首页',
    en: 'Home',
    'zh-TW': '首頁',
    'pt-BR': 'Início',
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
