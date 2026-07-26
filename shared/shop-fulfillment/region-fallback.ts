/** Static first-level divisions when AI is unavailable. */

const CN_PROVINCES = [
  '北京市', '天津市', '上海市', '重庆市',
  '河北省', '山西省', '辽宁省', '吉林省', '黑龙江省',
  '江苏省', '浙江省', '安徽省', '福建省', '江西省', '山东省',
  '河南省', '湖北省', '湖南省', '广东省', '海南省',
  '四川省', '贵州省', '云南省', '陕西省', '甘肃省', '青海省',
  '台湾省', '内蒙古自治区', '广西壮族自治区', '西藏自治区',
  '宁夏回族自治区', '新疆维吾尔自治区', '香港特别行政区', '澳门特别行政区',
];

const CN_PROVINCES_EN = [
  'Beijing', 'Tianjin', 'Shanghai', 'Chongqing',
  'Hebei', 'Shanxi', 'Liaoning', 'Jilin', 'Heilongjiang',
  'Jiangsu', 'Zhejiang', 'Anhui', 'Fujian', 'Jiangxi', 'Shandong',
  'Henan', 'Hubei', 'Hunan', 'Guangdong', 'Hainan',
  'Sichuan', 'Guizhou', 'Yunnan', 'Shaanxi', 'Gansu', 'Qinghai',
  'Taiwan', 'Inner Mongolia', 'Guangxi', 'Tibet',
  'Ningxia', 'Xinjiang', 'Hong Kong', 'Macau',
];

const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado',
  'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho',
  'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana',
  'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota',
  'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada',
  'New Hampshire', 'New Jersey', 'New Mexico', 'New York',
  'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon',
  'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
  'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington',
  'West Virginia', 'Wisconsin', 'Wyoming', 'District of Columbia',
];

const CA_PROVINCES = [
  'Alberta', 'British Columbia', 'Manitoba', 'New Brunswick',
  'Newfoundland and Labrador', 'Northwest Territories', 'Nova Scotia',
  'Nunavut', 'Ontario', 'Prince Edward Island', 'Quebec', 'Saskatchewan', 'Yukon',
];

const AU_STATES = [
  'Australian Capital Territory', 'New South Wales', 'Northern Territory',
  'Queensland', 'South Australia', 'Tasmania', 'Victoria', 'Western Australia',
];

const GB_REGIONS = ['England', 'Scotland', 'Wales', 'Northern Ireland'];

const JP_PREFECTURES_EN = [
  'Hokkaido', 'Aomori', 'Iwate', 'Miyagi', 'Akita', 'Yamagata', 'Fukushima',
  'Ibaraki', 'Tochigi', 'Gunma', 'Saitama', 'Chiba', 'Tokyo', 'Kanagawa',
  'Niigata', 'Toyama', 'Ishikawa', 'Fukui', 'Yamanashi', 'Nagano', 'Gifu',
  'Shizuoka', 'Aichi', 'Mie', 'Shiga', 'Kyoto', 'Osaka', 'Hyogo', 'Nara',
  'Wakayama', 'Tottori', 'Shimane', 'Okayama', 'Hiroshima', 'Yamaguchi',
  'Tokushima', 'Kagawa', 'Ehime', 'Kochi', 'Fukuoka', 'Saga', 'Nagasaki',
  'Kumamoto', 'Oita', 'Miyazaki', 'Kagoshima', 'Okinawa',
];

const FALLBACK: Record<string, { zh?: string[]; en: string[] }> = {
  CN: { zh: CN_PROVINCES, en: CN_PROVINCES_EN },
  US: { en: US_STATES },
  CA: { en: CA_PROVINCES },
  AU: { en: AU_STATES },
  GB: { en: GB_REGIONS },
  JP: { en: JP_PREFECTURES_EN },
};

/** First-level divisions only (no province → city static tree). */
export function staticRegionsForCountry(
  countryCode: string,
  locale = 'en',
): string[] {
  const entry = FALLBACK[countryCode.toUpperCase()];
  if (!entry) return [];
  if (locale.toLowerCase().startsWith('zh') && entry.zh?.length) return entry.zh;
  return entry.en;
}
