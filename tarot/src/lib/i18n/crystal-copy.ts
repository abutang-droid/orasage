import { useMemo } from 'react';
import type { Lang } from './context';
import { useLang } from './context';
import type { LangMap } from './ui-strings';
import { pick } from './ui-strings';

export type WuxingSku = '木' | '火' | '土' | '金' | '水';

type CrystalCopy = {
  name: LangMap;
  nameEN: string;
  emoji: string;
  wuxing: WuxingSku;
  color: string;
  domains: LangMap[];
  desc: LangMap;
  story: LangMap;
  storyAuthor: string;
};

const CRYSTALS: Record<WuxingSku, CrystalCopy> = {
  木: {
    name: {
      zh: '绿幽灵',
      en: 'Green Phantom Quartz',
      pt: 'Quartzo Fantasma Verde',
      es: 'Cuarzo Fantasma Verde',
    },
    nameEN: 'Green Phantom Quartz',
    emoji: '🌿',
    wuxing: '木',
    color: '#5B8C5A',
    domains: [
      { zh: '生长', en: 'Growth', pt: 'Crescimento', es: 'Crecimiento' },
      { zh: '突破', en: 'Breakthrough', pt: 'Avanço', es: 'Avance' },
      { zh: '事业上升', en: 'Career rise', pt: 'Ascensão profissional', es: 'Ascenso profesional' },
    ],
    desc: {
      zh: '绿幽灵是事业与财富的催化剂。五行属木——木能生火，当你的权杖之火需要持续燃烧时，绿幽灵提供源源不断的生长能量。适合正在起步、转型、或渴望突破停滞的你。',
      en: 'Green phantom quartz fuels growth and abundance. Wood element feeds fire — when your inner flame needs fuel, this stone offers steady momentum. Ideal if you are starting out, pivoting, or breaking stagnation.',
      pt: 'O quartzo fantasma verde impulsiona crescimento e abundância. Madeira alimenta o fogo — quando sua chama precisa de combustível, esta pedra oferece impulso constante. Ideal para começos, transições ou romper estagnação.',
      es: 'El cuarzo fantasma verde impulsa crecimiento y abundancia. La madera alimenta el fuego — cuando tu llama interior necesita combustible, esta piedra ofrece impulso constante. Ideal para empezar, pivotar o romper el estancamiento.',
    },
    story: {
      zh: '戴上它去面试，拿到了offer。不知道是不是水晶的关系，但那天我特别敢说话。',
      en: 'I wore it to an interview and got the offer. Maybe it was the crystal — that day I spoke with real confidence.',
      pt: 'Usei no dia da entrevista e recebi a proposta. Talvez tenha sido o cristal — naquele dia falei com confiança.',
      es: 'Lo llevé a una entrevista y conseguí la oferta. Quizá fue el cristal — ese día hablé con mucha confianza.',
    },
    storyAuthor: '🇧🇷 Ana',
  },
  火: {
    name: {
      zh: '红玛瑙',
      en: 'Red Carnelian',
      pt: 'Cornalina Vermelha',
      es: 'Cornalina Roja',
    },
    nameEN: 'Red Carnelian',
    emoji: '🔥',
    wuxing: '火',
    color: '#C45B4A',
    domains: [
      { zh: '热情', en: 'Passion', pt: 'Paixão', es: 'Pasión' },
      { zh: '勇气', en: 'Courage', pt: 'Coragem', es: 'Valor' },
      { zh: '行动力', en: 'Action', pt: 'Ação', es: 'Acción' },
    ],
    desc: {
      zh: '红玛瑙点燃内在的火焰。五行属火——火能暖水，当圣杯之水寒冷淤滞时，红玛瑙带来温暖的流动。适合陷入情绪低潮或需要做出勇敢决定的你。',
      en: 'Red carnelian kindles your inner fire. Fire warms water — when emotions feel cold or stuck, carnelian brings warm flow. For low moods or moments that need brave choices.',
      pt: 'A cornalina acende seu fogo interior. O fogo aquece a água — quando as emoções estão frias ou presas, traz fluxo caloroso. Para baixas emocionais ou decisões corajosas.',
      es: 'La cornalina enciende tu fuego interior. El fuego calienta el agua — cuando las emociones están frías o atascadas, trae flujo cálido. Para bajones o decisiones valientes.',
    },
    story: {
      zh: '戴上它去面试，拿到了offer。不知道是不是水晶的关系，但那天我特别敢说话。',
      en: 'I wore it to an interview and got the offer. Maybe it was the crystal — that day I spoke with real confidence.',
      pt: 'Usei no dia da entrevista e recebi a proposta. Talvez tenha sido o cristal — naquele dia falei com confiança.',
      es: 'Lo llevé a una entrevista y conseguí la oferta. Quizá fue el cristal — ese día hablé con mucha confianza.',
    },
    storyAuthor: '🇧🇷 Ana',
  },
  土: {
    name: {
      zh: '黄水晶',
      en: 'Citrine',
      pt: 'Citrino',
      es: 'Citrino',
    },
    nameEN: 'Citrine',
    emoji: '⛰️',
    wuxing: '土',
    color: '#D4A853',
    domains: [
      { zh: '稳定', en: 'Stability', pt: 'Estabilidade', es: 'Estabilidad' },
      { zh: '财运', en: 'Prosperity', pt: 'Prosperidade', es: 'Prosperidad' },
      { zh: '贵人', en: 'Allies', pt: 'Aliados', es: 'Aliados' },
    ],
    desc: {
      zh: '黄水晶是丰盛与稳固的象征。五行属土——土承载万物，当命运的重牌出现时，黄水晶帮你站稳脚跟。适合正在迎接重大转变的你。',
      en: 'Citrine symbolizes abundance and grounding. Earth holds all things — when fate feels heavy, citrine helps you stand firm. For major life transitions.',
      pt: 'O citrino simboliza abundância e firmeza. A terra sustenta tudo — quando o destino pesa, o citrino ajuda você a se firmar. Para grandes transições.',
      es: 'El citrino simboliza abundancia y firmeza. La tierra sostiene todo — cuando el destino pesa, el citrino te ayuda a mantenerte firme. Para grandes transiciones.',
    },
    story: {
      zh: '戴上它去面试，拿到了offer。不知道是不是水晶的关系，但那天我特别敢说话。',
      en: 'I wore it to an interview and got the offer. Maybe it was the crystal — that day I spoke with real confidence.',
      pt: 'Usei no dia da entrevista e recebi a proposta. Talvez tenha sido o cristal — naquele dia falei com confiança.',
      es: 'Lo llevé a una entrevista y conseguí la oferta. Quizá fue el cristal — ese día hablé con mucha confianza.',
    },
    storyAuthor: '🇧🇷 Ana',
  },
  金: {
    name: {
      zh: '白水晶',
      en: 'Clear Quartz',
      pt: 'Quartzo Transparente',
      es: 'Cuarzo Transparente',
    },
    nameEN: 'Clear Quartz',
    emoji: '✨',
    wuxing: '金',
    color: '#E8E0D5',
    domains: [
      { zh: '净化', en: 'Clarity', pt: 'Clareza', es: 'Claridad' },
      { zh: '决断', en: 'Decision', pt: 'Decisão', es: 'Decisión' },
      { zh: '智慧', en: 'Wisdom', pt: 'Sabedoria', es: 'Sabiduría' },
    ],
    desc: {
      zh: '白水晶是净化与聚焦的明镜。五行属金——金能聚神，当思绪如宝剑四散时，白水晶帮你把注意力的光聚成一道。适合思绪纷乱、需要做出清晰判断的你。',
      en: 'Clear quartz is a mirror for focus and purification. Metal gathers the mind — when thoughts scatter like swords, quartz concentrates your light. For cluttered minds needing clear judgment.',
      pt: 'O quartzo transparente concentra e purifica. O metal reúne a mente — quando os pensamentos se dispersam, o quartzo concentra sua luz. Para mentes agitadas que precisam de clareza.',
      es: 'El cuarzo transparente concentra y purifica. El metal reúne la mente — cuando los pensamientos se dispersan, el cuarzo concentra tu luz. Para mentes agitadas que necesitan claridad.',
    },
    story: {
      zh: '戴上它去面试，拿到了offer。不知道是不是水晶的关系，但那天我特别敢说话。',
      en: 'I wore it to an interview and got the offer. Maybe it was the crystal — that day I spoke with real confidence.',
      pt: 'Usei no dia da entrevista e recebi a proposta. Talvez tenha sido o cristal — naquele dia falei com confiança.',
      es: 'Lo llevé a una entrevista y conseguí la oferta. Quizá fue el cristal — ese día hablé con mucha confianza.',
    },
    storyAuthor: '🇧🇷 Ana',
  },
  水: {
    name: {
      zh: '黑曜石',
      en: 'Black Obsidian',
      pt: 'Obsidiana Negra',
      es: 'Obsidiana Negra',
    },
    nameEN: 'Black Obsidian',
    emoji: '💧',
    wuxing: '水',
    color: '#3A3A3A',
    domains: [
      { zh: '保护', en: 'Protection', pt: 'Proteção', es: 'Protección' },
      { zh: '辟邪', en: 'Shielding', pt: 'Escudo', es: 'Escudo' },
      { zh: '内在平静', en: 'Inner calm', pt: 'Calma interior', es: 'Calma interior' },
    ],
    desc: {
      zh: '黑曜石是守护与平静的屏障。五行属水——水能以柔克刚，当牌面逆位增多时，黑曜石把外界暗涌挡在外面。适合逆流中需要保护的你。',
      en: 'Black obsidian is a barrier of protection and calm. Water yields yet overcomes — when reversals multiply, obsidian shields you from outer turbulence. For times that need guarding.',
      pt: 'A obsidiana negra protege e acalma. A água cede e vence — quando as reversões se multiplicam, a obsidiana bloqueia turbulências externas. Para momentos que pedem proteção.',
      es: 'La obsidiana negra protege y calma. El agua cede y vence — cuando las inversiones se multiplican, la obsidiana bloquea turbulencias externas. Para momentos que piden protección.',
    },
    story: {
      zh: '戴上它去面试，拿到了offer。不知道是不是水晶的关系，但那天我特别敢说话。',
      en: 'I wore it to an interview and got the offer. Maybe it was the crystal — that day I spoke with real confidence.',
      pt: 'Usei no dia da entrevista e recebi a proposta. Talvez tenha sido o cristal — naquele dia falei com confiança.',
      es: 'Lo llevé a una entrevista y conseguí la oferta. Quizá fue el cristal — ese día hablé con mucha confianza.',
    },
    storyAuthor: '🇧🇷 Ana',
  },
};

export const crystalUi = {
  listTitle: {
    zh: '五行补能手串',
    en: 'Five-element crystal bracelets',
    pt: 'Pulseiras de cristal dos cinco elementos',
    es: 'Pulseras de cristal de los cinco elementos',
  },
  listSubtitle: {
    zh: '📿 守护水晶',
    en: '📿 Guardian crystals',
    pt: '📿 Cristais guardiões',
    es: '📿 Cristales guardianes',
  },
  shopLink: {
    zh: '商城 →',
    en: 'Shop →',
    pt: 'Loja →',
    es: 'Tienda →',
  },
  backToShop: {
    zh: '← 返回商城',
    en: '← Back to shop',
    pt: '← Voltar à loja',
    es: '← Volver a la tienda',
  },
  beadSpec: {
    zh: '8mm × 23颗 · 弹力绳',
    en: '8mm × 23 beads · elastic cord',
    pt: '8mm × 23 contas · cordão elástico',
    es: '8mm × 23 cuentas · cordón elástico',
  },
  wuxingLabel: {
    zh: '五行属{element}',
    en: 'Element: {element}',
    pt: 'Elemento: {element}',
    es: 'Elemento: {element}',
  },
  rating: {
    zh: '(1,234 条评价)',
    en: '(1,234 reviews)',
    pt: '(1.234 avaliações)',
    es: '(1.234 reseñas)',
  },
  energyAttrs: {
    zh: '能量属性',
    en: 'Energy attributes',
    pt: 'Atributos energéticos',
    es: 'Atributos energéticos',
  },
  wearingStory: {
    zh: '佩戴故事',
    en: 'Wearing story',
    pt: 'História de uso',
    es: 'Historia de uso',
  },
  buyLoading: {
    zh: '正在跳转…',
    en: 'Redirecting…',
    pt: 'Redirecionando…',
    es: 'Redirigiendo…',
  },
  buy: {
    zh: '请一条 · {name}',
    en: 'Order one · {name}',
    pt: 'Pedir uma · {name}',
    es: 'Pedir una · {name}',
  },
  blessLink: {
    zh: '请守护神加持这条手串',
    en: 'Ask your patron to bless this bracelet',
    pt: 'Peça bênção do patrono para esta pulseira',
    es: 'Pide la bendición de tu patrón para esta pulsera',
  },
  wornBy: {
    zh: '已佩戴 2,341 人 · 配送 7-10 天（巴西）',
    en: 'Worn by 2,341 people · ships in 7–10 days (Brazil)',
    pt: 'Usado por 2.341 pessoas · entrega em 7–10 dias (Brasil)',
    es: 'Usado por 2.341 personas · envío en 7–10 días (Brasil)',
  },
  checkoutError: {
    zh: '结账失败',
    en: 'Checkout failed',
    pt: 'Falha no checkout',
    es: 'Error en el pago',
  },
  wuxingNames: {
    木: { zh: '木', en: 'Wood', pt: 'Madeira', es: 'Madera' },
    火: { zh: '火', en: 'Fire', pt: 'Fogo', es: 'Fuego' },
    土: { zh: '土', en: 'Earth', pt: 'Terra', es: 'Tierra' },
    金: { zh: '金', en: 'Metal', pt: 'Metal', es: 'Metal' },
    水: { zh: '水', en: 'Water', pt: 'Água', es: 'Agua' },
  } as const satisfies Record<WuxingSku, LangMap>,
} as const;

export type ResolvedCrystal = {
  sku: WuxingSku;
  name: string;
  nameEN: string;
  emoji: string;
  wuxing: WuxingSku;
  wuxingLabel: string;
  color: string;
  domains: string[];
  desc: string;
  story: string;
  storyAuthor: string;
};

function resolveCrystal(lang: Lang, sku: WuxingSku): ResolvedCrystal {
  const raw = CRYSTALS[sku] ?? CRYSTALS['金'];
  const p = (map: LangMap) => pick(map, lang);
  return {
    sku: raw.wuxing,
    name: p(raw.name),
    nameEN: raw.nameEN,
    emoji: raw.emoji,
    wuxing: raw.wuxing,
    wuxingLabel: p(crystalUi.wuxingNames[raw.wuxing]),
    color: raw.color,
    domains: raw.domains.map((d) => p(d)),
    desc: p(raw.desc),
    story: p(raw.story),
    storyAuthor: raw.storyAuthor,
  };
}

export function useCrystalCopy() {
  const { lang } = useLang();
  return useMemo(() => {
    const p = (map: LangMap) => pick(map, lang);
  const format = (template: string, vars: Record<string, string>) =>
    Object.entries(vars).reduce((acc, [k, v]) => acc.replaceAll(`{${k}}`, v), template);
    return {
      listTitle: p(crystalUi.listTitle),
      listSubtitle: p(crystalUi.listSubtitle),
      shopLink: p(crystalUi.shopLink),
      backToShop: p(crystalUi.backToShop),
      beadSpec: p(crystalUi.beadSpec),
      rating: p(crystalUi.rating),
      energyAttrs: p(crystalUi.energyAttrs),
      wearingStory: p(crystalUi.wearingStory),
      buyLoading: p(crystalUi.buyLoading),
      blessLink: p(crystalUi.blessLink),
      wornBy: p(crystalUi.wornBy),
      checkoutError: p(crystalUi.checkoutError),
      wuxingLabel: (element: string) => format(p(crystalUi.wuxingLabel), { element }),
      buy: (name: string) => format(p(crystalUi.buy), { name }),
      list: (['木', '火', '土', '金', '水'] as const).map((sku) => resolveCrystal(lang, sku)),
      get: (sku: string) => resolveCrystal(lang, (sku as WuxingSku) in CRYSTALS ? (sku as WuxingSku) : '金'),
    };
  }, [lang]);
}
