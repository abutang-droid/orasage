/** R3 naming layer — crystal SKU titles and taglines (zh / en / pt-BR). */

export const CRYSTAL_BASE_SKUS = [
  'crystal-wood',
  'crystal-fire',
  'crystal-earth',
  'crystal-metal',
  'crystal-water',
] as const;

export type CrystalBaseSku = (typeof CRYSTAL_BASE_SKUS)[number];

export type CrystalLocale = 'zh-CN' | 'en' | 'pt-BR';

export type CrystalNaming = {
  name: Record<CrystalLocale, string>;
  tagline: Record<CrystalLocale, string>;
  seoTitle: Record<CrystalLocale, string>;
  seoDescription: Record<CrystalLocale, string>;
  subtitleZh: string;
};

export const CRYSTAL_NAMING: Record<CrystalBaseSku, CrystalNaming> = {
  'crystal-wood': {
    name: {
      'zh-CN': '生长之境 · 绿幽灵手串',
      en: 'Realm of Growth · Green Phantom Quartz Bracelet',
      'pt-BR': 'Reino do Crescimento · Pulseira de Quartzo Fantasma Verde',
    },
    tagline: {
      'zh-CN': '五行属木 · 生发之象 · 生长提醒',
      en: 'Wood Element · Symbol of Becoming · Growth Reminder',
      'pt-BR': 'Elemento Madeira · Símbolo do Devir · Lembrete de Crescimento',
    },
    seoTitle: {
      'zh-CN': '生长之境 · 绿幽灵手串 · OraSage Crystal Shop',
      en: 'Realm of Growth · Green Phantom Quartz Bracelet · OraSage Crystal Shop',
      'pt-BR': 'Reino do Crescimento · Pulseira de Quartzo Fantasma Verde · OraSage Crystal Shop',
    },
    seoDescription: {
      'zh-CN':
        "生长之境 · 绿幽灵手串：8mm 绿幽灵圆珠，蜡线手工打结，15-18cm 可调手围。OraSage 设计师手作，五行属木，作为'生长'的日常提醒。文化意象，非疗效承诺。",
      en: 'Realm of Growth · Green Phantom Quartz Bracelet: 8mm beads, hand-knotted waxed cord, 15–18cm adjustable. A daily growth reminder. Cultural symbol, not a health claim.',
      'pt-BR':
        'Reino do Crescimento · Pulseira de Quartzo Fantasma Verde: contas de 8mm, cordão encerado, 15–18cm ajustável. Lembrete cotidiano de crescimento. Símbolo cultural, não uma promessa terapêutica.',
    },
    subtitleZh: '戴上，听见生发的信号。',
  },
  'crystal-fire': {
    name: {
      'zh-CN': '焰心觉醒 · 红玛瑙手串',
      en: 'Awakening of the Inner Flame · Red Agate Bracelet',
      'pt-BR': 'Despertar da Chama Interior · Pulseira de Ágata Vermelha',
    },
    tagline: {
      'zh-CN': '五行属火 · 温煦之象 · 行动提醒',
      en: 'Fire Element · Symbol of Warmth · Action Reminder',
      'pt-BR': 'Elemento Fogo · Símbolo do Calor · Lembrete de Ação',
    },
    seoTitle: {
      'zh-CN': '焰心觉醒 · 红玛瑙手串 · OraSage Crystal Shop',
      en: 'Awakening of the Inner Flame · Red Agate Bracelet · OraSage Crystal Shop',
      'pt-BR': 'Despertar da Chama Interior · Pulseira de Ágata Vermelha · OraSage Crystal Shop',
    },
    seoDescription: {
      'zh-CN':
        "焰心觉醒 · 红玛瑙手串：8mm 红玛瑙圆珠，蜡线手工打结，15-18cm 可调手围。OraSage 设计师手作，五行属火，作为'行动'的日常提醒。文化意象，非疗效承诺。",
      en: 'Awakening of the Inner Flame · Red Agate Bracelet: 8mm beads, hand-knotted waxed cord, 15–18cm adjustable. A daily action reminder. Cultural symbol, not a health claim.',
      'pt-BR':
        'Despertar da Chama Interior · Pulseira de Ágata Vermelha: contas de 8mm, cordão encerado, 15–18cm ajustável. Lembrete cotidiano de ação. Símbolo cultural, não uma promessa terapêutica.',
    },
    subtitleZh: '戴上，听见行动前的温煦。',
  },
  'crystal-earth': {
    name: {
      'zh-CN': '厚土之根 · 黄水晶手串',
      en: 'Roots of the Fertile Earth · Citrine Bracelet',
      'pt-BR': 'Raízes da Terra Fértil · Pulseira de Citrino',
    },
    tagline: {
      'zh-CN': '五行属土 · 承载之象 · 守成提醒',
      en: 'Earth Element · Symbol of Bearing · Steadfast Reminder',
      'pt-BR': 'Elemento Terra · Símbolo do Sustento · Lembrete de Constância',
    },
    seoTitle: {
      'zh-CN': '厚土之根 · 黄水晶手串 · OraSage Crystal Shop',
      en: 'Roots of the Fertile Earth · Citrine Bracelet · OraSage Crystal Shop',
      'pt-BR': 'Raízes da Terra Fértil · Pulseira de Citrino · OraSage Crystal Shop',
    },
    seoDescription: {
      'zh-CN':
        "厚土之根 · 黄水晶手串：8mm 黄水晶圆珠，蜡线手工打结，15-18cm 可调手围。OraSage 设计师手作，五行属土，作为'守成'的日常提醒。文化意象，非疗效承诺。",
      en: 'Roots of the Fertile Earth · Citrine Bracelet: 8mm beads, hand-knotted waxed cord, 15–18cm adjustable. A daily steadfast reminder. Cultural symbol, not a health claim.',
      'pt-BR':
        'Raízes da Terra Fértil · Pulseira de Citrino: contas de 8mm, cordão encerado, 15–18cm ajustável. Lembrete cotidiano de constância. Símbolo cultural, não uma promessa terapêutica.',
    },
    subtitleZh: '戴上，承接一段长久的守成。',
  },
  'crystal-metal': {
    name: {
      'zh-CN': '澄明之境 · 白水晶手串',
      en: 'Realm of Clarity – Clear Quartz Bracelet',
      'pt-BR': 'Reino da Clareza · Pulseira de Quartzo Incolor',
    },
    tagline: {
      'zh-CN': '五行属金 · 收敛之象 · 静定提醒',
      en: 'Metal Element · Symbol of Refinement · Stillness Reminder',
      'pt-BR': 'Elemento Metal · Símbolo do Refinamento · Lembrete de Quietude',
    },
    seoTitle: {
      'zh-CN': '澄明之境 · 白水晶手串 · OraSage Crystal Shop',
      en: 'Realm of Clarity – Clear Quartz Bracelet · OraSage Crystal Shop',
      'pt-BR': 'Reino da Clareza · Pulseira de Quartzo Incolor · OraSage Crystal Shop',
    },
    seoDescription: {
      'zh-CN':
        "澄明之境 · 白水晶手串：8mm 白水晶圆珠，蜡线手工打结，15-18cm 可调手围。OraSage 设计师手作，五行属金，作为'静定'的日常提醒。文化意象，非疗效承诺。",
      en: 'Realm of Clarity – Clear Quartz Bracelet: 8mm beads, hand-knotted waxed cord, 15–18cm adjustable. A daily stillness reminder. Cultural symbol, not a health claim.',
      'pt-BR':
        'Reino da Clareza · Pulseira de Quartzo Incolor: contas de 8mm, cordão encerado, 15–18cm ajustável. Lembrete cotidiano de quietude. Símbolo cultural, não uma promessa terapêutica.',
    },
    subtitleZh: '戴上，把喧嚣收敛为静定。',
  },
  'crystal-water': {
    name: {
      'zh-CN': '深海静盾 · 黑曜石手串',
      en: 'Deep-Sea Silent Shield · Obsidian Bracelet',
      'pt-BR': 'Escudo Silencioso do Mar Profundo · Pulseira de Obsidiana',
    },
    tagline: {
      'zh-CN': '五行属水 · 润下之象 · 边界提醒',
      en: 'Water Element · Symbol of Flow · Boundary Reminder',
      'pt-BR': 'Elemento Água · Símbolo do Fluxo · Lembrete de Limite',
    },
    seoTitle: {
      'zh-CN': '深海静盾 · 黑曜石手串 · OraSage Crystal Shop',
      en: 'Deep-Sea Silent Shield · Obsidian Bracelet · OraSage Crystal Shop',
      'pt-BR': 'Escudo Silencioso do Mar Profundo · Pulseira de Obsidiana · OraSage Crystal Shop',
    },
    seoDescription: {
      'zh-CN':
        "深海静盾 · 黑曜石手串：8mm 黑曜石圆珠，蜡线手工打结，15-18cm 可调手围。OraSage 设计师手作，五行属水，作为'边界'的日常提醒。文化意象，非疗效承诺。",
      en: 'Deep-Sea Silent Shield · Obsidian Bracelet: 8mm beads, hand-knotted waxed cord, 15–18cm adjustable. A daily boundary reminder. Cultural symbol, not a health claim.',
      'pt-BR':
        'Escudo Silencioso do Mar Profundo · Pulseira de Obsidiana: contas de 8mm, cordão encerado, 15–18cm ajustável. Lembrete cotidiano de limite. Símbolo cultural, não uma promessa terapêutica.',
    },
    subtitleZh: '戴上，在深与浅之间划一条边界。',
  },
};

const GIFT_SUFFIX: Record<CrystalLocale, string> = {
  'zh-CN': ' · 礼盒装',
  en: ' · Gift Box',
  'pt-BR': ' · Caixa de Presente',
};

const GIFT_TAGLINE_SUFFIX: Record<CrystalLocale, string> = {
  'zh-CN': ' · 赠礼专属包装',
  en: ' · Exclusive Gift Packaging',
  'pt-BR': ' · Embalagem de Presente Exclusiva',
};

export function isCrystalBaseSku(sku: string): sku is CrystalBaseSku {
  return (CRYSTAL_BASE_SKUS as readonly string[]).includes(sku);
}

export function crystalBaseSku(sku: string): CrystalBaseSku | null {
  const base = sku.endsWith('-gift') ? sku.slice(0, -'-gift'.length) : sku;
  return isCrystalBaseSku(base) ? base : null;
}

export function crystalName(sku: string, locale: CrystalLocale = 'zh-CN'): string | null {
  const base = crystalBaseSku(sku);
  if (!base) return null;
  const name = CRYSTAL_NAMING[base].name[locale];
  return sku.endsWith('-gift') ? `${name}${GIFT_SUFFIX[locale]}` : name;
}

export function crystalTagline(sku: string, locale: CrystalLocale = 'zh-CN'): string | null {
  const base = crystalBaseSku(sku);
  if (!base) return null;
  const tagline = CRYSTAL_NAMING[base].tagline[locale];
  return sku.endsWith('-gift') ? `${tagline}${GIFT_TAGLINE_SUFFIX[locale]}` : tagline;
}
