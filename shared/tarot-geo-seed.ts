/**
 * Seed: 大洲 / 国家 / 国家主流信仰（与 CMS geo-* + country-faiths 集合对齐）
 */

export const SEED_GEO_REGIONS = [
  { code: 'asia', nameZh: '亚洲', nameEn: 'Asia', mapX: 72, mapY: 42, sortOrder: 1 },
  { code: 'europe', nameZh: '欧洲', nameEn: 'Europe', mapX: 50, mapY: 30, sortOrder: 2 },
  { code: 'africa', nameZh: '非洲', nameEn: 'Africa', mapX: 52, mapY: 55, sortOrder: 3 },
  { code: 'americas', nameZh: '美洲', nameEn: 'Americas', mapX: 22, mapY: 45, sortOrder: 4 },
  { code: 'oceania', nameZh: '大洋洲', nameEn: 'Oceania', mapX: 85, mapY: 70, sortOrder: 5 },
] as const;

export type SeedGeoCountry = {
  code: string;
  nameZh: string;
  nameEn: string;
  regionCode: string;
  mapX: number;
  mapY: number;
  sortOrder: number;
};

export const SEED_GEO_COUNTRIES: SeedGeoCountry[] = [
  // Asia
  { code: 'CN', nameZh: '中国', nameEn: 'China', regionCode: 'asia', mapX: 68, mapY: 38, sortOrder: 10 },
  { code: 'TW', nameZh: '中国台湾', nameEn: 'Taiwan', regionCode: 'asia', mapX: 72, mapY: 42, sortOrder: 11 },
  { code: 'HK', nameZh: '中国香港', nameEn: 'Hong Kong', regionCode: 'asia', mapX: 70, mapY: 41, sortOrder: 12 },
  { code: 'JP', nameZh: '日本', nameEn: 'Japan', regionCode: 'asia', mapX: 82, mapY: 36, sortOrder: 20 },
  { code: 'KR', nameZh: '韩国', nameEn: 'South Korea', regionCode: 'asia', mapX: 78, mapY: 34, sortOrder: 21 },
  { code: 'TH', nameZh: '泰国', nameEn: 'Thailand', regionCode: 'asia', mapX: 66, mapY: 48, sortOrder: 30 },
  { code: 'PH', nameZh: '菲律宾', nameEn: 'Philippines', regionCode: 'asia', mapX: 74, mapY: 48, sortOrder: 31 },
  { code: 'ID', nameZh: '印度尼西亚', nameEn: 'Indonesia', regionCode: 'asia', mapX: 72, mapY: 58, sortOrder: 32 },
  { code: 'MY', nameZh: '马来西亚', nameEn: 'Malaysia', regionCode: 'asia', mapX: 68, mapY: 54, sortOrder: 33 },
  { code: 'SG', nameZh: '新加坡', nameEn: 'Singapore', regionCode: 'asia', mapX: 67, mapY: 53, sortOrder: 34 },
  { code: 'VN', nameZh: '越南', nameEn: 'Vietnam', regionCode: 'asia', mapX: 66, mapY: 46, sortOrder: 35 },
  { code: 'IN', nameZh: '印度', nameEn: 'India', regionCode: 'asia', mapX: 62, mapY: 44, sortOrder: 40 },
  { code: 'PK', nameZh: '巴基斯坦', nameEn: 'Pakistan', regionCode: 'asia', mapX: 58, mapY: 38, sortOrder: 41 },
  { code: 'BD', nameZh: '孟加拉国', nameEn: 'Bangladesh', regionCode: 'asia', mapX: 64, mapY: 42, sortOrder: 42 },
  // Americas
  { code: 'BR', nameZh: '巴西', nameEn: 'Brazil', regionCode: 'americas', mapX: 28, mapY: 58, sortOrder: 10 },
  { code: 'MX', nameZh: '墨西哥', nameEn: 'Mexico', regionCode: 'americas', mapX: 14, mapY: 40, sortOrder: 11 },
  { code: 'AR', nameZh: '阿根廷', nameEn: 'Argentina', regionCode: 'americas', mapX: 24, mapY: 72, sortOrder: 12 },
  { code: 'CO', nameZh: '哥伦比亚', nameEn: 'Colombia', regionCode: 'americas', mapX: 20, mapY: 50, sortOrder: 13 },
  { code: 'US', nameZh: '美国', nameEn: 'United States', regionCode: 'americas', mapX: 18, mapY: 32, sortOrder: 20 },
  { code: 'PE', nameZh: '秘鲁', nameEn: 'Peru', regionCode: 'americas', mapX: 22, mapY: 62, sortOrder: 21 },
  { code: 'CL', nameZh: '智利', nameEn: 'Chile', regionCode: 'americas', mapX: 22, mapY: 76, sortOrder: 22 },
  // Europe
  { code: 'PT', nameZh: '葡萄牙', nameEn: 'Portugal', regionCode: 'europe', mapX: 44, mapY: 38, sortOrder: 10 },
  { code: 'ES', nameZh: '西班牙', nameEn: 'Spain', regionCode: 'europe', mapX: 46, mapY: 36, sortOrder: 11 },
  { code: 'IT', nameZh: '意大利', nameEn: 'Italy', regionCode: 'europe', mapX: 52, mapY: 36, sortOrder: 12 },
  { code: 'FR', nameZh: '法国', nameEn: 'France', regionCode: 'europe', mapX: 48, mapY: 32, sortOrder: 13 },
  { code: 'DE', nameZh: '德国', nameEn: 'Germany', regionCode: 'europe', mapX: 52, mapY: 28, sortOrder: 14 },
  { code: 'GB', nameZh: '英国', nameEn: 'United Kingdom', regionCode: 'europe', mapX: 46, mapY: 26, sortOrder: 15 },
  { code: 'PL', nameZh: '波兰', nameEn: 'Poland', regionCode: 'europe', mapX: 54, mapY: 28, sortOrder: 16 },
  { code: 'RU', nameZh: '俄罗斯', nameEn: 'Russia', regionCode: 'europe', mapX: 62, mapY: 24, sortOrder: 17 },
  // Africa
  { code: 'NG', nameZh: '尼日利亚', nameEn: 'Nigeria', regionCode: 'africa', mapX: 48, mapY: 52, sortOrder: 10 },
  { code: 'ZA', nameZh: '南非', nameEn: 'South Africa', regionCode: 'africa', mapX: 54, mapY: 72, sortOrder: 11 },
  { code: 'EG', nameZh: '埃及', nameEn: 'Egypt', regionCode: 'africa', mapX: 54, mapY: 42, sortOrder: 12 },
  { code: 'KE', nameZh: '肯尼亚', nameEn: 'Kenya', regionCode: 'africa', mapX: 56, mapY: 56, sortOrder: 13 },
  // Oceania
  { code: 'AU', nameZh: '澳大利亚', nameEn: 'Australia', regionCode: 'oceania', mapX: 82, mapY: 68, sortOrder: 10 },
  { code: 'NZ', nameZh: '新西兰', nameEn: 'New Zealand', regionCode: 'oceania', mapX: 90, mapY: 76, sortOrder: 11 },
];

export type SeedCountryFaith = {
  countryCode: string;
  faithCode: string;
  prevalence: number;
  isPrimary?: boolean;
};

/** 国家主流信仰 — 运营可在 CMS 继续调整 */
export const SEED_COUNTRY_FAITHS: SeedCountryFaith[] = [
  // Brazil
  { countryCode: 'BR', faithCode: 'christianity', prevalence: 86, isPrimary: true },
  { countryCode: 'BR', faithCode: 'afro_brazilian', prevalence: 35 },
  { countryCode: 'BR', faithCode: 'spiritism', prevalence: 22 },
  // Mexico & Latin America
  { countryCode: 'MX', faithCode: 'christianity', prevalence: 88, isPrimary: true },
  { countryCode: 'AR', faithCode: 'christianity', prevalence: 85, isPrimary: true },
  { countryCode: 'CO', faithCode: 'christianity', prevalence: 84, isPrimary: true },
  { countryCode: 'PE', faithCode: 'christianity', prevalence: 82, isPrimary: true },
  { countryCode: 'CL', faithCode: 'christianity', prevalence: 80, isPrimary: true },
  // Southeast Asia
  { countryCode: 'TH', faithCode: 'buddhism', prevalence: 92, isPrimary: true },
  { countryCode: 'TH', faithCode: 'chinese_folk', prevalence: 28 },
  { countryCode: 'PH', faithCode: 'christianity', prevalence: 86, isPrimary: true },
  { countryCode: 'PH', faithCode: 'islam', prevalence: 12 },
  { countryCode: 'ID', faithCode: 'islam', prevalence: 87, isPrimary: true },
  { countryCode: 'ID', faithCode: 'christianity', prevalence: 28 },
  { countryCode: 'ID', faithCode: 'buddhism', prevalence: 15 },
  { countryCode: 'MY', faithCode: 'islam', prevalence: 63, isPrimary: true },
  { countryCode: 'MY', faithCode: 'buddhism', prevalence: 35 },
  { countryCode: 'MY', faithCode: 'chinese_folk', prevalence: 30 },
  { countryCode: 'SG', faithCode: 'buddhism', prevalence: 42 },
  { countryCode: 'SG', faithCode: 'islam', prevalence: 38 },
  { countryCode: 'SG', faithCode: 'christianity', prevalence: 36, isPrimary: true },
  { countryCode: 'SG', faithCode: 'chinese_folk', prevalence: 32 },
  { countryCode: 'VN', faithCode: 'buddhism', prevalence: 45 },
  { countryCode: 'VN', faithCode: 'chinese_folk', prevalence: 40, isPrimary: true },
  { countryCode: 'VN', faithCode: 'christianity', prevalence: 22 },
  // Chinese sphere
  { countryCode: 'CN', faithCode: 'chinese_folk', prevalence: 72, isPrimary: true },
  { countryCode: 'CN', faithCode: 'buddhism', prevalence: 48 },
  { countryCode: 'CN', faithCode: 'taoism', prevalence: 32 },
  { countryCode: 'CN', faithCode: 'confucianism', prevalence: 28 },
  { countryCode: 'TW', faithCode: 'chinese_folk', prevalence: 52, isPrimary: true },
  { countryCode: 'TW', faithCode: 'buddhism', prevalence: 48 },
  { countryCode: 'TW', faithCode: 'taoism', prevalence: 42 },
  { countryCode: 'HK', faithCode: 'chinese_folk', prevalence: 55, isPrimary: true },
  { countryCode: 'HK', faithCode: 'buddhism', prevalence: 45 },
  { countryCode: 'HK', faithCode: 'taoism', prevalence: 30 },
  // East Asia
  { countryCode: 'JP', faithCode: 'shinto', prevalence: 52 },
  { countryCode: 'JP', faithCode: 'buddhism', prevalence: 48, isPrimary: true },
  { countryCode: 'KR', faithCode: 'christianity', prevalence: 58, isPrimary: true },
  { countryCode: 'KR', faithCode: 'buddhism', prevalence: 32 },
  { countryCode: 'KR', faithCode: 'korean_shamanism', prevalence: 28 },
  // South Asia
  { countryCode: 'IN', faithCode: 'hinduism', prevalence: 78, isPrimary: true },
  { countryCode: 'IN', faithCode: 'islam', prevalence: 14 },
  { countryCode: 'IN', faithCode: 'sikhism', prevalence: 18 },
  { countryCode: 'IN', faithCode: 'buddhism', prevalence: 8 },
  { countryCode: 'PK', faithCode: 'islam', prevalence: 96, isPrimary: true },
  { countryCode: 'BD', faithCode: 'islam', prevalence: 90, isPrimary: true },
  // US & Oceania
  { countryCode: 'US', faithCode: 'christianity', prevalence: 65, isPrimary: true },
  { countryCode: 'US', faithCode: 'judaism', prevalence: 12 },
  { countryCode: 'US', faithCode: 'islam', prevalence: 10 },
  { countryCode: 'US', faithCode: 'buddhism', prevalence: 8 },
  { countryCode: 'AU', faithCode: 'christianity', prevalence: 52, isPrimary: true },
  { countryCode: 'AU', faithCode: 'buddhism', prevalence: 18 },
  { countryCode: 'AU', faithCode: 'islam', prevalence: 12 },
  { countryCode: 'NZ', faithCode: 'christianity', prevalence: 48, isPrimary: true },
  { countryCode: 'NZ', faithCode: 'indigenous', prevalence: 15 },
  // Europe
  { countryCode: 'PT', faithCode: 'christianity', prevalence: 84, isPrimary: true },
  { countryCode: 'ES', faithCode: 'christianity', prevalence: 78, isPrimary: true },
  { countryCode: 'IT', faithCode: 'christianity', prevalence: 80, isPrimary: true },
  { countryCode: 'FR', faithCode: 'christianity', prevalence: 58, isPrimary: true },
  { countryCode: 'FR', faithCode: 'islam', prevalence: 22 },
  { countryCode: 'DE', faithCode: 'christianity', prevalence: 55, isPrimary: true },
  { countryCode: 'DE', faithCode: 'islam', prevalence: 18 },
  { countryCode: 'GB', faithCode: 'christianity', prevalence: 52, isPrimary: true },
  { countryCode: 'GB', faithCode: 'islam', prevalence: 15 },
  { countryCode: 'PL', faithCode: 'christianity', prevalence: 88, isPrimary: true },
  { countryCode: 'RU', faithCode: 'christianity', prevalence: 72, isPrimary: true },
  { countryCode: 'RU', faithCode: 'islam', prevalence: 18 },
  // Africa
  { countryCode: 'NG', faithCode: 'christianity', prevalence: 48, isPrimary: true },
  { countryCode: 'NG', faithCode: 'islam', prevalence: 50 },
  { countryCode: 'NG', faithCode: 'african_traditional', prevalence: 25 },
  { countryCode: 'ZA', faithCode: 'christianity', prevalence: 78, isPrimary: true },
  { countryCode: 'ZA', faithCode: 'african_traditional', prevalence: 20 },
  { countryCode: 'EG', faithCode: 'islam', prevalence: 90, isPrimary: true },
  { countryCode: 'EG', faithCode: 'christianity', prevalence: 12 },
  { countryCode: 'KE', faithCode: 'christianity', prevalence: 82, isPrimary: true },
  { countryCode: 'KE', faithCode: 'islam', prevalence: 18 },
];
