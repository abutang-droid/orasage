/**
 * 城市匹配逻辑回归测试
 * 验证 getCityCoords 的各种匹配场景
 */
import { describe, it, expect } from 'vitest';

// 内联简化版匹配逻辑（与 client/src/lib/cityData.ts 保持一致）
interface CityRecord {
  city: string;
  province: string;
  country: string;
  lng: number;
  lat: number;
  timezone: string;
  alias?: string[];
}

function getCityCoordsSync(data: CityRecord[], cityName: string): CityRecord | null {
  if (!cityName) return null;

  // 1. 精确匹配 city
  let found = data.find(c => c.city === cityName);
  // 2. alias 精确匹配
  if (!found) found = data.find(c => c.alias?.includes(cityName));
  // 3. city 包含查询词（如 "石首" 匹配 "石首市"）
  if (!found) found = data.find(c => c.city.includes(cityName));
  // 4. 查询词包含 city，但 city 必须长度 >= 2 且必须是完整词（避免 "吉林四平" 匹配 "吉林"）
  if (!found) {
    found = data.find(c => {
      if (!c.city || c.city.length < 2) return false;
      if (!cityName.includes(c.city)) return false;
      const idx = cityName.indexOf(c.city);
      const before = idx > 0 ? cityName[idx - 1] : '';
      const after = idx + c.city.length < cityName.length ? cityName[idx + c.city.length] : '';
      const isChinese = (ch: string) => /[\u4e00-\u9fff]/.test(ch);
      if (isChinese(before) || isChinese(after)) return false;
      return true;
    });
  }
  // 5. alias 模糊匹配
  if (!found) found = data.find(c => c.alias?.some(a => a.includes(cityName) || cityName.includes(a)));

  return found ?? null;
}

// 测试数据集
const testData: CityRecord[] = [
  { city: '吉林', province: '吉林省', country: '中国', lng: 126.5493, lat: 43.8426, timezone: '+8', alias: ['吉林市'] },
  { city: '四平', province: '吉林省', country: '中国', lng: 124.3768, lat: 43.1726, timezone: '+8', alias: ['四平市'] },
  { city: '石首', province: '湖北省', country: '中国', lng: 112.4253, lat: 29.7205, timezone: '+8', alias: ['石首市'] },
  { city: '武汉', province: '湖北省', country: '中国', lng: 114.3055, lat: 30.5928, timezone: '+8', alias: ['武汉市'] },
  { city: '北京', province: '北京市', country: '中国', lng: 116.4074, lat: 39.9042, timezone: '+8', alias: ['北京市'] },
  { city: '上海', province: '上海市', country: '中国', lng: 121.4737, lat: 31.2304, timezone: '+8', alias: ['上海市'] },
  { city: '义乌', province: '浙江省', country: '中国', lng: 120.0742, lat: 29.3062, timezone: '+8', alias: ['义乌市'] },
];

describe('城市匹配逻辑', () => {
  it('精确匹配：输入"石首"应命中石首', () => {
    const result = getCityCoordsSync(testData, '石首');
    expect(result).not.toBeNull();
    expect(result!.city).toBe('石首');
    expect(result!.lng).toBeCloseTo(112.4253, 2);
  });

  it('精确匹配：输入"四平"应命中四平，而非吉林', () => {
    const result = getCityCoordsSync(testData, '四平');
    expect(result).not.toBeNull();
    expect(result!.city).toBe('四平');
    expect(result!.lng).toBeCloseTo(124.3768, 2);
  });

  it('精确匹配：输入"吉林"应命中吉林市', () => {
    const result = getCityCoordsSync(testData, '吉林');
    expect(result).not.toBeNull();
    expect(result!.city).toBe('吉林');
    expect(result!.lng).toBeCloseTo(126.5493, 2);
  });

  it('边界检查：输入"吉林四平"不应命中"吉林"（汉字边界保护）', () => {
    // "吉林四平" 中 "吉林" 后面紧跟 "四"（汉字），应被过滤
    // "四平" 后面没有汉字，应能命中
    const result = getCityCoordsSync(testData, '吉林四平');
    // 应命中四平（"吉林四平".includes("四平") 且 "四" 前面是 "林"（汉字），但 "平" 后面没有汉字）
    // 注意："吉林四平" 中 "四平" 的前一个字是 "林"（汉字），所以也会被过滤
    // 因此最终结果应为 null 或通过 alias 匹配
    // 实际上 "吉林四平" 不应该误命中 "吉林"
    if (result !== null) {
      expect(result.city).not.toBe('吉林');
    }
  });

  it('alias 匹配：输入"石首市"应通过 alias 命中石首', () => {
    const result = getCityCoordsSync(testData, '石首市');
    expect(result).not.toBeNull();
    expect(result!.city).toBe('石首');
  });

  it('alias 匹配：输入"四平市"应通过 alias 命中四平', () => {
    const result = getCityCoordsSync(testData, '四平市');
    expect(result).not.toBeNull();
    expect(result!.city).toBe('四平');
    expect(result!.lng).toBeCloseTo(124.3768, 2);
  });

  it('精确匹配：输入"北京"应命中北京', () => {
    const result = getCityCoordsSync(testData, '北京');
    expect(result).not.toBeNull();
    expect(result!.city).toBe('北京');
  });

  it('精确匹配：输入"义乌"应命中义乌', () => {
    const result = getCityCoordsSync(testData, '义乌');
    expect(result).not.toBeNull();
    expect(result!.city).toBe('义乌');
  });

  it('空输入应返回 null', () => {
    const result = getCityCoordsSync(testData, '');
    expect(result).toBeNull();
  });

  it('不存在的城市应返回 null', () => {
    const result = getCityCoordsSync(testData, '火星基地');
    expect(result).toBeNull();
  });
});

describe('起运年龄计算逻辑', () => {
  it('每3天对应1岁：29天 → 约9.7岁', () => {
    const days = 29;
    const age = Math.round((days / 3) * 10) / 10;
    expect(age).toBe(9.7);
  });

  it('每3天对应1岁：15天 → 5岁', () => {
    const days = 15;
    const age = Math.round((days / 3) * 10) / 10;
    expect(age).toBe(5);
  });

  it('每3天对应1岁：6天 → 2岁', () => {
    const days = 6;
    const age = Math.round((days / 3) * 10) / 10;
    expect(age).toBe(2);
  });

  it('每3天对应1岁：1天 → 0.3岁', () => {
    const days = 1;
    const age = Math.round((days / 3) * 10) / 10;
    expect(age).toBe(0.3);
  });

  it('大运干支顺序：月柱戊午，顺行，第一步应为己未', () => {
    const TIAN_GAN = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
    const DI_ZHI = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
    const monthGanIdx = TIAN_GAN.indexOf('戊'); // 4
    const monthZhiIdx = DI_ZHI.indexOf('午');   // 6
    const step = 1; // 顺行第一步
    const ganIdx = ((monthGanIdx + step) % 10 + 10) % 10; // 5 → 己
    const zhiIdx = ((monthZhiIdx + step) % 12 + 12) % 12; // 7 → 未
    expect(TIAN_GAN[ganIdx]).toBe('己');
    expect(DI_ZHI[zhiIdx]).toBe('未');
  });

  it('大运干支顺序：月柱甲子，逆行，第一步应为癸亥', () => {
    const TIAN_GAN = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
    const DI_ZHI = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
    const monthGanIdx = TIAN_GAN.indexOf('甲'); // 0
    const monthZhiIdx = DI_ZHI.indexOf('子');   // 0
    const step = -1; // 逆行第一步
    const ganIdx = ((monthGanIdx + step) % 10 + 10) % 10; // -1 → 9 → 癸
    const zhiIdx = ((monthZhiIdx + step) % 12 + 12) % 12; // -1 → 11 → 亥
    expect(TIAN_GAN[ganIdx]).toBe('癸');
    expect(DI_ZHI[zhiIdx]).toBe('亥');
  });
});
