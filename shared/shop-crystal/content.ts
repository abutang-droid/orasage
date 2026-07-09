/** 水晶专题素材内容（v1 占位填充，运营后台可维护） */

export type CrystalContentEntry = {
  /** 情感短语，如「生长之境」 */
  tagline: string;
  /** 能量故事（1–2 段） */
  story: string;
  /** 能量关键词（chips 展示） */
  keywords: string[];
  /** 佩戴收益 bullets */
  benefits: string[];
  /** 佩戴仪式 / 场景一句话 */
  ritual: string;
  /** SKU 切换下方补充说明（选填，后台不配则前台不展示） */
  packNote: string;
};

export type CrystalContentMap = Record<string, CrystalContentEntry>;

export const DEFAULT_CRYSTAL_CONTENT: CrystalContentMap = {
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
};

export function mergeCrystalContent(
  saved: Partial<CrystalContentMap> | null | undefined,
): CrystalContentMap {
  const merged: CrystalContentMap = {};
  for (const [sku, defaults] of Object.entries(DEFAULT_CRYSTAL_CONTENT)) {
    const entry = saved?.[sku];
    merged[sku] = {
      tagline: entry?.tagline?.trim() || defaults.tagline,
      story: entry?.story?.trim() || defaults.story,
      keywords: entry?.keywords?.length ? entry.keywords : defaults.keywords,
      benefits: entry?.benefits?.length ? entry.benefits : defaults.benefits,
      ritual: entry?.ritual?.trim() || defaults.ritual,
      packNote: entry?.packNote?.trim() ?? '',
    };
  }
  return merged;
}
