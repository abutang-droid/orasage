/**
 * Shipping address geo: continent → country (static), then AI-loaded
 * province/state and city lists with manual fallback.
 */

export const SHIPPING_CONTINENTS = [
  { code: 'asia', labelZh: '亚洲', labelEn: 'Asia', labelPt: 'Ásia' },
  { code: 'europe', labelZh: '欧洲', labelEn: 'Europe', labelPt: 'Europa' },
  { code: 'africa', labelZh: '非洲', labelEn: 'Africa', labelPt: 'África' },
  { code: 'americas', labelZh: '美洲', labelEn: 'Americas', labelPt: 'Américas' },
  { code: 'oceania', labelZh: '大洋洲', labelEn: 'Oceania', labelPt: 'Oceania' },
] as const;

export type ShippingContinentCode = (typeof SHIPPING_CONTINENTS)[number]['code'];

export type ShippingCountry = {
  code: string;
  continent: ShippingContinentCode;
  labelZh: string;
  labelEn: string;
};

/** Global shipping destinations — continent first, then country. */
export const SHIPPING_COUNTRIES: ShippingCountry[] = [
  // Asia
  { code: 'CN', continent: 'asia', labelZh: '中国', labelEn: 'China' },
  { code: 'HK', continent: 'asia', labelZh: '中国香港', labelEn: 'Hong Kong' },
  { code: 'MO', continent: 'asia', labelZh: '中国澳门', labelEn: 'Macau' },
  { code: 'TW', continent: 'asia', labelZh: '中国台湾', labelEn: 'Taiwan' },
  { code: 'JP', continent: 'asia', labelZh: '日本', labelEn: 'Japan' },
  { code: 'KR', continent: 'asia', labelZh: '韩国', labelEn: 'South Korea' },
  { code: 'SG', continent: 'asia', labelZh: '新加坡', labelEn: 'Singapore' },
  { code: 'MY', continent: 'asia', labelZh: '马来西亚', labelEn: 'Malaysia' },
  { code: 'TH', continent: 'asia', labelZh: '泰国', labelEn: 'Thailand' },
  { code: 'PH', continent: 'asia', labelZh: '菲律宾', labelEn: 'Philippines' },
  { code: 'ID', continent: 'asia', labelZh: '印度尼西亚', labelEn: 'Indonesia' },
  { code: 'VN', continent: 'asia', labelZh: '越南', labelEn: 'Vietnam' },
  { code: 'IN', continent: 'asia', labelZh: '印度', labelEn: 'India' },
  { code: 'PK', continent: 'asia', labelZh: '巴基斯坦', labelEn: 'Pakistan' },
  { code: 'BD', continent: 'asia', labelZh: '孟加拉国', labelEn: 'Bangladesh' },
  { code: 'AE', continent: 'asia', labelZh: '阿联酋', labelEn: 'United Arab Emirates' },
  { code: 'SA', continent: 'asia', labelZh: '沙特阿拉伯', labelEn: 'Saudi Arabia' },
  { code: 'IL', continent: 'asia', labelZh: '以色列', labelEn: 'Israel' },
  { code: 'TR', continent: 'asia', labelZh: '土耳其', labelEn: 'Türkiye' },
  // Americas
  { code: 'US', continent: 'americas', labelZh: '美国', labelEn: 'United States' },
  { code: 'CA', continent: 'americas', labelZh: '加拿大', labelEn: 'Canada' },
  { code: 'MX', continent: 'americas', labelZh: '墨西哥', labelEn: 'Mexico' },
  { code: 'BR', continent: 'americas', labelZh: '巴西', labelEn: 'Brazil' },
  { code: 'AR', continent: 'americas', labelZh: '阿根廷', labelEn: 'Argentina' },
  { code: 'CL', continent: 'americas', labelZh: '智利', labelEn: 'Chile' },
  { code: 'CO', continent: 'americas', labelZh: '哥伦比亚', labelEn: 'Colombia' },
  { code: 'PE', continent: 'americas', labelZh: '秘鲁', labelEn: 'Peru' },
  // Europe
  { code: 'GB', continent: 'europe', labelZh: '英国', labelEn: 'United Kingdom' },
  { code: 'IE', continent: 'europe', labelZh: '爱尔兰', labelEn: 'Ireland' },
  { code: 'FR', continent: 'europe', labelZh: '法国', labelEn: 'France' },
  { code: 'DE', continent: 'europe', labelZh: '德国', labelEn: 'Germany' },
  { code: 'IT', continent: 'europe', labelZh: '意大利', labelEn: 'Italy' },
  { code: 'ES', continent: 'europe', labelZh: '西班牙', labelEn: 'Spain' },
  { code: 'PT', continent: 'europe', labelZh: '葡萄牙', labelEn: 'Portugal' },
  { code: 'NL', continent: 'europe', labelZh: '荷兰', labelEn: 'Netherlands' },
  { code: 'BE', continent: 'europe', labelZh: '比利时', labelEn: 'Belgium' },
  { code: 'CH', continent: 'europe', labelZh: '瑞士', labelEn: 'Switzerland' },
  { code: 'AT', continent: 'europe', labelZh: '奥地利', labelEn: 'Austria' },
  { code: 'SE', continent: 'europe', labelZh: '瑞典', labelEn: 'Sweden' },
  { code: 'NO', continent: 'europe', labelZh: '挪威', labelEn: 'Norway' },
  { code: 'DK', continent: 'europe', labelZh: '丹麦', labelEn: 'Denmark' },
  { code: 'FI', continent: 'europe', labelZh: '芬兰', labelEn: 'Finland' },
  { code: 'PL', continent: 'europe', labelZh: '波兰', labelEn: 'Poland' },
  { code: 'RU', continent: 'europe', labelZh: '俄罗斯', labelEn: 'Russia' },
  // Africa
  { code: 'ZA', continent: 'africa', labelZh: '南非', labelEn: 'South Africa' },
  { code: 'EG', continent: 'africa', labelZh: '埃及', labelEn: 'Egypt' },
  { code: 'NG', continent: 'africa', labelZh: '尼日利亚', labelEn: 'Nigeria' },
  { code: 'KE', continent: 'africa', labelZh: '肯尼亚', labelEn: 'Kenya' },
  { code: 'MA', continent: 'africa', labelZh: '摩洛哥', labelEn: 'Morocco' },
  // Oceania
  { code: 'AU', continent: 'oceania', labelZh: '澳大利亚', labelEn: 'Australia' },
  { code: 'NZ', continent: 'oceania', labelZh: '新西兰', labelEn: 'New Zealand' },
];

export function continentForCountry(countryCode: string | null | undefined): ShippingContinentCode | null {
  if (!countryCode) return null;
  const code = countryCode.toUpperCase();
  return SHIPPING_COUNTRIES.find((c) => c.code === code)?.continent ?? null;
}

export function countriesForContinent(continent: string | null | undefined): ShippingCountry[] {
  if (!continent) return [];
  return SHIPPING_COUNTRIES.filter((c) => c.continent === continent);
}

export function findShippingCountry(countryCode: string | null | undefined): ShippingCountry | null {
  if (!countryCode) return null;
  const code = countryCode.toUpperCase();
  return SHIPPING_COUNTRIES.find((c) => c.code === code) ?? null;
}

export function shippingCountryLabel(
  country: ShippingCountry,
  locale: string,
): string {
  const lower = locale.toLowerCase();
  if (lower.startsWith('zh')) return country.labelZh;
  return country.labelEn;
}

export function shippingContinentLabel(
  continent: (typeof SHIPPING_CONTINENTS)[number],
  locale: string,
): string {
  const lower = locale.toLowerCase();
  if (lower.startsWith('zh')) return continent.labelZh;
  if (lower.startsWith('pt')) return continent.labelPt;
  return continent.labelEn;
}
