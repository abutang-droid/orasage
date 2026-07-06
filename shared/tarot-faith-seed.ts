/**
 * Seed data for CMS faiths + sanctuaries (synced with tarot/src/lib/faiths/*)
 */
import type { WorshipFacingMode } from './tarot-facing';

type SeedFaith = {
  code: string;
  nameZh: string;
  nameEn: string;
  emoji: string;
  rank: number;
  adherentsM: number;
  worshipFacing?: WorshipFacingMode;
};

export const SEED_FAITHS: SeedFaith[] = [
  { code: 'christianity', nameZh: '基督教', nameEn: 'Christianity', emoji: '✝️', rank: 1, adherentsM: 2380 },
  { code: 'islam', nameZh: '伊斯兰教', nameEn: 'Islam', emoji: '☪️', rank: 2, adherentsM: 1910, worshipFacing: 'qibla' },
  { code: 'hinduism', nameZh: '印度教', nameEn: 'Hinduism', emoji: '🕉️', rank: 3, adherentsM: 1160, worshipFacing: 'east' },
  { code: 'buddhism', nameZh: '佛教', nameEn: 'Buddhism', emoji: '☸️', rank: 4, adherentsM: 507, worshipFacing: 'east' },
  { code: 'chinese_folk', nameZh: '中国民间信仰', nameEn: 'Chinese Folk Religion', emoji: '🏮', rank: 5, adherentsM: 394, worshipFacing: 'east' },
  { code: 'african_traditional', nameZh: '非洲传统宗教', nameEn: 'African Traditional Religions', emoji: '🌍', rank: 6, adherentsM: 100 },
  { code: 'sikhism', nameZh: '锡克教', nameEn: 'Sikhism', emoji: '☬', rank: 7, adherentsM: 26, worshipFacing: 'east' },
  { code: 'spiritism', nameZh: '灵性主义', nameEn: 'Spiritism', emoji: '👁️', rank: 8, adherentsM: 15 },
  { code: 'judaism', nameZh: '犹太教', nameEn: 'Judaism', emoji: '✡️', rank: 9, adherentsM: 15, worshipFacing: 'jerusalem' },
  { code: 'taoism', nameZh: '道教', nameEn: 'Taoism', emoji: '☯️', rank: 10, adherentsM: 12, worshipFacing: 'east' },
  { code: 'shinto', nameZh: '神道教', nameEn: 'Shinto', emoji: '⛩️', rank: 11, adherentsM: 4, worshipFacing: 'east' },
  { code: 'bahai', nameZh: '巴哈伊教', nameEn: "Bahá'í Faith", emoji: '⭐', rank: 12, adherentsM: 8 },
  { code: 'jainism', nameZh: '耆那教', nameEn: 'Jainism', emoji: '🙏', rank: 13, adherentsM: 5 },
  { code: 'zoroastrianism', nameZh: '琐罗亚斯德教', nameEn: 'Zoroastrianism', emoji: '🔥', rank: 14, adherentsM: 0.2 },
  { code: 'cao_dai', nameZh: '高台教', nameEn: 'Caodaism', emoji: '🌸', rank: 15, adherentsM: 4 },
  { code: 'confucianism', nameZh: '儒教', nameEn: 'Confucianism', emoji: '📜', rank: 16, adherentsM: 6, worshipFacing: 'east' },
  { code: 'korean_shamanism', nameZh: '韩国巫教', nameEn: 'Korean Shamanism', emoji: '🎭', rank: 17, adherentsM: 5 },
  { code: 'indigenous', nameZh: '原住民信仰', nameEn: 'Indigenous Religions', emoji: '🦅', rank: 18, adherentsM: 300 },
  { code: 'afro_brazilian', nameZh: '非裔巴西宗教', nameEn: 'Afro-Brazilian Religions', emoji: '🌊', rank: 19, adherentsM: 2 },
  { code: 'tenrikyo', nameZh: '天理教', nameEn: 'Tenrikyo', emoji: '🌅', rank: 20, adherentsM: 2 },
  { code: 'none', nameZh: '无特定信仰', nameEn: 'No Specific Faith', emoji: '🌿', rank: 98, adherentsM: 0 },
  { code: 'other', nameZh: '其他', nameEn: 'Other', emoji: '⋯', rank: 99, adherentsM: 0 },
];

export type SeedSanctuary = {
  code: string;
  nameZh: string;
  nameEn: string;
  faithCodes: string[];
  tradition: 'latin' | 'seasia' | 'global';
  region: string;
  domains: string[];
  color: string;
  gradient: string;
  imageUrl: string;
  sortOrder: number;
  blessingText?: string;
};

export const SEED_SANCTUARIES: SeedSanctuary[] = [
  {
    code: 'aparecida',
    nameZh: '阿帕雷西达圣母',
    nameEn: 'Nossa Senhora Aparecida',
    faithCodes: ['christianity'],
    tradition: 'latin',
    region: 'Brazil',
    domains: ['奇迹', '母爱', '庇护'],
    color: '#1A3A5C',
    gradient: 'linear-gradient(160deg, #1A3A5C, #2A4A6C)',
    imageUrl: '/gods/Aparecida.webp',
    sortOrder: 10,
  },
  {
    code: 'guadalupe',
    nameZh: '瓜达卢佩圣母',
    nameEn: 'Virgen de Guadalupe',
    faithCodes: ['christianity'],
    tradition: 'latin',
    region: 'Mexico/Central America',
    domains: ['慈悲', '家庭', '底层守护'],
    color: '#8B2E3A',
    gradient: 'linear-gradient(160deg, #5B1A25, #8B2E3A)',
    imageUrl: '/gods/Guadalupe.webp',
    sortOrder: 20,
  },
  {
    code: 'lujan',
    nameZh: '卢汉圣母',
    nameEn: 'Nuestra Señora de Luján',
    faithCodes: ['christianity'],
    tradition: 'latin',
    region: 'Argentina',
    domains: ['旅人保护', '平安', '方向'],
    color: '#5B8FA6',
    gradient: 'linear-gradient(160deg, #3A6070, #5B8FA6)',
    imageUrl: '/gods/Luján.webp',
    sortOrder: 30,
  },
  {
    code: 'santonino',
    nameZh: '圣婴耶稣',
    nameEn: 'Santo Niño de Cebú',
    faithCodes: ['christianity'],
    tradition: 'latin',
    region: 'Philippines',
    domains: ['奇迹', '希望', '孩子'],
    color: '#8B2020',
    gradient: 'linear-gradient(160deg, #5B1010, #8B2020)',
    imageUrl: '/gods/Santo Niño.webp',
    sortOrder: 40,
  },
  {
    code: 'guanyin',
    nameZh: '观音',
    nameEn: 'Guan Yin',
    faithCodes: ['buddhism', 'chinese_folk', 'taoism'],
    tradition: 'seasia',
    region: 'Chinese Diaspora / Thailand',
    domains: ['慈悲', '救苦', '子嗣'],
    color: '#D4C8C0',
    gradient: 'linear-gradient(160deg, #B8ACA4, #F0E8E0)',
    imageUrl: '/gods/观音.webp',
    sortOrder: 50,
    blessingText: '慈悲之光已照见你的心愿，今日向前走一步。',
  },
  {
    code: 'brahma',
    nameZh: '四面佛',
    nameEn: 'Brahma (Erawan)',
    faithCodes: ['hinduism', 'buddhism'],
    tradition: 'seasia',
    region: 'Thailand',
    domains: ['全能护佑', '事业', '财运'],
    color: '#C9954A',
    gradient: 'linear-gradient(160deg, #A67A38, #D4A853)',
    imageUrl: '/gods/四面佛.webp',
    sortOrder: 60,
  },
  {
    code: 'ganesha',
    nameZh: '象神',
    nameEn: 'Ganesha',
    faithCodes: ['hinduism'],
    tradition: 'seasia',
    region: 'India / Thailand',
    domains: ['除障', '智慧', '学业'],
    color: '#D4782A',
    gradient: 'linear-gradient(160deg, #B06020, #E89040)',
    imageUrl: '/gods/象神.webp',
    sortOrder: 70,
  },
  {
    code: 'mazu',
    nameZh: '妈祖',
    nameEn: 'Mazu',
    faithCodes: ['chinese_folk', 'taoism'],
    tradition: 'seasia',
    region: 'Chinese Diaspora',
    domains: ['出海平安', '女性力量'],
    color: '#8B2020',
    gradient: 'linear-gradient(160deg, #5B1010, #A03030)',
    imageUrl: '/gods/妈祖.webp',
    sortOrder: 80,
  },
];
