/**
 * 拼音首字母搜索逻辑测试
 * 验证 searchCities 的拼音首字母匹配、省份显示、排序优先级
 */
import { describe, it, expect } from 'vitest';

// 内联简化版 searchCities 逻辑（与 client/src/lib/cityData.ts 保持一致）
interface CityRecord {
  city: string;
  province: string;
  country: string;
  lng: number;
  lat: number;
  timezone: string;
  alias?: string[];
  pinyin?: string;
}

function searchCities(data: CityRecord[], query: string, limit = 8): CityRecord[] {
  if (!data || !query) return [];
  const q = query.trim();
  if (!q) return [];

  const qUpper = q.toUpperCase();
  const isAllAlpha = /^[A-Za-z]+$/.test(q);

  type Scored = { record: CityRecord; score: number };
  const scored: Scored[] = [];

  for (const c of data) {
    let score = 0;
    const py = (c.pinyin || '').toUpperCase();

    if (isAllAlpha) {
      if (py === qUpper) score = 10;
      else if (py.startsWith(qUpper)) score = 8;
      else if (c.alias?.some(a => a.toLowerCase().startsWith(q.toLowerCase()))) score = 6;
      else if (c.alias?.some(a => a.toLowerCase().includes(q.toLowerCase()))) score = 3;
    } else {
      if (c.city === q) score = 10;
      else if (c.alias?.includes(q)) score = 9;
      else if (c.city.startsWith(q)) score = 7;
      else if (c.city.includes(q)) score = 5;
      else if (c.alias?.some(a => a.includes(q))) score = 4;
      else if (c.province?.includes(q)) score = 2;
    }

    if (score > 0) scored.push({ record: c, score });
  }

  scored.sort((a, b) => b.score - a.score || a.record.city.length - b.record.city.length);
  return scored.slice(0, limit).map(s => s.record);
}

// 测试数据
const testData: CityRecord[] = [
  { city: '北京', province: '北京市', country: '中国', lng: 116.4074, lat: 39.9042, timezone: '+8', alias: ['北京市', 'Beijing', 'Peking'], pinyin: 'BJ' },
  { city: '上海', province: '上海市', country: '中国', lng: 121.4737, lat: 31.2304, timezone: '+8', alias: ['上海市', 'Shanghai'], pinyin: 'SH' },
  { city: '石首', province: '湖北省', country: '中国', lng: 112.4253, lat: 29.7205, timezone: '+8', alias: ['石首市'], pinyin: 'SS' },
  { city: '石家庄', province: '河北省', country: '中国', lng: 114.5149, lat: 38.0428, timezone: '+8', alias: ['石家庄市'], pinyin: 'SJZ' },
  { city: '四平', province: '吉林省', country: '中国', lng: 124.3768, lat: 43.1726, timezone: '+8', alias: ['四平市'], pinyin: 'SP' },
  { city: '吉林', province: '吉林省', country: '中国', lng: 126.5493, lat: 43.8426, timezone: '+8', alias: ['吉林市'], pinyin: 'JL' },
  { city: '武汉', province: '湖北省', country: '中国', lng: 114.3055, lat: 30.5928, timezone: '+8', alias: ['武汉市'], pinyin: 'WH' },
  { city: '重庆', province: '重庆市', country: '中国', lng: 106.5516, lat: 29.5630, timezone: '+8', alias: ['重庆市', 'Chongqing'], pinyin: 'CQ' },
  { city: '天津', province: '天津市', country: '中国', lng: 117.1903, lat: 39.0842, timezone: '+8', alias: ['天津市', 'Tianjin'], pinyin: 'TJ' },
  { city: '深圳', province: '广东省', country: '中国', lng: 114.0579, lat: 22.5431, timezone: '+8', alias: ['深圳市', 'Shenzhen'], pinyin: 'SZ' },
  { city: '沈阳', province: '辽宁省', country: '中国', lng: 123.4315, lat: 41.8057, timezone: '+8', alias: ['沈阳市', 'Shenyang'], pinyin: 'SY' },
  { city: '纽约', province: '纽约州', country: '美国', lng: -74.006, lat: 40.7128, timezone: '-5', alias: ['New York', 'NYC'], pinyin: 'NY' },
];

describe('拼音首字母搜索', () => {
  it('BJ 应精确匹配北京（score=10）', () => {
    const results = searchCities(testData, 'BJ');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].city).toBe('北京');
  });

  it('SH 应精确匹配上海（score=10）', () => {
    const results = searchCities(testData, 'SH');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].city).toBe('上海');
  });

  it('SS 应精确匹配石首', () => {
    const results = searchCities(testData, 'SS');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].city).toBe('石首');
  });

  it('SP 应精确匹配四平', () => {
    const results = searchCities(testData, 'SP');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].city).toBe('四平');
  });

  it('S 前缀应返回所有 S 开头的城市（石首、石家庄、四平、上海、深圳、沈阳）', () => {
    const results = searchCities(testData, 'S', 20);
    const cities = results.map(c => c.city);
    expect(cities).toContain('上海'); // SH 以 S 开头
    expect(cities).toContain('石首'); // SS 以 S 开头
    expect(cities).toContain('石家庄'); // SJZ 以 S 开头
    expect(cities).toContain('四平'); // SP 以 S 开头
  });

  it('WH 应精确匹配武汉', () => {
    const results = searchCities(testData, 'WH');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].city).toBe('武汉');
  });

  it('CQ 应精确匹配重庆', () => {
    const results = searchCities(testData, 'CQ');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].city).toBe('重庆');
  });

  it('大小写不敏感：bj 应匹配北京', () => {
    const results = searchCities(testData, 'bj');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].city).toBe('北京');
  });
});

describe('汉字搜索', () => {
  it('精确输入"北京"应排第一', () => {
    const results = searchCities(testData, '北京');
    expect(results[0].city).toBe('北京');
  });

  it('输入"石"应返回石首和石家庄', () => {
    const results = searchCities(testData, '石');
    const cities = results.map(c => c.city);
    expect(cities).toContain('石首');
    expect(cities).toContain('石家庄');
  });

  it('输入"湖北"应通过省份匹配返回湖北城市', () => {
    const results = searchCities(testData, '湖北');
    const cities = results.map(c => c.city);
    expect(cities).toContain('石首');
    expect(cities).toContain('武汉');
  });

  it('空字符串应返回空数组', () => {
    const results = searchCities(testData, '');
    expect(results).toHaveLength(0);
  });
});

describe('下拉列表省份信息', () => {
  it('石首应显示"湖北省"省份信息', () => {
    const results = searchCities(testData, '石首');
    expect(results[0].province).toBe('湖北省');
  });

  it('四平应显示"吉林省"省份信息（区别于吉林市）', () => {
    const results = searchCities(testData, '四平');
    expect(results[0].province).toBe('吉林省');
    expect(results[0].city).toBe('四平');
  });

  it('纽约应显示国家"美国"而非省份', () => {
    const results = searchCities(testData, 'NY');
    expect(results[0].city).toBe('纽约');
    expect(results[0].country).toBe('美国');
  });
});
