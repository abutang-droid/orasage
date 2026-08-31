type LabelMap = Record<string, string>;

type LabelSet = {
  back: LabelMap;
  home: LabelMap;
  explore: LabelMap;
  blessing: LabelMap;
  shop: LabelMap;
  mine: LabelMap;
  exploreTitle: LabelMap;
  login: LabelMap;
  signedIn: LabelMap;
  bazi: LabelMap;
  ziwei: LabelMap;
  tarot: LabelMap;
  energyShop: LabelMap;
  famous: LabelMap;
  daozang: LabelMap;
  copyright: LabelMap;
  privacy: LabelMap;
  terms: LabelMap;
  /** P1 IA */
  insights: LabelMap;
  origins: LabelMap;
  readings: LabelMap;
  search: LabelMap;
  cart: LabelMap;
  myReadings: LabelMap;
  navByElement: LabelMap;
  navByIntention: LabelMap;
  navBracelets: LabelMap;
  navReports: LabelMap;
  navGifts: LabelMap;
  elementWood: LabelMap;
  elementFire: LabelMap;
  elementEarth: LabelMap;
  elementMetal: LabelMap;
  elementWater: LabelMap;
  intentGrowth: LabelMap;
  intentCourage: LabelMap;
  intentGrounding: LabelMap;
  intentClarity: LabelMap;
  intentBoundaries: LabelMap;
  navDayMaster: LabelMap;
  navFiveElementsDecoded: LabelMap;
  navSolarTerms: LabelMap;
  navCrystalCompanion: LabelMap;
  navLatest: LabelMap;
  navCorrections: LabelMap;
  navTheMaking: LabelMap;
  navAtelier: LabelMap;
  navOurStory: LabelMap;
};

const L = {
  zh: (zh: string, en: string, tw = zh, pt = en): LabelMap => ({
    'zh-CN': zh,
    en,
    'zh-TW': tw,
    'pt-BR': pt,
  }),
};

export const SHELL_LABELS: LabelSet = {
  back: L.zh('返回', 'Back', '返回', 'Voltar'),
  home: L.zh('首页', 'Home', '首頁', 'Início'),
  explore: L.zh('探索', 'Explore', '探索', 'Explorar'),
  blessing: L.zh('祈愿池', 'Wishing Well', '祈願池', 'Poço dos Desejos'),
  shop: L.zh('商城', 'Shop', '商城', 'Loja'),
  mine: L.zh('我的', 'Me', '我的', 'Eu'),
  exploreTitle: L.zh('探索', 'Explore', '探索', 'Explorar'),
  login: L.zh('登录', 'Login', '登入', 'Entrar'),
  signedIn: L.zh('已通过 OraSage 登录', 'Signed in with OraSage', '已通過 OraSage 登入', 'Conectado com OraSage'),
  bazi: L.zh('八字', 'BaZi', '八字', 'BaZi'),
  ziwei: L.zh('紫微', 'Zi Wei', '紫微', 'Zi Wei'),
  tarot: L.zh('塔罗牌', 'Tarot', '塔羅牌', 'Tarô'),
  energyShop: L.zh('五行造物', 'Five Elements', '五行造物', 'Cinco Elementos'),
  famous: L.zh('名人案例', 'Famous Cases', '名人案例', 'Casos Famosos'),
  daozang: L.zh('道藏', 'Dao Canon', '道藏', 'Canon Taoista'),
  copyright: L.zh(
    '© 2026 OraSage. 保留所有权利。',
    '© 2026 OraSage. All rights reserved.',
    '© 2026 OraSage. 保留所有權利。',
    '© 2026 OraSage. Todos os direitos reservados.',
  ),
  privacy: L.zh('隐私政策', 'Privacy Policy', '隱私政策', 'Política de Privacidade'),
  terms: L.zh('服务条款', 'Terms of Service', '服務條款', 'Termos de Serviço'),
  insights: L.zh('玄析', 'Insights', '玄析', 'Insights'),
  origins: L.zh('造物', 'Origins', '造物', 'Origins'),
  readings: L.zh('测算', 'Readings', '測算', 'Leituras'),
  search: L.zh('搜索', 'Search', '搜尋', 'Buscar'),
  cart: L.zh('购物车', 'Cart', '購物車', 'Carrinho'),
  myReadings: L.zh('我的测算', 'My Readings', '我的測算', 'Minhas leituras'),
  navByElement: L.zh('按五行', 'By Element', '按五行', 'Por elemento'),
  navByIntention: L.zh('按愿', 'By Intention', '按願', 'Por intenção'),
  navBracelets: L.zh('手串', 'Bracelets', '手串', 'Pulseiras'),
  navReports: L.zh('数字报告', 'Digital Reports', '數字報告', 'Relatórios digitais'),
  navGifts: L.zh('礼赠', 'Gifts', '禮贈', 'Presentes'),
  elementWood: L.zh('木 · 生长', 'Wood · Growth', '木 · 生長', 'Madeira · Crescimento'),
  elementFire: L.zh('火 · 勇气', 'Fire · Courage', '火 · 勇氣', 'Fogo · Coragem'),
  elementEarth: L.zh('土 · 稳固', 'Earth · Grounding', '土 · 穩固', 'Terra · Estabilidade'),
  elementMetal: L.zh('金 · 澄明', 'Metal · Clarity', '金 · 澄明', 'Metal · Clareza'),
  elementWater: L.zh('水 · 边界', 'Water · Boundaries', '水 · 邊界', 'Água · Limites'),
  intentGrowth: L.zh('生长', 'Growth', '生長', 'Crescimento'),
  intentCourage: L.zh('勇气', 'Courage', '勇氣', 'Coragem'),
  intentGrounding: L.zh('稳固', 'Grounding', '穩固', 'Estabilidade'),
  intentClarity: L.zh('澄明', 'Clarity', '澄明', 'Clareza'),
  intentBoundaries: L.zh('边界', 'Boundaries', '邊界', 'Limites'),
  navDayMaster: L.zh('日主人格学', 'Day Master Typology', '日主人格學', 'Tipologia do Dia Mestre'),
  navFiveElementsDecoded: L.zh('五行解码', 'Five Elements Decoded', '五行解碼', 'Cinco Elementos'),
  navSolarTerms: L.zh('节气与流年', '24 Solar Terms', '節氣與流年', 'Termos solares'),
  navCrystalCompanion: L.zh('水晶志', 'Crystal Companion', '水晶志', 'Companheiro de cristal'),
  navLatest: L.zh('最新', 'Latest', '最新', 'Mais recentes'),
  navCorrections: L.zh('勘误', 'Corrections', '勘誤', 'Correções'),
  navTheMaking: L.zh('造物记', 'The Making', '造物記', 'A criação'),
  navAtelier: L.zh('工坊', 'Atelier', '工坊', 'Ateliê'),
  navOurStory: L.zh('缘起', 'Our Story', '緣起', 'Nossa história'),
};

export function pickLabel(map: Record<string, string>, locale: string, fallback?: string): string {
  if (map[locale]) return map[locale];
  // Non-zh locales must not silently fall back to Chinese shell copy.
  if (locale.startsWith('zh')) return map['zh-CN'] ?? map.en ?? fallback ?? '';
  return map.en ?? map['zh-CN'] ?? fallback ?? '';
}
