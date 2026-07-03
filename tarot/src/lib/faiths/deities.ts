export type Deity = {
  id: string;
  name: string;
  nameEN: string;
  tradition: 'latin' | 'seasia';
  region: string;
  domains: string[];
  color: string;
  gradient: string;
  imageUrl: string;
  faithIds: string[];
};

export const DEITIES: Deity[] = [
  {
    id: 'aparecida',
    name: 'Aparecida',
    nameEN: 'Nossa Senhora Aparecida',
    tradition: 'latin',
    region: 'Brazil',
    domains: ['奇迹', '母爱', '庇护'],
    color: '#1A3A5C',
    gradient: 'linear-gradient(160deg, #1A3A5C, #2A4A6C)',
    imageUrl: '/gods/Aparecida.webp',
    faithIds: ['christianity'],
  },
  {
    id: 'guadalupe',
    name: 'Guadalupe',
    nameEN: 'Virgen de Guadalupe',
    tradition: 'latin',
    region: 'Mexico/CentralAmerica',
    domains: ['慈悲', '家庭', '底层守护'],
    color: '#8B2E3A',
    gradient: 'linear-gradient(160deg, #5B1A25, #8B2E3A)',
    imageUrl: '/gods/Guadalupe.webp',
    faithIds: ['christianity'],
  },
  {
    id: 'lujan',
    name: 'Luján',
    nameEN: 'Nuestra Señora de Luján',
    tradition: 'latin',
    region: 'Argentina',
    domains: ['旅人保护', '平安', '方向'],
    color: '#5B8FA6',
    gradient: 'linear-gradient(160deg, #3A6070, #5B8FA6)',
    imageUrl: '/gods/Luján.webp',
    faithIds: ['christianity'],
  },
  {
    id: 'santonino',
    name: 'Santo Niño',
    nameEN: 'Santo Niño de Cebú',
    tradition: 'latin',
    region: 'Philippines',
    domains: ['奇迹', '希望', '孩子'],
    color: '#8B2020',
    gradient: 'linear-gradient(160deg, #5B1010, #8B2020)',
    imageUrl: '/gods/Santo Niño.webp',
    faithIds: ['christianity'],
  },
  {
    id: 'guanyin',
    name: '观音',
    nameEN: 'Guan Yin',
    tradition: 'seasia',
    region: 'Thailand/ChineseDiaspora',
    domains: ['慈悲', '救苦', '子嗣'],
    color: '#D4C8C0',
    gradient: 'linear-gradient(160deg, #B8ACA4, #F0E8E0)',
    imageUrl: '/gods/观音.webp',
    faithIds: ['buddhism', 'chinese_folk', 'taoism'],
  },
  {
    id: 'brahma',
    name: '四面佛',
    nameEN: 'Brahma',
    tradition: 'seasia',
    region: 'Thailand',
    domains: ['全能护佑', '事业', '财运'],
    color: '#C9954A',
    gradient: 'linear-gradient(160deg, #A67A38, #D4A853)',
    imageUrl: '/gods/四面佛.webp',
    faithIds: ['hinduism', 'buddhism'],
  },
  {
    id: 'ganesha',
    name: '象神',
    nameEN: 'Ganesha',
    tradition: 'seasia',
    region: 'India/Thailand',
    domains: ['除障', '智慧', '学业'],
    color: '#D4782A',
    gradient: 'linear-gradient(160deg, #B06020, #E89040)',
    imageUrl: '/gods/象神.webp',
    faithIds: ['hinduism'],
  },
  {
    id: 'mazu',
    name: '妈祖',
    nameEN: 'Mazu',
    tradition: 'seasia',
    region: 'ChineseDiaspora',
    domains: ['出海平安', '女性力量'],
    color: '#8B2020',
    gradient: 'linear-gradient(160deg, #5B1010, #A03030)',
    imageUrl: '/gods/妈祖.webp',
    faithIds: ['chinese_folk', 'taoism'],
  },
];

export function filterDeitiesByFaith(faithId: string | null): Deity[] {
  if (!faithId || faithId === 'none' || faithId.startsWith('other')) {
    return DEITIES;
  }
  const matched = DEITIES.filter((d) => d.faithIds.includes(faithId));
  return matched.length > 0 ? matched : DEITIES;
}
