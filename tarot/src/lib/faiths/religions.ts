/**
 * World religions ranked by approximate global adherents (Pew/Britannica 2015–2020).
 * Top 10 shown by default; remainder under "更多".
 */
export type FaithOption = {
  id: string;
  nameZh: string;
  nameEn: string;
  emoji: string;
  /** Approximate adherents worldwide (millions) */
  adherentsM: number;
  rank: number;
};

export const WORLD_FAITHS: FaithOption[] = [
  { id: 'christianity', nameZh: '基督教', nameEn: 'Christianity', emoji: '✝️', adherentsM: 2380, rank: 1 },
  { id: 'islam', nameZh: '伊斯兰教', nameEn: 'Islam', emoji: '☪️', adherentsM: 1910, rank: 2 },
  { id: 'hinduism', nameZh: '印度教', nameEn: 'Hinduism', emoji: '🕉️', adherentsM: 1160, rank: 3 },
  { id: 'buddhism', nameZh: '佛教', nameEn: 'Buddhism', emoji: '☸️', adherentsM: 507, rank: 4 },
  { id: 'chinese_folk', nameZh: '中国民间信仰', nameEn: 'Chinese Folk Religion', emoji: '🏮', adherentsM: 394, rank: 5 },
  { id: 'african_traditional', nameZh: '非洲传统宗教', nameEn: 'African Traditional Religions', emoji: '🌍', adherentsM: 100, rank: 6 },
  { id: 'sikhism', nameZh: '锡克教', nameEn: 'Sikhism', emoji: '☬', adherentsM: 26, rank: 7 },
  { id: 'spiritism', nameZh: '灵性主义', nameEn: 'Spiritism', emoji: '👁️', adherentsM: 15, rank: 8 },
  { id: 'judaism', nameZh: '犹太教', nameEn: 'Judaism', emoji: '✡️', adherentsM: 15, rank: 9 },
  { id: 'taoism', nameZh: '道教', nameEn: 'Taoism', emoji: '☯️', adherentsM: 12, rank: 10 },
  { id: 'shinto', nameZh: '神道教', nameEn: 'Shinto', emoji: '⛩️', adherentsM: 4, rank: 11 },
  { id: 'bahai', nameZh: '巴哈伊教', nameEn: "Bahá'í Faith", emoji: '⭐', adherentsM: 8, rank: 12 },
  { id: 'jainism', nameZh: '耆那教', nameEn: 'Jainism', emoji: '🙏', adherentsM: 5, rank: 13 },
  { id: 'zoroastrianism', nameZh: '琐罗亚斯德教', nameEn: 'Zoroastrianism', emoji: '🔥', adherentsM: 0.2, rank: 14 },
  { id: 'cao_dai', nameZh: '高台教', nameEn: 'Caodaism', emoji: '🌸', adherentsM: 4, rank: 15 },
  { id: 'confucianism', nameZh: '儒教', nameEn: 'Confucianism', emoji: '📜', adherentsM: 6, rank: 16 },
  { id: 'korean_shamanism', nameZh: '韩国巫教', nameEn: 'Korean Shamanism', emoji: '🎭', adherentsM: 5, rank: 17 },
  { id: 'indigenous', nameZh: '原住民信仰', nameEn: 'Indigenous Religions', emoji: '🦅', adherentsM: 300, rank: 18 },
  { id: 'afro_brazilian', nameZh: '非裔巴西宗教', nameEn: 'Afro-Brazilian Religions', emoji: '🌊', adherentsM: 2, rank: 19 },
  { id: 'tenrikyo', nameZh: '天理教', nameEn: 'Tenrikyo', emoji: '🌅', adherentsM: 2, rank: 20 },
  { id: 'none', nameZh: '无特定信仰', nameEn: 'No Specific Faith', emoji: '🌿', adherentsM: 0, rank: 98 },
  { id: 'other', nameZh: '自定义', nameEn: '不在列表中？自行填写', emoji: '✍️', adherentsM: 0, rank: 99 },
].sort((a, b) => a.rank - b.rank);

export const CUSTOM_FAITH_ID = 'other';
/** 用户主动跳过信仰选择（无信仰 / 暂不选择） */
export const SKIP_FAITH_ID = 'none';
export const SPECIAL_FAITH_IDS = new Set(['none', 'other']);

export const TOP_FAITH_COUNT = 10;

const faithById = new Map(WORLD_FAITHS.map((f) => [f.id, f]));

export function getTopFaiths(): FaithOption[] {
  return WORLD_FAITHS.filter((f) => f.rank <= TOP_FAITH_COUNT);
}

export function getMoreFaiths(): FaithOption[] {
  return WORLD_FAITHS.filter((f) => f.rank > TOP_FAITH_COUNT && f.rank < 98);
}

export function getCustomFaithOption(list?: FaithOption[]): FaithOption {
  const found = list?.find((f) => f.id === CUSTOM_FAITH_ID) ?? faithById.get(CUSTOM_FAITH_ID);
  return (
    found ?? {
      id: CUSTOM_FAITH_ID,
      nameZh: '自定义',
      nameEn: '不在列表中？自行填写',
      emoji: '✍️',
      adherentsM: 0,
      rank: 99,
    }
  );
}

export function isCustomFaithId(id: string | null | undefined): boolean {
  return id === CUSTOM_FAITH_ID || Boolean(id?.startsWith('other:'));
}

export function isSkippedFaith(id: string | null | undefined): boolean {
  return id === SKIP_FAITH_ID;
}

export function customFaithDisplayName(id: string): string {
  if (id.startsWith('other:')) return id.slice(6).trim() || '自定义';
  return '自定义';
}

export function getFaithById(id: string, list?: FaithOption[]): FaithOption | undefined {
  if (id.startsWith('other:')) {
    const base = list?.find((f) => f.id === 'other') ?? faithById.get('other');
    if (!base) return undefined;
    return { ...base, id, nameZh: customFaithDisplayName(id), nameEn: 'Custom' };
  }
  if (list) {
    const found = list.find((f) => f.id === id);
    if (found) return found;
  }
  return faithById.get(id);
}

export function formatFaithLabel(
  id: string | null | undefined,
  list?: FaithOption[],
  lang: 'zh' | 'en' | 'pt' | 'es' = 'zh',
): string {
  if (!id) return '';
  const faith = getFaithById(id, list);
  if (!faith) return id;
  return lang === 'zh' ? faith.nameZh : faith.nameEn || faith.nameZh;
}

export const FAITH_STORAGE_KEY = 'manto:faith';
