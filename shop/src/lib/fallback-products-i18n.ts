/** Localized fallback catalog names/descriptions (faithful translations of zh-CN seeds). */

import type { Product } from './products';

type Loc = 'zh-CN' | 'zh-TW' | 'en' | 'pt-BR';

function normalize(locale: string): Loc {
  if (locale === 'zh-TW' || locale === 'en' || locale === 'pt-BR') return locale;
  return 'zh-CN';
}

type TextFields = Pick<Product, 'name' | 'desc' | 'packaging'>;

const CRYSTAL_FALLBACK_I18N: Record<Loc, Record<string, TextFields>> = {
  'zh-CN': {},
  'zh-TW': {
    'crystal-wood': {
      name: '生長之境 · 綠幽靈能量手串',
      desc: '五行屬木 · 招財旺運 · 生機生長',
    },
    'crystal-fire': {
      name: '焰心覺醒 · 紅瑪瑙能量手串',
      desc: '五行屬火 · 提振活力 · 勇敢行動',
    },
    'crystal-earth': {
      name: '厚土之根 · 黃水晶能量手串',
      desc: '五行屬土 · 穩固根基 · 聚財守正',
    },
    'crystal-metal': {
      name: '澄明之境 · 白水晶能量手串',
      desc: '五行屬金 · 淨化能量 · 思緒澄明',
    },
    'crystal-water': {
      name: '深海靜盾 · 黑曜石能量手串',
      desc: '五行屬水 · 辟邪護身 · 建立邊界',
    },
    'crystal-wood-gift': {
      name: '生長之境 · 綠幽靈能量手串 · 禮盒裝',
      packaging: '精美禮盒 · 祝福卡 · 絨布袋',
      desc: '五行屬木 · 贈禮專屬包裝',
    },
    'crystal-fire-gift': {
      name: '焰心覺醒 · 紅瑪瑙能量手串 · 禮盒裝',
      packaging: '精美禮盒 · 祝福卡 · 絨布袋',
      desc: '五行屬火 · 贈禮專屬包裝',
    },
    'crystal-earth-gift': {
      name: '厚土之根 · 黃水晶能量手串 · 禮盒裝',
      packaging: '精美禮盒 · 祝福卡 · 絨布袋',
      desc: '五行屬土 · 贈禮專屬包裝',
    },
    'crystal-metal-gift': {
      name: '澄明之境 · 白水晶能量手串 · 禮盒裝',
      packaging: '精美禮盒 · 祝福卡 · 絨布袋',
      desc: '五行屬金 · 贈禮專屬包裝',
    },
    'crystal-water-gift': {
      name: '深海靜盾 · 黑曜石能量手串 · 禮盒裝',
      packaging: '精美禮盒 · 祝福卡 · 絨布袋',
      desc: '五行屬水 · 贈禮專屬包裝',
    },
    'report-bazi': { name: '八字深度報告', desc: '完整命盤解析 · PDF 交付' },
    'report-bazi-basic': { name: '八字深度解讀', desc: '完整命盤 AI 解讀報告' },
    'report-bazi-advanced': { name: '八字報告 + 能量手串', desc: '深度解讀 + 五行水晶推薦' },
    'report-bazi-premium': { name: '八字終極能量禮盒', desc: '完整報告 + 水晶禮盒' },
    'report-bazi-couple-basic': { name: '八字合盤深度解讀', desc: '雙人合盤 AI 解讀報告' },
    'report-bazi-couple-advanced': {
      name: '八字合盤報告 + 能量手串',
      desc: '合盤解讀 + 雙人五行水晶推薦',
    },
    'report-bazi-couple-premium': {
      name: '八字合盤終極能量禮盒',
      desc: '完整合盤報告 + 水晶禮盒',
    },
    'report-ziwei': { name: '紫微深度報告', desc: '十二宮詳解 · 流年運勢' },
    'report-ziwei-basic': { name: '紫微深度解讀', desc: '命盤 AI 解讀報告' },
    'report-ziwei-advanced': { name: '紫微報告 + 能量手串', desc: '深度解讀 + 五行水晶推薦' },
    'report-ziwei-premium': { name: '紫微終極能量禮盒', desc: '完整報告 + 水晶禮盒' },
    'ziwei-chat-pack-10': { name: '紫微問答加量包', desc: '額外 10 次 OraSage 對話機會' },
    'ziwei-chat-yearly': { name: '紫微問答年卡', desc: '365 天無限 OraSage 對話' },
    'report-tarot': { name: '塔羅深度解讀', desc: '牌陣詳解 · 行動建議' },
    'tarot-destiny-slice': {
      name: '定命切片',
      desc: '面臨抉擇時抽牌得行動指引 · 一次付費永久解鎖',
    },
    'service-consult': { name: '能量諮詢 30 分鐘', desc: '一對一命理師線上答疑' },
    'temple-donation': {
      name: '祈福樂捐',
      desc: '支持祈福體系維護與軟硬體投入（$0.01–$1 自選）',
    },
  },
  en: {
    'crystal-wood': {
      name: 'Realm of Growth · Green Phantom Bracelet',
      desc: 'Wood element · Prosperity · Vital growth',
    },
    'crystal-fire': {
      name: 'Awakened Flame · Red Agate Bracelet',
      desc: 'Fire element · Vitality · Courageous action',
    },
    'crystal-earth': {
      name: 'Root of Earth · Citrine Bracelet',
      desc: 'Earth element · Steady foundation · Gather and hold',
    },
    'crystal-metal': {
      name: 'Clear Mirror · Clear Quartz Bracelet',
      desc: 'Metal element · Purification · Mental clarity',
    },
    'crystal-water': {
      name: 'Deep-Sea Shield · Obsidian Bracelet',
      desc: 'Water element · Protection · Healthy boundaries',
    },
    'crystal-wood-gift': {
      name: 'Realm of Growth · Green Phantom Bracelet · Gift box',
      packaging: 'Gift box · Blessing card · Velvet pouch',
      desc: 'Wood element · Gift packaging',
    },
    'crystal-fire-gift': {
      name: 'Awakened Flame · Red Agate Bracelet · Gift box',
      packaging: 'Gift box · Blessing card · Velvet pouch',
      desc: 'Fire element · Gift packaging',
    },
    'crystal-earth-gift': {
      name: 'Root of Earth · Citrine Bracelet · Gift box',
      packaging: 'Gift box · Blessing card · Velvet pouch',
      desc: 'Earth element · Gift packaging',
    },
    'crystal-metal-gift': {
      name: 'Clear Mirror · Clear Quartz Bracelet · Gift box',
      packaging: 'Gift box · Blessing card · Velvet pouch',
      desc: 'Metal element · Gift packaging',
    },
    'crystal-water-gift': {
      name: 'Deep-Sea Shield · Obsidian Bracelet · Gift box',
      packaging: 'Gift box · Blessing card · Velvet pouch',
      desc: 'Water element · Gift packaging',
    },
    'report-bazi': { name: 'BaZi Deep Report', desc: 'Full chart analysis · PDF delivery' },
    'report-bazi-basic': { name: 'BaZi Deep Reading', desc: 'Full chart AI reading report' },
    'report-bazi-advanced': {
      name: 'BaZi Report + Energy Bracelet',
      desc: 'Deep reading + five-element crystal pick',
    },
    'report-bazi-premium': {
      name: 'BaZi Ultimate Energy Gift Set',
      desc: 'Full report + crystal gift box',
    },
    'report-bazi-couple-basic': {
      name: 'BaZi Compatibility Deep Reading',
      desc: 'Two-person chart AI reading',
    },
    'report-bazi-couple-advanced': {
      name: 'BaZi Compatibility Report + Bracelets',
      desc: 'Compatibility reading + dual crystal picks',
    },
    'report-bazi-couple-premium': {
      name: 'BaZi Compatibility Ultimate Gift Set',
      desc: 'Full compatibility report + crystal gift box',
    },
    'report-ziwei': { name: 'ZiWei Deep Report', desc: 'Twelve palaces · Annual outlook' },
    'report-ziwei-basic': { name: 'ZiWei Deep Reading', desc: 'Chart AI reading report' },
    'report-ziwei-advanced': {
      name: 'ZiWei Report + Energy Bracelet',
      desc: 'Deep reading + five-element crystal pick',
    },
    'report-ziwei-premium': {
      name: 'ZiWei Ultimate Energy Gift Set',
      desc: 'Full report + crystal gift box',
    },
    'ziwei-chat-pack-10': {
      name: 'ZiWei Chat Top-up',
      desc: '10 extra OraSage conversation turns',
    },
    'ziwei-chat-yearly': {
      name: 'ZiWei Chat Annual Pass',
      desc: '365 days of unlimited OraSage chat',
    },
    'report-tarot': { name: 'Tarot Deep Reading', desc: 'Spread detail · Action guidance' },
    'tarot-destiny-slice': {
      name: 'Destiny Slice',
      desc: 'Draw for guidance at a crossroads · one-time unlock',
    },
    'service-consult': {
      name: 'Energy Consult 30 min',
      desc: 'One-to-one reader Q&A online',
    },
    'temple-donation': {
      name: 'Blessing Donation',
      desc: 'Support temple systems and hardware ($0.01–$1 choose amount)',
    },
  },
  'pt-BR': {
    'crystal-wood': {
      name: 'Reino do Crescimento · Pulseira Fantasma Verde',
      desc: 'Elemento Madeira · Prosperidade · Crescimento vital',
    },
    'crystal-fire': {
      name: 'Chama Despertada · Pulseira Ágata Vermelha',
      desc: 'Elemento Fogo · Vitalidade · Ação corajosa',
    },
    'crystal-earth': {
      name: 'Raiz da Terra · Pulseira Citrino',
      desc: 'Elemento Terra · Base firme · Reunir e guardar',
    },
    'crystal-metal': {
      name: 'Espelho Claro · Pulseira Quartzo Cristal',
      desc: 'Elemento Metal · Purificação · Clareza mental',
    },
    'crystal-water': {
      name: 'Escudo do Mar Profundo · Pulseira Obsidiana',
      desc: 'Elemento Água · Proteção · Limites saudáveis',
    },
    'crystal-wood-gift': {
      name: 'Reino do Crescimento · Pulseira Fantasma Verde · Caixa presente',
      packaging: 'Caixa presente · Cartão de bênção · Saquinho de veludo',
      desc: 'Elemento Madeira · Embalagem para presente',
    },
    'crystal-fire-gift': {
      name: 'Chama Despertada · Pulseira Ágata Vermelha · Caixa presente',
      packaging: 'Caixa presente · Cartão de bênção · Saquinho de veludo',
      desc: 'Elemento Fogo · Embalagem para presente',
    },
    'crystal-earth-gift': {
      name: 'Raiz da Terra · Pulseira Citrino · Caixa presente',
      packaging: 'Caixa presente · Cartão de bênção · Saquinho de veludo',
      desc: 'Elemento Terra · Embalagem para presente',
    },
    'crystal-metal-gift': {
      name: 'Espelho Claro · Pulseira Quartzo Cristal · Caixa presente',
      packaging: 'Caixa presente · Cartão de bênção · Saquinho de veludo',
      desc: 'Elemento Metal · Embalagem para presente',
    },
    'crystal-water-gift': {
      name: 'Escudo do Mar Profundo · Pulseira Obsidiana · Caixa presente',
      packaging: 'Caixa presente · Cartão de bênção · Saquinho de veludo',
      desc: 'Elemento Água · Embalagem para presente',
    },
    'report-bazi': { name: 'Relatório BaZi aprofundado', desc: 'Análise completa · Entrega em PDF' },
    'report-bazi-basic': { name: 'Leitura BaZi aprofundada', desc: 'Relatório AI do mapa completo' },
    'report-bazi-advanced': {
      name: 'Relatório BaZi + pulseira de energia',
      desc: 'Leitura profunda + cristal dos cinco elementos',
    },
    'report-bazi-premium': {
      name: 'Kit BaZi de energia definitivo',
      desc: 'Relatório completo + caixa de cristal',
    },
    'report-bazi-couple-basic': {
      name: 'Leitura BaZi de compatibilidade',
      desc: 'Leitura AI de mapa a dois',
    },
    'report-bazi-couple-advanced': {
      name: 'Relatório de compatibilidade + pulseiras',
      desc: 'Leitura a dois + cristais recomendados',
    },
    'report-bazi-couple-premium': {
      name: 'Kit de compatibilidade BaZi definitivo',
      desc: 'Relatório completo + caixa de cristal',
    },
    'report-ziwei': { name: 'Relatório ZiWei aprofundado', desc: 'Doze palácios · Perspectiva anual' },
    'report-ziwei-basic': { name: 'Leitura ZiWei aprofundada', desc: 'Relatório AI do mapa' },
    'report-ziwei-advanced': {
      name: 'Relatório ZiWei + pulseira de energia',
      desc: 'Leitura profunda + cristal dos cinco elementos',
    },
    'report-ziwei-premium': {
      name: 'Kit ZiWei de energia definitivo',
      desc: 'Relatório completo + caixa de cristal',
    },
    'ziwei-chat-pack-10': {
      name: 'Pacote extra de chat ZiWei',
      desc: '10 turnos extras de conversa OraSage',
    },
    'ziwei-chat-yearly': {
      name: 'Passe anual de chat ZiWei',
      desc: '365 dias de chat OraSage ilimitado',
    },
    'report-tarot': { name: 'Leitura de Tarô aprofundada', desc: 'Detalhe da tiragem · Orientação' },
    'tarot-destiny-slice': {
      name: 'Fatia do Destino',
      desc: 'Tire cartas em uma encruzilhada · desbloqueio único',
    },
    'service-consult': {
      name: 'Consulta de energia 30 min',
      desc: 'Perguntas e respostas online um a um',
    },
    'temple-donation': {
      name: 'Doação de bênção',
      desc: 'Apoie sistemas e hardware do templo ($0.01–$1 à escolha)',
    },
  },
};

export function localizeFallbackProducts(products: Product[], locale: string): Product[] {
  const loc = normalize(locale);
  if (loc === 'zh-CN') return products;
  const map = CRYSTAL_FALLBACK_I18N[loc];
  return products.map((p) => {
    const fields = map[p.sku];
    if (!fields) return p;
    return {
      ...p,
      name: fields.name,
      desc: fields.desc,
      packaging: fields.packaging ?? p.packaging,
    };
  });
}
