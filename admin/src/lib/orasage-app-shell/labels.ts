type LabelSet = {
  back: Record<string, string>;
  home: Record<string, string>;
  explore: Record<string, string>;
  blessing: Record<string, string>;
  shop: Record<string, string>;
  mine: Record<string, string>;
  exploreTitle: Record<string, string>;
  login: Record<string, string>;
  signedIn: Record<string, string>;
  bazi: Record<string, string>;
  ziwei: Record<string, string>;
  tarot: Record<string, string>;
  energyShop: Record<string, string>;
  famous: Record<string, string>;
  daozang: Record<string, string>;
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
  login: {
    'zh-CN': '登录',
    en: 'Login',
    'zh-TW': '登入',
    'pt-BR': 'Entrar',
  },
  signedIn: {
    'zh-CN': '已通过 OraSage 登录',
    en: 'Signed in with OraSage',
    'zh-TW': '已通過 OraSage 登入',
    'pt-BR': 'Conectado com OraSage',
  },
  bazi: {
    'zh-CN': '八字',
    en: 'BaZi',
    'zh-TW': '八字',
    'pt-BR': 'BaZi',
  },
  ziwei: {
    'zh-CN': '紫微',
    en: 'Zi Wei',
    'zh-TW': '紫微',
    'pt-BR': 'Zi Wei',
  },
  tarot: {
    'zh-CN': '塔罗牌',
    en: 'Tarot',
    'zh-TW': '塔羅牌',
    'pt-BR': 'Tarô',
  },
  energyShop: {
    'zh-CN': '能量商城',
    en: 'Energy Shop',
    'zh-TW': '能量商城',
    'pt-BR': 'Loja de Energia',
  },
  famous: {
    'zh-CN': '名人案例',
    en: 'Famous Cases',
    'zh-TW': '名人案例',
    'pt-BR': 'Casos Famosos',
  },
  daozang: {
    'zh-CN': '道藏',
    en: 'Dao Canon',
    'zh-TW': '道藏',
    'pt-BR': 'Canon Taoista',
  },
};

export function pickLabel(map: Record<string, string>, locale: string, fallback?: string): string {
  return map[locale] ?? map['zh-CN'] ?? map.en ?? fallback ?? '';
}
