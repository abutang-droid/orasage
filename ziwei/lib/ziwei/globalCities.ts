/** 海外/全球城市（经度可为负值，西经） */
export type GlobalCity = {
  city: string;
  country: string;
  region: string;
  longitude: number;
  aliases?: string[];
  pinyin?: string;
};

export const GLOBAL_CITIES: GlobalCity[] = [
  { city: '旧金山', country: '美国', region: '加利福尼亚', longitude: -122.4194, pinyin: 'SF', aliases: ['圣弗朗西斯科', '三藩市', 'San Francisco'] },
  { city: '洛杉矶', country: '美国', region: '加利福尼亚', longitude: -118.2437, pinyin: 'LA', aliases: ['Los Angeles'] },
  { city: '纽约', country: '美国', region: '纽约州', longitude: -74.006, pinyin: 'NYC', aliases: ['New York'] },
  { city: '芝加哥', country: '美国', region: '伊利诺伊', longitude: -87.6298, pinyin: 'CHI', aliases: ['Chicago'] },
  { city: '休斯顿', country: '美国', region: '德克萨斯', longitude: -95.3698, aliases: ['Houston'] },
  { city: '华盛顿', country: '美国', region: '哥伦比亚特区', longitude: -77.0369, aliases: ['Washington DC'] },
  { city: '西雅图', country: '美国', region: '华盛顿州', longitude: -122.3321, aliases: ['Seattle'] },
  { city: '拉斯维加斯', country: '美国', region: '内华达', longitude: -115.1398, aliases: ['Las Vegas'] },
  { city: '多伦多', country: '加拿大', region: '安大略', longitude: -79.3832, aliases: ['Toronto'] },
  { city: '温哥华', country: '加拿大', region: '不列颠哥伦比亚', longitude: -123.1216, aliases: ['Vancouver'] },
  { city: '蒙特利尔', country: '加拿大', region: '魁北克', longitude: -73.5673, aliases: ['Montreal'] },
  { city: '伦敦', country: '英国', region: '英格兰', longitude: -0.1276, aliases: ['London'] },
  { city: '巴黎', country: '法国', region: '法兰西岛', longitude: 2.3522, aliases: ['Paris'] },
  { city: '柏林', country: '德国', region: '柏林', longitude: 13.405, aliases: ['Berlin'] },
  { city: '悉尼', country: '澳大利亚', region: '新南威尔士', longitude: 151.2093, aliases: ['Sydney'] },
  { city: '墨尔本', country: '澳大利亚', region: '维多利亚', longitude: 144.9631, aliases: ['Melbourne'] },
  { city: '东京', country: '日本', region: '关东', longitude: 139.6917, aliases: ['Tokyo'] },
  { city: '大阪', country: '日本', region: '关西', longitude: 135.5023, aliases: ['Osaka'] },
  { city: '首尔', country: '韩国', region: '首都圈', longitude: 126.978, aliases: ['Seoul'] },
  { city: '新加坡', country: '新加坡', region: '新加坡', longitude: 103.8198, aliases: ['Singapore'] },
  { city: '吉隆坡', country: '马来西亚', region: '联邦直辖区', longitude: 101.6869, aliases: ['Kuala Lumpur'] },
  { city: '曼谷', country: '泰国', region: '中部', longitude: 100.5018, aliases: ['Bangkok'] },
  { city: '河内', country: '越南', region: '北部', longitude: 105.8542, aliases: ['Hanoi'] },
  { city: '胡志明市', country: '越南', region: '南部', longitude: 106.6297, aliases: ['胡志明', 'Ho Chi Minh'] },
  { city: '迪拜', country: '阿联酋', region: '迪拜', longitude: 55.2708, aliases: ['Dubai'] },
  { city: '香港', country: '中国', region: '香港', longitude: 114.1694, aliases: ['Hong Kong'] },
  { city: '台北', country: '中国', region: '台湾', longitude: 121.5654, aliases: ['Taipei'] },
];

export function searchGlobalCities(query: string, limit = 8): GlobalCity[] {
  const q = query.trim();
  if (!q) return GLOBAL_CITIES.slice(0, limit);

  const qLower = q.toLowerCase();
  const scored: Array<{ city: GlobalCity; score: number }> = [];

  for (const c of GLOBAL_CITIES) {
    let score = 0;
    if (c.city === q) score = 10;
    else if (c.city.startsWith(q)) score = 8;
    else if (c.city.includes(q)) score = 6;
    else if (c.country.includes(q)) score = 5;
    else if (c.aliases?.some((a) => a.toLowerCase() === qLower)) score = 9;
    else if (c.aliases?.some((a) => a.toLowerCase().startsWith(qLower))) score = 7;
    else if (c.aliases?.some((a) => a.toLowerCase().includes(qLower))) score = 4;
    else if (c.pinyin?.toLowerCase() === qLower) score = 8;
    else if (c.pinyin?.toLowerCase().startsWith(qLower)) score = 6;
    if (score > 0) scored.push({ city: c, score });
  }

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => s.city);
}
