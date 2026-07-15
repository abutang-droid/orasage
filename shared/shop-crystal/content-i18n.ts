/** Locale maps for crystal showcase copy — faithful translations of DEFAULT_CRYSTAL_CONTENT. */

import type { CrystalContentMap } from './content';

export type CrystalContentLocale = 'zh-CN' | 'zh-TW' | 'en' | 'pt-BR';

export function normalizeCrystalLocale(locale: string | null | undefined): CrystalContentLocale {
  if (locale === 'zh-TW' || locale === 'en' || locale === 'pt-BR') return locale;
  return 'zh-CN';
}

/** Element glyph / short label used in tabs (cultural symbols kept for CJK; Latin names for en/pt). */
export const CRYSTAL_ELEMENT_LABELS: Record<
  CrystalContentLocale,
  Record<string, string>
> = {
  'zh-CN': {
    'crystal-wood': '木',
    'crystal-fire': '火',
    'crystal-earth': '土',
    'crystal-metal': '金',
    'crystal-water': '水',
  },
  'zh-TW': {
    'crystal-wood': '木',
    'crystal-fire': '火',
    'crystal-earth': '土',
    'crystal-metal': '金',
    'crystal-water': '水',
  },
  en: {
    'crystal-wood': 'Wood',
    'crystal-fire': 'Fire',
    'crystal-earth': 'Earth',
    'crystal-metal': 'Metal',
    'crystal-water': 'Water',
  },
  'pt-BR': {
    'crystal-wood': 'Madeira',
    'crystal-fire': 'Fogo',
    'crystal-earth': 'Terra',
    'crystal-metal': 'Metal',
    'crystal-water': 'Água',
  },
};

export const CRYSTAL_CONTENT_BY_LOCALE: Record<CrystalContentLocale, CrystalContentMap> = {
  'zh-CN': {
    'crystal-wood': {
      tagline: '生长之境',
      story:
        '绿幽灵在千万年的地质流转中，将矿物尘埃封存进透亮晶体，如同一座微缩的森林。它属木，主生长与拓展——当你正在开启新事业、新阶段，它提醒你像树一样扎根、伸展、向光而行。',
      keywords: ['招财', '事业', '生机', '拓展'],
      benefits: [
        '开启新阶段时稳定心神，聚焦目标',
        '辅助财富与事业能量的正向流动',
        '象征生长，适合长期佩戴养护',
      ],
      ritual: '晨间通勤佩戴于左手，工作时置于案头左上角，助生长之气流通。',
      packNote: '',
    },
    'crystal-fire': {
      tagline: '焰心觉醒',
      story:
        '红玛瑙的层层纹理，是大地岩浆冷却时留下的火焰印记。它属火，主行动与勇气——当你犹豫不前、动力不足，它像一簇稳定燃烧的心火，推动你把想法变成行动。',
      keywords: ['活力', '勇气', '行动', '热情'],
      benefits: [
        '提振精神状态，驱散倦怠与拖延',
        '强化表达与行动力，适合关键时刻佩戴',
        '暖色系能量，冬季与低潮期尤宜',
      ],
      ritual: '重要会议或表达场合前佩戴于右手，深呼吸三次，点燃心火。',
      packNote: '',
    },
    'crystal-earth': {
      tagline: '厚土之根',
      story:
        '黄水晶通体温润的暖黄，是阳光沉淀进大地的颜色。它属土，主稳定与承载——当外界变动频繁、内心摇摆，它像厚实的土地，让你重新找到重心，守住已有的成果。',
      keywords: ['稳定', '聚财', '守成', '安定'],
      benefits: [
        '安定情绪，缓解焦虑与漂浮感',
        '传统聚财之石，守护既有财富',
        '适合变动期、搬迁、职位调整时佩戴',
      ],
      ritual: '睡前置于枕边或床头柜，晨起佩戴，让一天从安定开始。',
      packNote: '',
    },
    'crystal-metal': {
      tagline: '澄明之境',
      story:
        '白水晶是水晶家族中最纯粹的存在，无色透亮，包容一切光谱。它属金，主净化与秩序——当思绪混乱、能量驳杂，它像一面澄澈的镜子，帮你过滤噪音，回到清晰。',
      keywords: ['净化', '澄明', '专注', '秩序'],
      benefits: [
        '净化负面能量，重置身心状态',
        '提升专注与思维清晰度',
        '百搭基础款，可与任意元素叠戴',
      ],
      ritual: '每周日用清水轻拭，置于月光下静置一夜，恢复通透。',
      packNote: '',
    },
    'crystal-water': {
      tagline: '深海静盾',
      story:
        '黑曜石诞生于火山熔岩急速冷却的一瞬，通体如深夜海面。它属水，主防护与边界——当你身处高压环境、人际消耗，它像一面沉静的盾牌，替你挡下不属于你的情绪。',
      keywords: ['辟邪', '防护', '边界', '沉静'],
      benefits: [
        '吸收负面能量，建立心理边界',
        '高压工作与复杂环境的随身防护',
        '助眠安神，缓解思虑过度',
      ],
      ritual: '外出应酬或高压场合佩戴于左手，归家后取下置于玄关，隔断外界能量。',
      packNote: '',
    },
  },
  'zh-TW': {
    'crystal-wood': {
      tagline: '生長之境',
      story:
        '綠幽靈在千萬年的地質流轉中，將礦物塵埃封存進透亮晶體，如同一座微縮的森林。它屬木，主生長與拓展——當你正在開啟新事業、新階段，它提醒你像樹一樣扎根、伸展、向光而行。',
      keywords: ['招財', '事業', '生機', '拓展'],
      benefits: [
        '開啟新階段時穩定心神，聚焦目標',
        '輔助財富與事業能量的正向流動',
        '象徵生長，適合長期佩戴養護',
      ],
      ritual: '晨間通勤佩戴於左手，工作時置於案頭左上角，助生長之氣流通。',
      packNote: '',
    },
    'crystal-fire': {
      tagline: '焰心覺醒',
      story:
        '紅瑪瑙的層層紋理，是大地岩漿冷卻時留下的火焰印記。它屬火，主行動與勇氣——當你猶豫不前、動力不足，它像一簇穩定燃燒的心火，推動你把想法變成行動。',
      keywords: ['活力', '勇氣', '行動', '熱情'],
      benefits: [
        '提振精神狀態，驅散倦怠與拖延',
        '強化表達與行動力，適合關鍵時刻佩戴',
        '暖色系能量，冬季與低潮期尤宜',
      ],
      ritual: '重要會議或表達場合前佩戴於右手，深呼吸三次，點燃心火。',
      packNote: '',
    },
    'crystal-earth': {
      tagline: '厚土之根',
      story:
        '黃水晶通體溫潤的暖黃，是陽光沉澱進大地的顏色。它屬土，主穩定與承載——當外界變動頻繁、內心搖擺，它像厚實的土地，讓你重新找到重心，守住已有的成果。',
      keywords: ['穩定', '聚財', '守成', '安定'],
      benefits: [
        '安定情緒，緩解焦慮與漂浮感',
        '傳統聚財之石，守護既有財富',
        '適合變動期、搬遷、職位調整時佩戴',
      ],
      ritual: '睡前置於枕邊或床頭櫃，晨起佩戴，讓一天從安定開始。',
      packNote: '',
    },
    'crystal-metal': {
      tagline: '澄明之境',
      story:
        '白水晶是水晶家族中最純粹的存在，無色透亮，包容一切光譜。它屬金，主淨化與秩序——當思緒混亂、能量駁雜，它像一面澄澈的鏡子，幫你過濾噪音，回到清晰。',
      keywords: ['淨化', '澄明', '專注', '秩序'],
      benefits: [
        '淨化負面能量，重置身心狀態',
        '提升專注與思維清晰度',
        '百搭基礎款，可與任意元素疊戴',
      ],
      ritual: '每週日用清水輕拭，置於月光下靜置一夜，恢復通透。',
      packNote: '',
    },
    'crystal-water': {
      tagline: '深海靜盾',
      story:
        '黑曜石誕生於火山熔岩急速冷卻的一瞬，通體如深夜海面。它屬水，主防護與邊界——當你身處高壓環境、人際消耗，它像一面沉靜的盾牌，替你擋下不屬於你的情緒。',
      keywords: ['辟邪', '防護', '邊界', '沉靜'],
      benefits: [
        '吸收負面能量，建立心理邊界',
        '高壓工作與複雜環境的隨身防護',
        '助眠安神，緩解思慮過度',
      ],
      ritual: '外出應酬或高壓場合佩戴於左手，歸家後取下置於玄關，隔斷外界能量。',
      packNote: '',
    },
  },
  en: {
    'crystal-wood': {
      tagline: 'Realm of Growth',
      story:
        'Over ages of geological change, green phantom quartz sealed mineral dust into clear crystal — a forest in miniature. It belongs to Wood: growth and expansion. When you begin a new venture or chapter, it reminds you to root, stretch, and grow toward the light.',
      keywords: ['Prosperity', 'Career', 'Vitality', 'Expansion'],
      benefits: [
        'Steady focus when starting a new chapter',
        'Support positive flow of wealth and career energy',
        'A symbol of growth suited to long-term wear',
      ],
      ritual: 'Wear on the left hand for the morning commute; place at the upper left of your desk while working to keep growth energy circulating.',
      packNote: '',
    },
    'crystal-fire': {
      tagline: 'Awakened Flame',
      story:
        'The layered bands of red agate are fire marks left as magma cooled. It belongs to Fire: action and courage. When you hesitate or lack drive, it is a steady heart-flame that pushes ideas into motion.',
      keywords: ['Vitality', 'Courage', 'Action', 'Passion'],
      benefits: [
        'Lift energy and ease fatigue or delay',
        'Strengthen expression and action at key moments',
        'Warm-toned energy especially fitting in winter or low periods',
      ],
      ritual: 'Before an important meeting or talk, wear on the right hand, take three deep breaths, and kindle the heart-flame.',
      packNote: '',
    },
    'crystal-earth': {
      tagline: 'Root of Earth',
      story:
        'Citrine’s warm yellow is sunlight settled into the ground. It belongs to Earth: stability and holding. When the world shifts and you feel unsteady, it is solid ground that helps you find your center and keep what you have built.',
      keywords: ['Stability', 'Gathering', 'Stewardship', 'Calm'],
      benefits: [
        'Settle emotions and ease anxiety or drift',
        'A traditional stone of gathering, guarding what you hold',
        'Well suited in times of change, moves, or role shifts',
      ],
      ritual: 'Place by the pillow or nightstand before sleep; wear on rising so the day begins from calm.',
      packNote: '',
    },
    'crystal-metal': {
      tagline: 'Clear Mirror',
      story:
        'Clear quartz is among the purest in the crystal family — colorless, open to every spectrum. It belongs to Metal: purification and order. When thoughts tangle and energy feels mixed, it is a clear mirror that filters noise so you return to clarity.',
      keywords: ['Purify', 'Clarity', 'Focus', 'Order'],
      benefits: [
        'Clear negative charge and reset body and mind',
        'Sharpen focus and mental clarity',
        'A versatile base piece that layers with any element',
      ],
      ritual: 'Each Sunday, rinse lightly with clean water and rest overnight under moonlight to restore clarity.',
      packNote: '',
    },
    'crystal-water': {
      tagline: 'Deep-Sea Shield',
      story:
        'Obsidian forms in the instant lava cools — dark as a night sea. It belongs to Water: protection and boundaries. In high-pressure settings or draining relationships, it is a quiet shield that holds back emotions that are not yours.',
      keywords: ['Protection', 'Shield', 'Boundary', 'Stillness'],
      benefits: [
        'Absorb negative charge and set psychological boundaries',
        'Everyday protection in intense work or complex spaces',
        'Support restful sleep and ease overthinking',
      ],
      ritual: 'Wear on the left hand for social or high-pressure moments; remove at the entryway when you return home to separate outside energy.',
      packNote: '',
    },
  },
  'pt-BR': {
    'crystal-wood': {
      tagline: 'Reino do Crescimento',
      story:
        'Ao longo de eras geológicas, o quartzo fantasma verde selou poeira mineral em cristal límpido — uma floresta em miniatura. Pertence à Madeira: crescimento e expansão. Ao iniciar um novo projeto ou ciclo, lembra você a enraizar, estender e crescer em direção à luz.',
      keywords: ['Prosperidade', 'Carreira', 'Vitalidade', 'Expansão'],
      benefits: [
        'Estabiliza o foco ao abrir um novo ciclo',
        'Apoia o fluxo positivo de energia de riqueza e carreira',
        'Símbolo de crescimento adequado ao uso contínuo',
      ],
      ritual: 'Use na mão esquerda no trajeto matinal; no trabalho, deixe no canto superior esquerdo da mesa para circular a energia de crescimento.',
      packNote: '',
    },
    'crystal-fire': {
      tagline: 'Chama Despertada',
      story:
        'As faixas da ágata vermelha são marcas de fogo deixadas quando o magma esfriou. Pertence ao Fogo: ação e coragem. Quando você hesita ou falta impulso, é uma chama estável no peito que transforma ideia em movimento.',
      keywords: ['Vitalidade', 'Coragem', 'Ação', 'Paixão'],
      benefits: [
        'Eleva o ânimo e alivia cansaço ou procrastinação',
        'Reforça expressão e ação em momentos-chave',
        'Energia de tom quente, especialmente no inverno ou em fases baixas',
      ],
      ritual: 'Antes de uma reunião ou fala importante, use na mão direita, respire fundo três vezes e acenda a chama do peito.',
      packNote: '',
    },
    'crystal-earth': {
      tagline: 'Raiz da Terra',
      story:
        'O amarelo cálido da citrina é luz do sol assentada na terra. Pertence à Terra: estabilidade e sustentação. Quando o exterior muda e você oscila, é solo firme que devolve o centro e guarda o que você construiu.',
      keywords: ['Estabilidade', 'Reunião', 'Custódia', 'Calma'],
      benefits: [
        'Acalma emoções e alivia ansiedade ou sensação de deriva',
        'Pedra tradicional de reunião, que guarda o que você já tem',
        'Adequada em mudanças, mudanças de casa ou de função',
      ],
      ritual: 'Antes de dormir, deixe ao lado do travesseiro ou criado-mudo; ao acordar, use para começar o dia em calma.',
      packNote: '',
    },
    'crystal-metal': {
      tagline: 'Espelho Claro',
      story:
        'O quartzo cristalino está entre os mais puros da família — incolor, aberto a todo o espectro. Pertence ao Metal: purificação e ordem. Quando os pensamentos se misturam e a energia fica turva, é um espelho límpido que filtra o ruído e devolve clareza.',
      keywords: ['Purificar', 'Clareza', 'Foco', 'Ordem'],
      benefits: [
        'Limpa carga negativa e reinicia corpo e mente',
        'Aumenta foco e nitidez mental',
        'Peça base versátil que combina com qualquer elemento',
      ],
      ritual: 'Todo domingo, enxágue de leve com água limpa e deixe sob a luz da lua por uma noite para recuperar a transparência.',
      packNote: '',
    },
    'crystal-water': {
      tagline: 'Escudo do Mar Profundo',
      story:
        'A obsidiana nasce no instante em que a lava esfria — escura como o mar à noite. Pertence à Água: proteção e limites. Em ambientes de alta pressão ou relações que drenam, é um escudo sereno que segura emoções que não são suas.',
      keywords: ['Proteção', 'Escudo', 'Limite', 'Quietude'],
      benefits: [
        'Absorve carga negativa e cria limites psicológicos',
        'Proteção cotidiana em trabalho intenso ou espaços complexos',
        'Apoia o sono e alivia o excesso de pensamento',
      ],
      ritual: 'Use na mão esquerda em compromissos ou pressão; ao voltar, tire e deixe na entrada para separar a energia de fora.',
      packNote: '',
    },
  },
};
