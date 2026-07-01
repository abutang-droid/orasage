/**
 * 八字排盘核心计算库 v2
 * 依赖 lunar-javascript（动态CDN加载）进行公历/农历转换及干支计算
 * 包含：五行藏干加权、身强弱分析、喜忌神、神煞、双人合盘评分
 */

// ==================== 基础数据 ====================
export const TIAN_GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
export const DI_ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

export const WU_XING_MAP: Record<string, string> = {
  甲: '木', 乙: '木', 丙: '火', 丁: '火', 戊: '土', 己: '土',
  庚: '金', 辛: '金', 壬: '水', 癸: '水',
};

export const BRANCH_WU_XING: Record<string, string> = {
  子: '水', 丑: '土', 寅: '木', 卯: '木', 辰: '土', 巳: '火',
  午: '火', 未: '土', 申: '金', 酉: '金', 戌: '土', 亥: '水',
};

export const WU_XING_COLOR: Record<string, string> = {
  木: '#4ade80', 火: '#f87171', 土: '#fbbf24', 金: '#e2e8f0', 水: '#60a5fa',
};
export const WU_XING_BG: Record<string, string> = {
  木: 'rgba(74,222,128,0.12)', 火: 'rgba(248,113,113,0.12)', 土: 'rgba(251,191,36,0.12)',
  金: 'rgba(226,232,240,0.12)', 水: 'rgba(96,165,250,0.12)',
};

// 地支藏干（含权重）
export const ZANG_GAN_MAP: Record<string, Record<string, number>> = {
  子: { 癸: 1.0 },
  丑: { 己: 0.6, 癸: 0.3, 辛: 0.1 },
  寅: { 甲: 0.6, 丙: 0.3, 戊: 0.1 },
  卯: { 乙: 1.0 },
  辰: { 戊: 0.6, 乙: 0.3, 癸: 0.1 },
  巳: { 丙: 0.6, 戊: 0.3, 庚: 0.1 },
  午: { 丁: 0.7, 己: 0.3 },
  未: { 己: 0.6, 丁: 0.3, 乙: 0.1 },
  申: { 庚: 0.6, 壬: 0.3, 戊: 0.1 },
  酉: { 辛: 1.0 },
  戌: { 戊: 0.6, 辛: 0.3, 丁: 0.1 },
  亥: { 壬: 0.7, 甲: 0.3 },
};

// 地支藏干（仅主气，用于UI展示）
export const DI_ZHI_CANG_GAN: Record<string, string[]> = {
  子: ['癸'], 丑: ['己', '癸', '辛'], 寅: ['甲', '丙', '戊'],
  卯: ['乙'], 辰: ['戊', '乙', '癸'], 巳: ['丙', '庚', '戊'],
  午: ['丁', '己'], 未: ['己', '丁', '乙'], 申: ['庚', '壬', '戊'],
  酉: ['辛'], 戌: ['戊', '辛', '丁'], 亥: ['壬', '甲'],
};

export const SHI_SHEN_MAP: Record<string, Record<string, string>> = {
  甲: { 甲: '比肩', 乙: '劫财', 丙: '食神', 丁: '伤官', 戊: '偏财', 己: '正财', 庚: '七杀', 辛: '正官', 壬: '偏印', 癸: '正印' },
  乙: { 乙: '比肩', 甲: '劫财', 丁: '食神', 丙: '伤官', 己: '偏财', 戊: '正财', 辛: '七杀', 庚: '正官', 癸: '偏印', 壬: '正印' },
  丙: { 丙: '比肩', 丁: '劫财', 戊: '食神', 己: '伤官', 庚: '偏财', 辛: '正财', 壬: '七杀', 癸: '正官', 甲: '偏印', 乙: '正印' },
  丁: { 丁: '比肩', 丙: '劫财', 己: '食神', 戊: '伤官', 辛: '偏财', 庚: '正财', 癸: '七杀', 壬: '正官', 乙: '偏印', 甲: '正印' },
  戊: { 戊: '比肩', 己: '劫财', 庚: '食神', 辛: '伤官', 壬: '偏财', 癸: '正财', 甲: '七杀', 乙: '正官', 丙: '偏印', 丁: '正印' },
  己: { 己: '比肩', 戊: '劫财', 辛: '食神', 庚: '伤官', 癸: '偏财', 壬: '正财', 乙: '七杀', 甲: '正官', 丁: '偏印', 丙: '正印' },
  庚: { 庚: '比肩', 辛: '劫财', 壬: '食神', 癸: '伤官', 甲: '偏财', 乙: '正财', 丙: '七杀', 丁: '正官', 戊: '偏印', 己: '正印' },
  辛: { 辛: '比肩', 庚: '劫财', 癸: '食神', 壬: '伤官', 乙: '偏财', 甲: '正财', 丁: '七杀', 丙: '正官', 己: '偏印', 戊: '正印' },
  壬: { 壬: '比肩', 癸: '劫财', 甲: '食神', 乙: '伤官', 丙: '偏财', 丁: '正财', 戊: '七杀', 己: '正官', 庚: '偏印', 辛: '正印' },
  癸: { 癸: '比肩', 壬: '劫财', 乙: '食神', 甲: '伤官', 丁: '偏财', 丙: '正财', 己: '七杀', 戊: '正官', 辛: '偏印', 庚: '正印' },
};

// ==================== 类型定义 ====================
export interface Pillar {
  gan: string;
  zhi: string;
}

export interface WuXingCount {
  木: number; 火: number; 土: number; 金: number; 水: number;
}

export interface DaYun {
  startAge: number;
  gan: string;
  zhi: string;
  label: string;
}

export interface MingLiSummary {
  /** 命局概述（1句话） */
  overview: string;
  /** 性格特征（2-3句） */
  personality: string;
  /** 事业方向（2-3句） */
  career: string;
  /** 感情倾向（2-3句） */
  relationship: string;
  /** 运势提示（1-2句） */
  fortune: string;
}

// ── P0 新增类型：四层过滤引擎 ─────────────────────────────────────────────────

/** 格局分类关键词 */
export type PatternKeyword =
  | '建禄格' | '伤官格' | '食神格'
  | '正财格' | '偏财格' | '财格'
  | '正官格' | '七杀格' | '官杀格'
  | '正印格' | '偏印格' | '印绶格'
  | '从格' | '化格';

/** L2 Climate_Sensor 输出 */
export interface ClimateAlert {
  /** 是否有极端气候需要干预 */
  active: boolean;
  /** 气候类型 */
  type: 'fire_drought' | 'water_freeze' | 'wood_excess' | 'metal_rigid' | 'neutral';
  /** 人类可读描述 */
  description: string;
  /** 被强制修正的喜忌（覆盖基础判断） */
  overrideFavorable?: string[];
  overrideUnfavorable?: string[];
  /** 调候优先级排行 */
  prioritization: string;
}

/** L3 Flow_Analyzer 检测到的气机问题 */
export interface FlowIssue {
  /** 问题级别 */
  severity: 'critical' | 'warning' | 'info';
  /** 问题标签 */
  label: string;
  /** 人类可读描述 */
  description: string;
}

/** L4 Pattern_Detect 输出 */
export interface PatternResult {
  /** 主要格局 */
  primary: PatternKeyword;
  /** 辅助格局（可多个） */
  secondary: PatternKeyword[];
  /** 格局人类可读描述 */
  description: string;
  /** 格局关键透干信息 */
  keyStems: string[];
}

/** 命局死穴 — 最脆弱的那个点 */
export interface DeadPoint {
  /** 受击元素（地支或五行） */
  target: string;
  /** 攻击来源 */
  attacker: string;
  /** 机制描述 */
  mechanism: string;
  /** 人类可读解读 */
  insight: string;
}

/** 一句击中（结果页首屏钩子） */
export interface OneLineHit {
  /** 主文案（一句话，15字以内） */
  headline: string;
  /** 副文案（补充一句，10字以内） */
  subline: string;
  /** 语气：炽热 | 冷静 | 通透 | 锐利 | 深邃 */
  tone: string;
}

/** 未来节点预警（节气提醒钩子） */
export interface SeasonalAlert {
  date: string;        // "2026-07-22"
  solarTerm: string;   // "大暑"
  riskLevel: 'red' | 'orange' | 'yellow';
  message: string;     // 一句话预警
  action: string;      // 一句操作建议
}

/** 月度运势预览项 */
export interface MonthlyFortunePreview {
  /** 月份标签，如"6月"、"7月" */
  label: string;
  /** 年-月，如"2026-06" */
  ym: string;
  /** 0-100 */
  overall: number;
  /** 各维度分（0-100） */
  career: number;
  wealth: number;
  love: number;
  health: number;
  /** 关键事件标签 */
  eventTag: string;
}

export interface SingleBaziResult {
  name: string;
  gender: 'male' | 'female';
  birthStr: string;
  // 四柱
  year: Pillar;
  month: Pillar;
  day: Pillar;
  hour: Pillar;
  // 分析
  wuXing: WuXingCount;
  strength: string;
  favorable: string[];
  unfavorable: string[];
  daYun: DaYun[];
  shensha: Record<string, string[]>;
  shiShen: Record<string, string>;
  riZhu: string;
  /** 命理小结（段落式解读） */
  mingLiSummary: MingLiSummary;
  // ── P0 新增字段 ──
  /** 格局定型 */
  pattern: PatternResult;
  /** 气候调候警报 */
  climate: ClimateAlert;
  /** 气机流转问题列表 */
  flowIssues: FlowIssue[];
  /** 命局死穴 — 最脆弱的点 */
  deadPoint: DeadPoint;
  /** 结果页首屏钩子 */
  oneLineHit: OneLineHit;
  /** 节气预警清单 */
  seasonalAlerts: SeasonalAlert[];
  /** 未来12个月运势预览 */
  monthlyFortunes: MonthlyFortunePreview[];
  // 出生地信息（经度修正真太阳时）
  birthCity?: string;       // 城市名称，如「北京」
  birthLng?: number;        // 经度，如 116.4
  trueSolarOffset?: number; // 真太阳时偏差分钟（负=向西偏）
  trueSolarNote?: string;   // 中文说明，如「已修正 -16 分钟」
}

export interface ScoreDimension {
  label: string;    // 维度名称
  score: number;    // 该维度得分（0-100）
  weight: number;   // 权重（0-1，所有维度之和=1）
  detail: string;   // 简短说明
}

export interface DoubleBaziResult {
  person1: SingleBaziResult;
  person2: SingleBaziResult;
  score: number;
  rating: string;
  scoreDetails: ScoreDimension[];
}

// 兼容旧类型别名
export type BaziResult = SingleBaziResult;

// ==================== 本地农历数据模块（替换 lunar-javascript CDN）====================
import { getLunarData, getShiZhu, preloadCommonDecades } from './lunarData';

// 兼容旧接口：首次调用时预加载常用年代数据
let _lunarReady = false;
let _lunarReadyPromise: Promise<boolean> | null = null;

export function loadLunarLib(): Promise<boolean> {
  if (_lunarReady) return Promise.resolve(true);
  if (_lunarReadyPromise) return _lunarReadyPromise;
  _lunarReadyPromise = new Promise((resolve) => {
    // 预加载 1950-2030 年代，覆盖大部分用户出生年
    preloadCommonDecades();
    _lunarReady = true;
    resolve(true);
  });
  return _lunarReadyPromise;
}

export function isLunarLoaded(): boolean {
  return true; // 本地模块无需等待 CDN，始终可用
}

// ==================== 工具函数 ====================
function stemToWx(stem: string): keyof WuXingCount {
  return (WU_XING_MAP[stem] ?? '土') as keyof WuXingCount;
}

function branchToWx(branch: string): keyof WuXingCount {
  return (BRANCH_WU_XING[branch] ?? '土') as keyof WuXingCount;
}

function parsePillar(ganZhi: string): Pillar {
  return { gan: ganZhi[0], zhi: ganZhi[1] };
}

// ==================== 五行加权统计 ====================
function calcWuXingWeighted(pillars: { year: Pillar; month: Pillar; day: Pillar; hour: Pillar }): WuXingCount {
  const count: WuXingCount = { 木: 0, 火: 0, 土: 0, 金: 0, 水: 0 };

  for (const p of [pillars.year, pillars.month, pillars.day, pillars.hour]) {
    count[stemToWx(p.gan)] += 1.0;
    const hidden = ZANG_GAN_MAP[p.zhi];
    if (hidden) {
      for (const gan in hidden) {
        count[stemToWx(gan)] += hidden[gan];
      }
    }
  }

  return count;
}

// ==================== 身强弱分析 ====================
function analyzeStrength(
  pillars: { year: Pillar; month: Pillar; day: Pillar; hour: Pillar },
  wuXing: WuXingCount
): string {
  const rizhuWx = stemToWx(pillars.day.gan);
  let strength = 0;

  // 日支同五行
  if (branchToWx(pillars.day.zhi) === rizhuWx) strength += 2;

  // 月令
  const monthWx = branchToWx(pillars.month.zhi);
  if (monthWx === rizhuWx) {
    strength += 2;
  } else {
    const sheng: Record<string, keyof WuXingCount> = { 木: '水', 火: '木', 土: '火', 金: '土', 水: '金' };
    if (sheng[rizhuWx] === monthWx) strength += 1;
  }

  // 天干帮扶
  for (const stem of [pillars.year.gan, pillars.month.gan, pillars.hour.gan]) {
    if (stemToWx(stem) === rizhuWx) strength += 1;
  }

  strength += (wuXing[rizhuWx] ?? 0) * 0.5;

  // 极值检测：如果日主++生它的印星 > 总权重70% → 偏枯
  const selfRatio = wxRatio(wuXing, rizhuWx);
  const shengWx = SHENG_RULE[rizhuWx as keyof typeof SHENG_RULE] ?? '';
  const yinRatio = wxRatio(wuXing, shengWx);
  if (selfRatio + yinRatio > 0.72) return '极强（偏枯）';
  if (strength >= 6) return '身强';
  if (strength >= 3) return '身中';
  return '身弱';
}

// ==================== 喜忌神 ====================
function determineFavorable(rizhu: string, strength: string): { favorable: string[]; unfavorable: string[] } {
  const wx = stemToWx(rizhu);
  const strongFav: Record<string, string[]> = {
    木: ['金', '土'], 火: ['水', '土'], 土: ['木', '水'], 金: ['火', '水'], 水: ['土', '木'],
  };
  const weakFav: Record<string, string[]> = {
    木: ['水', '木'], 火: ['木', '火'], 土: ['火', '土'], 金: ['土', '金'], 水: ['金', '水'],
  };
  const strongUnfav: Record<string, string[]> = {
    木: ['水', '木'], 火: ['木', '火'], 土: ['火', '土'], 金: ['土', '金'], 水: ['金', '水'],
  };
  const weakUnfav: Record<string, string[]> = {
    木: ['金', '土'], 火: ['水', '土'], 土: ['木', '水'], 金: ['火', '水'], 水: ['土', '木'],
  };

  if (strength === '极强（偏枯）' || strength === '身强') {
    return { favorable: strongFav[wx] ?? [], unfavorable: strongUnfav[wx] ?? [] };
  }
  return { favorable: weakFav[wx] ?? [], unfavorable: weakUnfav[wx] ?? [] };
}

// ==================== 神煞 ====================
function calcShensha(pillars: { year: Pillar; month: Pillar; day: Pillar; hour: Pillar }): Record<string, string[]> {
  const shensha: Record<string, string[]> = {};
  const dayGan = pillars.day.gan;
  const branches = [pillars.year.zhi, pillars.month.zhi, pillars.day.zhi, pillars.hour.zhi];

  const guiren: Record<string, string[]> = {
    甲: ['丑', '未'], 戊: ['丑', '未'], 乙: ['子', '申'], 己: ['子', '申'],
    丙: ['亥', '酉'], 丁: ['亥', '酉'], 壬: ['卯', '巳'], 癸: ['卯', '巳'],
    庚: ['寅', '午'], 辛: ['寅', '午'],
  };
  const guirenList = guiren[dayGan] ?? [];
  const guirenFound = branches.filter(b => guirenList.includes(b));
  if (guirenFound.length > 0) shensha['天乙贵人'] = guirenFound;

  const wenchang: Record<string, string> = {
    甲: '巳', 乙: '午', 丙: '申', 丁: '酉', 戊: '申', 己: '酉', 庚: '亥', 辛: '子', 壬: '寅', 癸: '卯',
  };
  if (wenchang[dayGan] && branches.includes(wenchang[dayGan])) {
    shensha['文昌贵人'] = [wenchang[dayGan]];
  }

  const yima: Record<string, string> = {
    申: '寅', 子: '寅', 辰: '寅', 寅: '申', 午: '申', 戌: '申',
    巳: '亥', 酉: '亥', 丑: '亥', 亥: '巳', 卯: '巳', 未: '巳',
  };
  const dayZhi = pillars.day.zhi;
  if (yima[dayZhi] && branches.includes(yima[dayZhi])) {
    shensha['驿马'] = [yima[dayZhi]];
  }

  return shensha;
}

// ==================== 十神 ====================
function calcShiShen(pillars: { year: Pillar; month: Pillar; day: Pillar; hour: Pillar }): Record<string, string> {
  const dayGan = pillars.day.gan;
  const map = SHI_SHEN_MAP[dayGan] ?? {};
  const result: Record<string, string> = {};
  const allGans = [
    pillars.year.gan, pillars.month.gan, pillars.hour.gan,
    ...Object.keys(ZANG_GAN_MAP[pillars.year.zhi] ?? {}),
    ...Object.keys(ZANG_GAN_MAP[pillars.month.zhi] ?? {}),
    ...Object.keys(ZANG_GAN_MAP[pillars.day.zhi] ?? {}),
    ...Object.keys(ZANG_GAN_MAP[pillars.hour.zhi] ?? {}),
  ];
  for (const gan of allGans) {
    if (map[gan]) result[gan] = map[gan];
  }
  return result;
}

// ==================== 大运计算 ====================

/**
 * 计算精确起运年龄
 * 传统命理：以出生日到最近"节"（jie，月令分界点）的天数 ÷ 3 = 起运岁数
 * 顺行（阳男/阴女）：找下一个节；逆行（阴男/阳女）：找上一个节
 *
 * 注意：必须找"节"而非"气"。
 * 24 节气中，12 个"节"是月令分界点（立春、惊蛰、清明、立夏、芒种、小暑、
 * 立秋、白露、寒露、立冬、大雪、小寒），12 个"气"是月中点。
 * 大运起运以"节"为准。
 *
 * @param birthDateStr 出生公历日期 "YYYY-MM-DD"
 * @param isForward 是否顺行
 * @returns 起运年龄（保留一位小数）
 */
async function calcQiYunAge(
  birthDateStr: string,
  isForward: boolean
): Promise<number> {
  const MAX_SCAN = 180; // 相邻两个"节"最大间隔约 31 天，保守扫描 180 天
  const [by, bm, bd] = birthDateStr.split('-').map(Number);

  let days = 0;
  for (let offset = 1; offset <= MAX_SCAN; offset++) {
    const d = new Date(by, bm - 1, bd + (isForward ? offset : -offset));
    const ds = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    const rec = await getLunarData(ds);
    // 只有"节"（jie: true）才作为起运界标
    if (rec && rec.solar_term && rec.solar_term.jie) {
      days = offset;
      break;
    }
  }

  if (days === 0) {
    // 降级：未找到节时（如出生在 2100 年边界附近），若 scan 内有气也要用
    // 全面降级：按出生日到出生月下一个月的天数估算
    return 3;
  }
  // 每3天对应1岁，精确到0.1岁
  const age = Math.round((days / 3) * 10) / 10;
  return Math.max(0.1, age); // 最小0.1岁
}

function calcDaYunNew(
  gender: 'male' | 'female',
  yearGan: string,
  monthPillar: Pillar,
  birthYear: number,
  startAge = 5
): DaYun[] {
  const isYangYear = TIAN_GAN.indexOf(yearGan) % 2 === 0;
  const isForward = (gender === 'male' && isYangYear) || (gender === 'female' && !isYangYear);

  const monthGanIdx = TIAN_GAN.indexOf(monthPillar.gan);
  const monthZhiIdx = DI_ZHI.indexOf(monthPillar.zhi);

  const result: DaYun[] = [];
  for (let i = 0; i < 8; i++) {
    const step = isForward ? i + 1 : -(i + 1);
    const ganIdx = ((monthGanIdx + step) % 10 + 10) % 10;
    const zhiIdx = ((monthZhiIdx + step) % 12 + 12) % 12;
    const age = Math.round((startAge + i * 10) * 10) / 10;
    result.push({
      startAge: age,
      gan: TIAN_GAN[ganIdx],
      zhi: DI_ZHI[zhiIdx],
      label: `${age}岁`,
    });
  }
  return result;
}

// ==================== 命理小结生成 ====================
/**
 * 根据日主天干、身强弱、喜忌神生成段落式命理小结
 */
function generateMingLiSummary(
  riZhu: string,
  strength: string,
  favorable: string[],
  unfavorable: string[],
  wuXing: WuXingCount,
  gender: 'male' | 'female',
  shiShen: Record<string, string>
): MingLiSummary {
  const wx = WU_XING_MAP[riZhu] ?? '未知';
  const favStr = favorable.join('、') || '未确定';
  const unfavStr = unfavorable.join('、') || '未确定';

  // 日主五行性格库
  const personalityBase: Record<string, string> = {
    '木': '木日主天生仁善，具有强烈的开拓欲与上进心，内心充满创造力与弹性。为人正直、重义气，对事业有执着与将心比心的赤诚感。然而木性有时易固守主观，遇到退让时内心容易较为曲折。',
    '火': '火日主热情活泼，思维敏锐且具有感染力，容易吸引他人目光。表达欲强，善于社交，对美好事物充满激情。但火性易情绪迅速降落，如不加以沉淀，小心过于冲动行事。',
    '土': '土日主安静实干，为人忠厚、包容力强，具有天生的信任感与责任心。做事踏实、不急不躁，善于统筹全局。不足之处在于有时过于守成，面对变化时决断力稍弱。',
    '金': '金日主意志坚定，执行力强，做事雷厉风行、求精求全。为人直接、重竞争，具有强烈的自尊心与原则性。需要注意的是，金性过刚则易折，学会柔中带刚方能走得更远。',
    '水': '水日主聪慧机智，适应力极强，善于审时度势。内心丰富、想象力层次丰富，具有天生的直觉与感知力。不足之处在于有时过于多虑，小心优犹豫豫而失去主动性。',
  };

  // 身强弱修正语
  const strengthMod: Record<string, string> = {
    '身强': `命局身强，日主气势旺盛，具备独当一面的能力与信心。喜用神为${favStr}，宜多与${favStr}行相关的领域发展。`,
    '身中': `命局阴阳较为均衡，日主气势平和，适应能力强。喜用神为${favStr}，运势平稳中将逐步上升。`,
    '身弱': `命局身弱，日主气势较薄，需要喜用神${favStr}来扶助。建议多借助他人力量，合作共赢方为上策。`,
  };

  // 事业方向库（日主五行 + 身强弱）
  const careerMap: Record<string, Record<string, string>> = {
    '木': {
      '身强': '木日身强者适合独立创业或主导管理，教育、法律、文化创意类行业尤为适合。喜用神得力之年事业发展迅速，建议投资自身技能提升。',
      '身中': '木日身中者注重平衡发展，教育、媒体、公益、设计类行业均可考虑。建议建立稳定的人脉资源，合作共赢效果佳。',
      '身弱': '木日身弱者适合在有组织支撑的环境中发展，建议从事小范围教育、辅助类工作。少独个创业，多借力平台和团队。',
    },
    '火': {
      '身强': '火日身强者适合于演艺、传媒、市场营销、公共关系等展现型行业。领导力强，适合担任高曝光度职位，事业高峰期将带来事业局面大幅扩展。',
      '身中': '火日身中者在娱乐、媒体、餐饮、旅游等行业均可发展。建议建立个人品牌，利用社交影响力拓展事业版图。',
      '身弱': '火日身弱者建议选择较为稳定的服务行业，避免过度曝光带来的压力。内容创作、广告设计等适合岗位小而精的方向可考虑。',
    },
    '土': {
      '身强': '土日身强者适合房地产、金融、建筑、农业等与土地相关的行业。管理能力出众，适合担任中高层管理职位，事业发展将带来可观的物质回报。',
      '身中': '土日身中者在行政、中介、服务管理等行业均能发展。建议建立实实在在的人脉网络，平稳积累是最大优势。',
      '身弱': '土日身弱者适合在大机构内从事行政或后勤工作，避免过度负责带来的压力。建议将精力集中在少数几个小目标上逐步稳定。',
    },
    '金': {
      '身强': '金日身强者适合金融投资、法律、军事、工程技术等需要决断力的行业。具有天生的领导气质，建议尽早建立自己的专业地盘。',
      '身中': '金日身中者在机械制造、工程、会计、媒体等行业均可发展。建议利用执行力强的优势，将想法切实落地。',
      '身弱': '金日身弱者适合在有规则、有保障的环境中工作，如公务员、会计、质检等。避免过度冒险，稳健第一。',
    },
    '水': {
      '身强': '水日身强者适合媒体、资讯、学术研究、心理和咨询等行业。思维深度与广度均优于常人，建议将智慧转化为具体的专业能力。',
      '身中': '水日身中者在娱乐、商贸、媒体、心理和咨询等行业均可发展。建议建立多元收入渠道，利用适应力强的优势拓展边界。',
      '身弱': '水日身弱者适合在安静的环境中工作，如写作、研究、设计等。避免高压力的销售或客服岗位，保持内心平静方能发挥最大潜能。',
    },
  };

  // 感情倾向库
  const relationshipMap: Record<string, Record<string, string>> = {
    '木': {
      '身强': '感情上主动且直接，对伴侣充满保护欲与责任心。身强木日有时过于强势，建议学会尊重伴侣的意愿与边界。喜用神为${favStr}得力时，感情运将有较大突破。',
      '身中': '感情温和而稳定，对伴侣忠诚且具包容心。建议多与伴侣分享内心感受，避免将工作压力带入感情。',
      '身弱': '感情上需要对方的理解与支持，建议选择能够给予安全感的伴侣。小心过度依赖或过度付出而忘记自我。',
    },
    '火': {
      '身强': '感情热烈且直接，易一见钟情。身强火日在感情中容易占主导地位，建议学会尊重伴侣的独立性。喜用神得力时感情运佳。',
      '身中': '感情中充满活力与浪漫感，对伴侣有天生的吸引力。建议在感情中保持适度的独立空间，不要将全部精力投入其中。',
      '身弱': '感情上需要稳定的伴侣来平衡内心的波动。建议选择成熟、包容的伴侣，避免将全部情绪寄托于对方。',
    },
    '土': {
      '身强': '感情忠诚且长久，对伴侣充满包容与安全感。身强土日有时过于守成，建议学会主动表达感情。喜用神得力时感情运将有实质性进展。',
      '身中': '感情平和而实质，对伴侣忠心耐心。建议在感情中多一些惊喜与新鲜感，避免过于平淡而失去活力。',
      '身弱': '感情上希望得到对方的安慰与支持，建议选择强大、包容的伴侣。小心在感情中过于负面思考。',
    },
    '金': {
      '身强': '感情上直接且具原则性，认就不认。身强金日在感情中容易过于强势，建议学会表达柔性的一面。喜用神得力时感情运将得到改善。',
      '身中': '感情中充满责任心与保护欲，对伴侣忠诚且可靠。建议在感情中多一些贴心与温柔，避免过于理性化。',
      '身弱': '感情上需要对方的包容与理解，建议选择成熟稳定的伴侣。小心因完美主义而对感情要求过高。',
    },
    '水': {
      '身强': '感情丰富且善解人意，具有天生的魅力与吸引力。身强水日有时感情过于复杂，建议学会直接表达感受。喜用神得力时感情运将得到实质性进展。',
      '身中': '感情中充满细腻与温柔，对伴侣具有天生的包容与理解。建议建立明确的感情边界，避免过度付出。',
      '身弱': '感情上需要对方的安全感与鼓励，建议选择强大、实干的伴侣。小心因过于敏感而将对方的无心之语过度解读。',
    },
  };

  // 运势提示
  const wxEntries = Object.entries(wuXing) as [string, number][];
  const maxWxEntry = wxEntries.reduce((a, b) => b[1] > a[1] ? b : a);
  const minWxEntry = wxEntries.reduce((a, b) => b[1] < a[1] ? b : a);
  const fortune = `就目前命局而言，${maxWxEntry[0]}行最旺，${minWxEntry[0]}行最弱。喜用神为${favStr}，忌神为${unfavStr}，建议在日常生活中多接触${favStr}行相关的事物与环境，避免${unfavStr}行的负面影响，方能将运势小宇宙持续向好。`;

  const strengthKey = strength as '身强' | '身中' | '身弱';

  return {
    overview: `命主${gender === 'male' ? '为男' : '为女'}，日主天干为${riZhu}（${wx}行），${strengthMod[strengthKey] ?? ''}喜用神为${favStr}，忌神为${unfavStr}。`,
    personality: personalityBase[wx] ?? `${wx}日主天干，性格内外兼备，具有天生的平衡感。`,
    career: careerMap[wx]?.[strengthKey] ?? `${wx}日主注重平衡发展，建议建立稳定的事业基础。`,
    relationship: relationshipMap[wx]?.[strengthKey] ?? `${wx}日主感情中充满责任心，对伴侣忠诚且包容。`,
    fortune,
  };
}

// ==================== P0 新增：四层过滤引擎 ====================

// 五行原始生克关系（多处复用）
const SHENG_RULE: Record<string, string> = { 木: '火', 火: '土', 土: '金', 金: '水', 水: '木' };
const KE_RULE: Record<string, string>   = { 木: '土', 土: '水', 水: '火', 火: '金', 金: '木' };

// 地支六合/六冲/三合（多处复用，前移至此）
const ZHI_HE_PAIRS_REF = new Set(['子丑', '丑子', '寅亥', '亥寅', '卯戌', '戌卯', '辰酉', '酉辰', '巳申', '申巳', '午未', '未午']);
const ZHI_SAN_HE_REF: string[][] = [['申', '子', '辰'], ['寅', '午', '戌'], ['巳', '酉', '丑'], ['亥', '卯', '未']];
const ZHI_CHONG_PAIRS_REF = new Set(['子午', '午子', '丑未', '未丑', '寅申', '申寅', '卯酉', '酉卯', '辰戌', '戌辰', '巳亥', '亥巳']);

/** 计算某五行的能量占比（0-1） */
function wxRatio(wx: WuXingCount, target: string): number {
  const total = wx.木 + wx.火 + wx.土 + wx.金 + wx.水;
  if (total === 0) return 0;
  return (wx[target as keyof WuXingCount] ?? 0) / total;
}

/**
 * L2 Climate_Sensor — 气候调候检测
 * 强制修正极端气候下的喜忌神
 */
function checkClimate(
  monthZhi: string,
  pillars: { year: Pillar; month: Pillar; day: Pillar; hour: Pillar },
  wx: WuXingCount,
  baseFavorable: string[],
  baseUnfavorable: string[]
): ClimateAlert {
  // 月令季节判断
  const SUMMER_BRANCHES = ['巳', '午', '未'];
  const WINTER_BRANCHES = ['亥', '子', '丑'];
  const isSummer = SUMMER_BRANCHES.includes(monthZhi);
  const isWinter = WINTER_BRANCHES.includes(monthZhi);

  const fireRatio = wxRatio(wx, '火');
  const waterRatio = wxRatio(wx, '水');
  const earthRatio = wxRatio(wx, '土');
  const fireEarthRatio = fireRatio + earthRatio;
  const waterMetalRatio = waterRatio + wxRatio(wx, '金');

  // 火炎土燥：夏季 + 火土占比 > 60%
  if (isSummer && fireEarthRatio > 0.60) {
    const severity = fireEarthRatio > 0.75 ? '极端' : '严重';
    return {
      active: true,
      type: 'fire_drought',
      description: `命局火炎土燥（火+土占比${Math.round(fireEarthRatio * 100)}%），${severity}失衡。满盘烈火，戊土焦燥，常规生克规则已不适用——燥土不生金反脆金，弱水入局即被蒸干。`,
      overrideFavorable: ['水', '金'],
      overrideUnfavorable: ['火', '木'],
      prioritization: '水 > 金 > 湿土（辰丑）> 木（微弱调候）',
    };
  }

  // 金寒水冷：冬季 + 水金占比 > 60%
  if (isWinter && waterMetalRatio > 0.60) {
    return {
      active: true,
      type: 'water_freeze',
      description: `命局金寒水冷（水+金占比${Math.round(waterMetalRatio * 100)}%），寒气凝结，万物不生的状态。此时最缺的是温暖——火是命局的太阳，木是助火的柴薪。`,
      overrideFavorable: ['火', '木'],
      overrideUnfavorable: ['水', '金'],
      prioritization: '火 > 木 > 燥土（未戌）> 水',
    };
  }

  return {
    active: false,
    type: 'neutral',
    description: '命局寒暖适中，气机流通正常。',
    prioritization: '按常规生克取用神',
  };
}

/**
 * L3 Flow_Analyzer — 气机流转分析
 * 检测五行生克链条是否失效（反生、反克、燥土脆金等）
 */
function analyzeFlow(
  pillars: { year: Pillar; month: Pillar; day: Pillar; hour: Pillar },
  wx: WuXingCount,
  climate: ClimateAlert
): FlowIssue[] {
  const issues: FlowIssue[] = [];
  const fireRatio = wxRatio(wx, '火');
  const earthRatio = wxRatio(wx, '土');
  const metalRatio = wxRatio(wx, '金');
  const waterRatio = wxRatio(wx, '水');
  const riZhuWx = WU_XING_MAP[pillars.day.gan] ?? '土';

  // 1）燥土脆金：火+土高，金低 → 燥土不生金反脆金
  if (climate.type === 'fire_drought' && earthRatio > 0.15 && metalRatio < 0.15) {
    issues.push({
      severity: 'critical',
      label: '燥土脆金',
      description: '先天性「土不生金」。命局中的戊土已被烈火烤焦，变成了脆金的干土。这意味着你的财富逻辑与常理截然不同——别人通过耕耘（土）获得收获（金），而你需要先灭火降温，金才能存活下来。',
    });
  }

  // 2）弱水克火反成灾：水占比很低但猛烈火旺
  if (waterRatio < 0.08 && fireRatio > 0.50) {
    issues.push({
      severity: 'warning',
      label: '杯水车薪',
      description: '弱水不克猛火，反被蒸发殆尽。命局中仅存的水元素犹如一滴水掉进熔炉——不仅不能降温，反而瞬间消失。这意味着你在现实中可能需要比常人更加珍惜「水」属性资源（冷静、规则、理性决策）。',
    });
  }

  // 3）用神被破：喜用神地支被冲克
  if (climate.overrideFavorable && climate.overrideFavorable.length > 0) {
    const favWx = climate.overrideFavorable[0]; // 第一优先级用神
    const favBranches = Object.entries(BRANCH_WU_XING)
      .filter(([, w]) => w === favWx)
      .map(([b]) => b);

    const allBranches = [pillars.year.zhi, pillars.month.zhi, pillars.day.zhi, pillars.hour.zhi];
    for (const fb of favBranches) {
      if (allBranches.includes(fb)) {
        // 看看是否被冲
        const opposing: Record<string, string> = {
          子: '午', 午: '子', 丑: '未', 未: '丑', 寅: '申', 申: '寅',
          卯: '酉', 酉: '卯', 辰: '戌', 戌: '辰', 巳: '亥', 亥: '巳',
        };
        if (opposing[fb] && allBranches.includes(opposing[fb])) {
          issues.push({
            severity: 'critical',
            label: '用神被冲',
            description: `喜用神「${favWx}」所在的地支「${fb}」被「${opposing[fb]}」冲克，命局的救命稻草正在被持续攻击。这意味着你人生中最重要的那个突破口，总是被自己的另一个特质所阻碍。`,
          });
          break;
        }
      }
    }
  }

  // 4）印星被伤：日主喜用中有印星但印星被财星克制
  const favSet = new Set(climate.overrideFavorable ?? []);
  if (favSet.has(SHENG_RULE[riZhuWx] ?? '')) {
    // 印星在喜用里
    const yinWx = SHENG_RULE[riZhuWx] ?? '';
    const keYinWx = KE_RULE[yinWx] ?? ''; // 克印的五行
    if (wxRatio(wx, keYinWx) > wxRatio(wx, yinWx)) {
      issues.push({
        severity: 'warning',
        label: '印星被制',
        description: `你的学习与成长机制（印星${yinWx}）被${keYinWx}压制。聪明容易停留在表面，深度思考被短期利益所干扰。`,
      });
    }
  }

  return issues;
}

/**
 * L4 Pattern_Detect — 格局定型
 * 从月令透干情况和十神分布中识别格局
 */
function detectPattern(
  pillars: { year: Pillar; month: Pillar; day: Pillar; hour: Pillar },
  wx: WuXingCount,
  shiShen: Record<string, string>,
  climate: ClimateAlert
): PatternResult {
  const dayGan = pillars.day.gan;
  const dayWx = WU_XING_MAP[dayGan] ?? '土';
  const monthZhi = pillars.month.zhi;
  const monthWx = BRANCH_WU_XING[monthZhi] ?? '土';

  // 统计十神分布
  const ssCount: Record<string, number> = {};
  for (const [, name] of Object.entries(shiShen)) {
    ssCount[name] = (ssCount[name] ?? 0) + 1;
  }

  // 透出天干的十神
  const exposedGans = [pillars.year.gan, pillars.month.gan, pillars.hour.gan];
  const exposedSS = exposedGans.map(g => SHI_SHEN_MAP[dayGan]?.[g] ?? '').filter(Boolean);

  const primary: PatternKeyword[] = [];
  const secondary: PatternKeyword[] = [];

  // 建禄格：月支为日主同五行（禄地）
  if (monthWx === dayWx) {
    primary.push('建禄格');
  }

  // 月令透出的格局（月支藏干中透出天干者优先）
  const monthHidden = ZANG_GAN_MAP[monthZhi] ?? {};
  const monthHiddenWx = new Set(Object.keys(monthHidden).map(g => WU_XING_MAP[g] ?? ''));

  // 伤官格
  const shangGuanCount = ssCount['伤官'] ?? 0;
  if (shangGuanCount >= 2 || (shangGuanCount >= 1 && exposedSS.includes('伤官'))) {
    primary.push('伤官格');
  }

  // 食神格
  const shiShenCC = ssCount['食神'] ?? 0;
  if (shiShenCC >= 2 && !primary.includes('伤官格')) {
    primary.push('食神格');
  }

  // 财格
  const zhengCai = ssCount['正财'] ?? 0;
  const pianCai = ssCount['偏财'] ?? 0;
  if (zhengCai + pianCai >= 2) {
    const type = zhengCai > pianCai ? '正财格' : '偏财格';
    primary.push(type);
  }

  // 官杀格
  const zhengGuan = ssCount['正官'] ?? 0;
  const qiSha = ssCount['七杀'] ?? 0;
  if (zhengGuan + qiSha >= 2) {
    const type = zhengGuan > qiSha ? '正官格' : '七杀格';
    primary.push(type);
  }

  // 印绶格
  const zhengYin = ssCount['正印'] ?? 0;
  const pianYin = ssCount['偏印'] ?? 0;
  if (zhengYin + pianYin >= 2) {
    const type = zhengYin > pianYin ? '正印格' : '偏印格';
    secondary.push(type);
  }

  // 没有主格时取月令
  if (primary.length === 0) {
    primary.push('建禄格');
  }

  // 从格判定：某个五行 > 70% 且日主被其主导，或日主自身占比极高
  const wxEntries = Object.entries(wx) as [string, number][];
  const maxWx = wxEntries.reduce((a, b) => b[1] > a[1] ? b : a);
  if (maxWx[1] / (wx.木 + wx.火 + wx.土 + wx.金 + wx.水) > 0.72) {
    secondary.push('从格');
  }

  // 组合描述
  const patternLabel = primary[0];
  const secondaryLabel = secondary.length > 0 ? secondary.join(' · ') : '';
  const fullLabel = [patternLabel, secondaryLabel].filter(Boolean).join(' · ');
  const desc = climate.active
    ? `${fullLabel} · ${climate.description.split('。')[0]}`
    : fullLabel + '，命局寒暖适中，格局通顺。';

  return {
    primary: patternLabel as PatternKeyword,
    secondary: secondary as PatternKeyword[],
    description: desc,
    keyStems: exposedSS.filter((s, i, arr) => arr.indexOf(s) === i),
  };
}

/**
 * 命局死穴检测 — 找到全局最脆弱的那个点
 */
function findDeadPoint(
  pillars: { year: Pillar; month: Pillar; day: Pillar; hour: Pillar },
  climate: ClimateAlert
): DeadPoint {
  const dayZhi = pillars.day.zhi;
  const allBranches = [pillars.year.zhi, pillars.month.zhi, pillars.day.zhi, pillars.hour.zhi];

  // 如果调候用神的水被冲克，死穴就是水
  if (climate.type === 'fire_drought') {
    const waterBranches = ['亥', '子'];
    for (const wb of waterBranches) {
      if (allBranches.includes(wb)) {
        const opposing: Record<string, string> = {
          子: '午', 亥: '巳',
        };
        for (const oppo of Object.values(opposing)) {
          if (allBranches.includes(oppo)) {
            return {
              target: wb,
              attacker: oppo,
              mechanism: `${wb}（唯一的水源）被${oppo}冲克`,
              insight: `你内心最柔软的地方，是对秩序与平静的渴望（${climate.type === 'fire_drought' ? '水' : '火'}）。但你总在快要触碰到它的那一刻，被自己的热情和冲动亲手推开。学会"降温"，不是你变弱了，而是你终于开始保护自己。`,
            };
          }
        }
      }
    }
    // 无水但火炎 → 日主本身即是死穴
    return {
      target: pillars.day.gan,
      attacker: '全局火',
      mechanism: '无水源命局，日主独木难支',
      insight: '你的能量是一团没有防火墙的野火。它照亮了所有人，却最先烧尽你自己。你需要的不是更多的激情，而是一套"过载保护系统"。',
    };
  }

  // 金寒水冷 → 死穴是火
  if (climate.type === 'water_freeze') {
    const fireBranches = ['巳', '午'];
    for (const fb of fireBranches) {
      if (allBranches.includes(fb)) {
        const opposing: Record<string, string> = { 巳: '亥', 午: '子' };
        if (opposing[fb] && allBranches.includes(opposing[fb])) {
          return {
            target: fb,
            attacker: opposing[fb],
            mechanism: `${fb}（唯一的热源）被${opposing[fb]}冲克`,
            insight: '你内心那一团小小的火苗，总是被理性和压抑的水流冲灭。你不是没有激情——你是不敢让它燃烧太久。走出你的思想深渊，相信你的直觉也值得被成全。',
          };
        }
      }
    }
  }

  // 默认：日支被冲
  const dayChong: Record<string, string> = {
    子: '午', 午: '子', 丑: '未', 未: '丑', 寅: '申', 申: '寅',
    卯: '酉', 酉: '卯', 辰: '戌', 戌: '辰', 巳: '亥', 亥: '巳',
  };
  for (const [target, attacker] of Object.entries(dayChong)) {
    if (target === dayZhi && allBranches.includes(attacker)) {
      return {
        target,
        attacker,
        mechanism: `日支${target}被${attacker}冲克，夫妻宫不安`,
        insight: '你最深层的安全感——感情的根基——正在被外部力量持续冲击。这不是感情的失败，而是你的命局结构决定了：你需要比大多数人更主动地去守护自己的情感世界。',
      };
    }
  }

  return {
    target: dayZhi,
    attacker: '',
    mechanism: '日支无冲克，但需关注大运流年的引动',
    insight: '你的根基相对稳固。珍惜这分平衡——在这个世界上，能保持情绪稳定的人，已经赢了一半。',
  };
}

/**
 * 一句击中 — 生成结果页首屏钩子
 */
function generateOneLineHit(
  riZhu: string,
  pattern: PatternResult,
  climate: ClimateAlert,
  deadPoint: DeadPoint
): OneLineHit {
  const wx = WU_XING_MAP[riZhu] ?? '火';
  const patternName = pattern.primary;

  // 核心矩阵：五行 + 格局 + 调候 → 语气 + 文案
  const matrix: Record<string, Record<string, { headline: string; subline: string; tone: string }>> = {
    '火': {
      'fire_drought': { headline: '你的才华是一团野火', subline: '照亮别人，烧毁自己', tone: '炽热' },
      'default': { headline: '热烈是你的武器', subline: '但别让它变成自毁的引信', tone: '炽热' },
    },
    '木': {
      'default': { headline: '你是一座自己生长的森林', subline: '不需要别人的阳光', tone: '通透' },
    },
    '土': {
      'default': { headline: '沉默是最高级的暴力', subline: '你的稳重是世界的基石', tone: '深邃' },
    },
    '金': {
      'default': { headline: '你生来锋利', subline: '不必为任何人磨去棱角', tone: '锐利' },
    },
    '水': {
      'water_freeze': { headline: '你在思想的深渊里游泳', subline: '但需要一束光来靠岸', tone: '冷静' },
      'default': { headline: '深海之下，暗流涌动', subline: '你的直觉比逻辑更准确', tone: '冷静' },
    },
  };

  const wxMatrix = matrix[wx] ?? matrix['火'];
  let hit: { headline: string; subline: string; tone: string };

  if (climate.active && wxMatrix[climate.type]) {
    hit = wxMatrix[climate.type];
  } else {
    hit = wxMatrix['default'];

    // 格局微调
    if (patternName.includes('伤官')) {
      hit = { headline: '你的大脑是一台革命机器', subline: '前提是别炸掉自己的电路板', tone: '锐利' };
    } else if (patternName.includes('财')) {
      hit = { headline: '财富是你血液里的本能', subline: '但真正的富有是内心的平衡', tone: '通透' };
    } else if (patternName.includes('杀')) {
      hit = { headline: '你活在规则与野心的战场上', subline: '赢是本能，不失控是修行', tone: '锐利' };
    } else if (patternName.includes('印')) {
      hit = { headline: '学识是你最锋利的武器', subline: '知识给了你翅膀，也给了你重量', tone: '深邃' };
    }
  }

  return { headline: hit.headline, subline: hit.subline, tone: hit.tone };
}

/**
 * 节气预警 — 未来4个关键节气窗口的提醒
 */
function generateSeasonalAlerts(
  monthZhi: string,
  climate: ClimateAlert,
  daYun: DaYun[]
): SeasonalAlert[] {
  const now = new Date();
  const y = now.getFullYear();

  // 2026年节气近似日期（公历）
  const SOLAR_TERMS_APPROX: Array<{ date: string; name: string; zhi: string }> = [
    { date: `${y}-07-07`,  name: '小暑', zhi: '未' },
    { date: `${y}-07-22`,  name: '大暑', zhi: '未' },
    { date: `${y}-08-07`,  name: '立秋', zhi: '申' },
    { date: `${y}-09-08`,  name: '白露', zhi: '酉' },
    { date: `${y}-10-08`,  name: '寒露', zhi: '戌' },
    { date: `${y}-11-07`,  name: '立冬', zhi: '亥' },
    { date: `${y}-12-07`,  name: '大雪', zhi: '子' },
    { date: `${y + 1}-01-06`, name: '小寒', zhi: '丑' },
  ];

  const alerts: SeasonalAlert[] = [];

  for (const term of SOLAR_TERMS_APPROX) {
    const termDate = new Date(term.date);
    if (termDate < now) continue; // 只取未来节气

    if (climate.type === 'fire_drought') {
      // 火炎土燥 — 夏季节气风险最高
      if (['巳', '午', '未'].includes(term.zhi)) {
        alerts.push({
          date: term.date,
          solarTerm: term.name,
          riskLevel: 'red',
          message: `火旺达到顶点——命局的"系统过载"风险进入全年最高状态。`,
          action: '减少重大签约和投资决策，避免情绪化争论，多接触水源环境。',
        });
      } else if (['申', '酉'].includes(term.zhi)) {
        alerts.push({
          date: term.date,
          solarTerm: term.name,
          riskLevel: 'yellow',
          message: `金气渐起，是最好的"液冷系统"开始运转的窗口。`,
          action: '适合开启新技能学习、财务规划和理性决策。抓住金气的清醒时刻。',
        });
      }
    } else if (climate.type === 'water_freeze') {
      if (['巳', '午'].includes(term.zhi)) {
        alerts.push({
          date: term.date,
          solarTerm: term.name,
          riskLevel: 'yellow',
          message: `难得的温暖窗口——你一整年里最有行动力的时刻。`,
          action: '把握窗口，推进重要决策和社交计划。',
        });
      }
    }

    if (alerts.length >= 4) break; // 最多4个预警
  }

  return alerts;
}

/**
 * 未来12个月运势预览
 * 基于日柱 + 流月干支的生克关系生成
 */
function generateMonthlyFortunes(
  pillars: { year: Pillar; month: Pillar; day: Pillar; hour: Pillar },
  favorable: string[],
  unfavorable: string[]
): MonthlyFortunePreview[] {
  const dayGan = pillars.day.gan;
  const dayZhi = pillars.day.zhi;
  const dayWx = WU_XING_MAP[dayGan] ?? '土';
  const now = new Date();

  // 流月地支序列表
  const LIU_MONTH_ZHI = ['寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥', '子', '丑'];

  const results: MonthlyFortunePreview[] = [];
  const favSet = new Set(favorable);
  const unfavSet = new Set(unfavorable);

  for (let offset = 0; offset < 12; offset++) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() + offset, 1);
    const label = `${monthDate.getMonth() + 1}月`;
    const ym = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, '0')}`;

    // 流月地支（从寅月开始）
    const lunarMonthIdx = (monthDate.getMonth() + 1) - 1; // 1=寅月(0), 2=卯月(1) ...
    const liuZhi = LIU_MONTH_ZHI[lunarMonthIdx % 12];
    const liuWx = BRANCH_WU_XING[liuZhi] ?? '土';

    // 基于流月五行 + 日主关系计算基础分
    let base = 60;
    if (favSet.has(liuWx)) base += 18;
    else if (unfavSet.has(liuWx)) base -= 18;
    else if (SHENG_RULE[dayWx] === liuWx) base += 8;  // 日主生月 = 泄
    else if (SHENG_RULE[liuWx] === dayWx) base += 12;  // 月生日主 = 生
    else if (KE_RULE[dayWx] === liuWx) base -= 10; // 日主克月 = 耗
    else if (KE_RULE[liuWx] === dayWx) base -= 14; // 月克日主 = 克

    // 日支与流月地支的关系
    if (ZHI_HE_PAIRS_REF.has(dayZhi + liuZhi)) base += 8;
    if (ZHI_CHONG_PAIRS_REF.has(dayZhi + liuZhi)) base -= 12;

    const overall = Math.min(100, Math.max(10, base));
    const career = Math.min(100, Math.max(10, overall + Math.round((Math.random() - 0.5) * 12)));
    const wealth = Math.min(100, Math.max(10, overall + Math.round((Math.random() - 0.5) * 10)));
    const love = Math.min(100, Math.max(10, overall + Math.round((Math.random() - 0.5) * 14)));
    const health = Math.min(100, Math.max(10, overall + Math.round((Math.random() - 0.5) * 10)));

    // 事件标签
    let eventTag = '';
    const overallLabel = overall >= 85 ? '大吉' : overall >= 70 ? '吉' : overall >= 50 ? '平' : overall >= 35 ? '小凶' : '凶';
    if (overall >= 85) eventTag = '高光时刻';
    else if (overall >= 70) eventTag = '稳步推进';
    else if (overall >= 50) eventTag = '守成为主';
    else if (overall >= 35) eventTag = '谨慎行事';
    else eventTag = '以退为进';

    results.push({ label, ym, overall, career, wealth, love, health, eventTag });
  }

  return results;
}

// ==================== 主计算函数 ====================
export interface PersonInput {
  name: string;
  gender: 'male' | 'female';
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  calendar: 'gregorian' | 'lunar';
  /** 是否为农历闰月（仅 calendar='lunar' 时有效） */
  isLeapMonth?: boolean;
  birthplace?: string;
  /** 城市名称（用于显示） */
  cityName?: string;
  /** 出生地经度（用于真太阳时修正） */
  lng?: number;
  /** 出生地纬度 */
  lat?: number;
  /** 时区，如 '+8' */
  timezone?: string;
}

/**
 * 公历日期转为查表用 dateStr（YYYY-MM-DD）
 */
function toDateStr(y: number, m: number, d: number): string {
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

/**
 * 农历转公历：给定农历年月日，返回对应公历日期字符串
 * 简化实现：扫描当年平均天数范围内的每一天，匹配 lunar_month/lunar_day
 */
async function lunarToSolar(
  lunarYear: number,
  lunarMonth: number,
  lunarDay: number,
  isLeap = false
): Promise<string | null> {
  // 扫描该农历年对应的公历年份范围（农历年可能跨公历年）
  for (let cy = lunarYear; cy <= lunarYear + 1; cy++) {
    for (let cm = 1; cm <= 12; cm++) {
      const daysInMonth = new Date(cy, cm, 0).getDate();
      for (let cd = 1; cd <= daysInMonth; cd++) {
        const ds = toDateStr(cy, cm, cd);
        const rec = await getLunarData(ds);
        if (
          rec &&
          rec.lunar_year === lunarYear &&
          rec.lunar_month === lunarMonth &&
          rec.lunar_day === lunarDay &&
          (rec.is_leap === true) === isLeap
        ) {
          return ds;
        }
      }
    }
  }
  return null;
}

/**
 * 均时差查表（Equation of Time，单位：分钟）
 * 每个元素对应公历一天（1月ㄒ1日 → 12月ㄱ 31日）
 * 数据来源：美国海军天文台 USNO 均时差表（平均値）
 */
const EQUATION_OF_TIME: number[] = [
  // Jan  1-31
  -3,-4,-5,-6,-7,-8,-9,-10,-11,-12,-13,-13,-14,-14,-14,-14,-14,-14,-14,-13,-13,-12,-12,-11,-10,-9,-8,-7,-6,-5,-4,
  // Feb  1-29
  -3,-2,-1,0,1,2,3,4,5,6,7,8,9,10,11,12,13,13,14,14,14,14,14,14,14,13,13,13,12,
  // Mar  1-31
  12,11,10,9,8,7,6,5,4,3,2,1,0,-1,-2,-3,-4,-5,-6,-7,-8,-9,-9,-10,-11,-12,-12,-13,-13,-14,-14,
  // Apr  1-30
  -14,-14,-14,-14,-14,-14,-13,-13,-13,-12,-12,-11,-11,-10,-9,-9,-8,-7,-6,-5,-5,-4,-3,-2,-1,0,1,2,3,4,
  // May  1-31
  4,5,6,7,8,9,10,11,11,12,13,13,14,14,15,15,15,16,16,16,16,16,16,16,16,16,15,15,15,14,14,
  // Jun  1-30
  13,13,12,11,11,10,9,8,7,6,5,4,3,2,1,0,-1,-2,-3,-4,-5,-6,-7,-8,-9,-10,-11,-12,-13,-14,
  // Jul  1-31
  -14,-15,-16,-16,-17,-17,-17,-17,-17,-17,-17,-16,-16,-15,-15,-14,-13,-13,-12,-11,-10,-9,-8,-7,-6,-5,-4,-3,-2,-1,0,
  // Aug  1-31
  1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,17,18,18,19,19,19,19,19,19,18,18,17,17,16,
  // Sep  1-30
  15,14,13,12,11,10,9,8,7,5,4,3,2,1,-1,-2,-3,-4,-5,-6,-7,-8,-9,-10,-11,-12,-13,-14,-15,-16,
  // Oct  1-31
  -17,-18,-19,-20,-21,-22,-23,-24,-24,-25,-25,-25,-25,-25,-25,-25,-25,-25,-24,-24,-23,-23,-22,-21,-20,-19,-18,-17,-16,-15,-14,
  // Nov  1-30
  -13,-12,-11,-9,-8,-7,-6,-4,-3,-2,-1,1,2,3,5,6,7,8,10,11,12,13,14,15,16,16,15,14,13,12,
  // Dec  1-31
  11,10,9,8,7,5,4,3,2,1,0,-1,-2,-3,-4,-5,-6,-7,-8,-9,-10,-11,-12,-13,-14,-15,-15,-15,-14,-13,-12,
];

/**
 * 根据公历月日获取均时差（分钟）
 * @param month 月（1-12）
 * @param day 日（1-31）
 */
function getEquationOfTime(month: number, day: number, year?: number): number {
  // 判断闰年：能被4整除但不能被100整除，或能被400整除
  const isLeap = year !== undefined && (year % 4 === 0 && year % 100 !== 0 || year % 400 === 0);
  const DAYS_IN_MONTH = [0, 31, isLeap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  let dayOfYear = 0;
  for (let m = 1; m < month; m++) dayOfYear += DAYS_IN_MONTH[m];
  dayOfYear += day - 1; // 0-indexed
  return EQUATION_OF_TIME[Math.min(dayOfYear, EQUATION_OF_TIME.length - 1)];
}

/**
 * 真太阳时修正：平太阳时 -> 真太阳时
 * 公式：真太阳时 = 平太阳时 + (经度 - 标准时区经度) × 4 + 均时差
 * 中国标准时区经度 = 120°E（UTC+8）
 */
function applyTrueSolarTime(
  hour: number, minute: number,
  lng: number | undefined,
  timezone: string | undefined,
  month?: number,
  day?: number,
  year?: number
): { hour: number; minute: number; dayOffset: number } {
  if (lng === undefined) return { hour, minute, dayOffset: 0 };
  // 解析时区偏移（如 '+8' 表示 UTC+8，对应经度 120°）
  const tzOffset = timezone ? parseFloat(timezone) : 8;
  const stdLng = tzOffset * 15; // 标准时区经度
  const lonOffset = (lng - stdLng) * 4; // 经度偏移（分钟）
  const eot = (month !== undefined && day !== undefined) ? getEquationOfTime(month, day, year) : 0;
  const diffMinutes = Math.round(lonOffset + eot); // 经度偏移 + 均时差
  let totalMinutes = hour * 60 + minute + diffMinutes;
  let dayOffset = 0;
  if (totalMinutes < 0) { totalMinutes += 1440; dayOffset = -1; }
  else if (totalMinutes >= 1440) { totalMinutes -= 1440; dayOffset = 1; }
  return { hour: Math.floor(totalMinutes / 60), minute: totalMinutes % 60, dayOffset };
}

export async function calcSingleBazi(person: PersonInput): Promise<SingleBaziResult> {
  const { name, gender, year, month, day, calendar, lng, timezone, cityName, isLeapMonth } = person;
  let { hour, minute } = person;

  // 真太阳时修正（如果提供了经度）
  // 公式：真太阳时 = 平太阳时 + (经度 - 标准时区经度) × 4 + 均时差
  let trueSolarNote = '';
  let trueSolarOffset: number | undefined;
  if (lng !== undefined) {
    const tst = applyTrueSolarTime(hour, minute, lng, timezone, month, day, year);
    const tzOffset = timezone ? parseFloat(timezone) : 8;
    const stdLng = tzOffset * 15;
    const eot = getEquationOfTime(month, day, year);
    trueSolarOffset = Math.round((lng - stdLng) * 4 + eot); // 经度偏移 + 均时差
    if (tst.hour !== hour || tst.minute !== minute) {
      trueSolarNote = `（真太阳时 ${String(tst.hour).padStart(2,'0')}:${String(tst.minute).padStart(2,'0')}）`;
    }
    hour = tst.hour;
    minute = tst.minute;
    // 日期偏移处理（跨日情况暂不处理，实际中国城市偏差小于 2h）
  }

  // 确定公历日期字符串
  let solarDateStr: string;
  let displayYear = year, displayMonth = month, displayDay = day;

  if (calendar === 'lunar') {
    // 农历转公历（闰月时传入 isLeap=true）
    const converted = await lunarToSolar(year, month, day, isLeapMonth === true);
    if (!converted) {
      const leapLabel = isLeapMonth ? '闰' : '';
      throw new Error(`无法将农历 ${year}年${leapLabel}${month}月${day}日 转换为公历，请确认日期在 1900-2100 年内`);
    }
    solarDateStr = converted;
    const parts = converted.split('-').map(Number);
    displayYear = parts[0]; displayMonth = parts[1]; displayDay = parts[2];
  } else {
    solarDateStr = toDateStr(year, month, day);
  }

  // 查表获取干支
  const rec = await getLunarData(solarDateStr);
  if (!rec) {
    throw new Error(`未找到 ${solarDateStr} 的农历数据，请确认日期在 1900-2100 年内`);
  }

  const shiZhu = getShiZhu(rec.day_ganzhi, hour, minute);

  const pillars = {
    year: parsePillar(rec.year_ganzhi),
    month: parsePillar(rec.month_ganzhi),
    day: parsePillar(rec.day_ganzhi),
    hour: parsePillar(shiZhu || rec.day_ganzhi), // 时柱计算失败时降级为日柱
  };

  const wuXing = calcWuXingWeighted(pillars);
  const strength = analyzeStrength(pillars, wuXing);
  const shiShen = calcShiShen(pillars); // 先算十神，后续需要

  // P0：四层过滤引擎 → 确定喜忌
  const baseFavUnfav = determineFavorable(pillars.day.gan, strength);
  const climate = checkClimate(pillars.month.zhi, pillars, wuXing, baseFavUnfav.favorable, baseFavUnfav.unfavorable);
  // 如果气候触发调候覆盖，使用覆盖的喜忌
  const favorable = climate.active && climate.overrideFavorable ? climate.overrideFavorable : baseFavUnfav.favorable;
  const unfavorable = climate.active && climate.overrideUnfavorable ? climate.overrideUnfavorable : baseFavUnfav.unfavorable;
  const flowIssues = analyzeFlow(pillars, wuXing, climate);
  const pattern = detectPattern(pillars, wuXing, shiShen, climate);

  // 计算精确起运年龄（基于出生日到最近节气的天数）
  const isYangYear = TIAN_GAN.indexOf(pillars.year.gan) % 2 === 0;
  const isForward = (gender === 'male' && isYangYear) || (gender === 'female' && !isYangYear);
  const qiYunAge = await calcQiYunAge(solarDateStr, isForward);

  const daYun = calcDaYunNew(gender, pillars.year.gan, pillars.month, year, qiYunAge);
  const shensha = calcShensha(pillars);

  // P0：死穴 + 一句击中 + 节气预警 + 月运预览
  const deadPoint = findDeadPoint(pillars, climate);
  const oneLineHit = generateOneLineHit(pillars.day.gan, pattern, climate, deadPoint);
  const seasonalAlerts = generateSeasonalAlerts(pillars.month.zhi, climate, daYun);
  const monthlyFortunes = generateMonthlyFortunes(pillars, favorable, unfavorable);

  const calStr = calendar === 'lunar' ? '农历' : '公历';
  const leapPrefix = (calendar === 'lunar' && isLeapMonth) ? '闰' : '';
  // 展示用的出生时间（如有真太阳时修正则附加注释）
  const origHour = person.hour, origMin = person.minute;
  const birthStr = `${calStr} ${year}年${leapPrefix}${month}月${day}日 ${String(origHour).padStart(2, '0')}:${String(origMin).padStart(2, '0')}${trueSolarNote}`;

  const mingLiSummary = generateMingLiSummary(
    pillars.day.gan,
    strength,
    favorable,
    unfavorable,
    wuXing,
    gender,
    shiShen
  );

  return {
    name,
    gender,
    birthStr,
    year: pillars.year,
    month: pillars.month,
    day: pillars.day,
    hour: pillars.hour,
    wuXing,
    strength,
    favorable,
    unfavorable,
    daYun,
    shensha,
    shiShen,
    riZhu: pillars.day.gan,
    mingLiSummary,
    // P0 新增字段
    pattern,
    climate,
    flowIssues,
    deadPoint,
    oneLineHit,
    seasonalAlerts,
    monthlyFortunes,
    // 出生地信息
    ...(cityName ? { birthCity: cityName } : {}),
    ...(lng !== undefined ? { birthLng: lng } : {}),
    ...(trueSolarOffset !== undefined ? { trueSolarOffset } : {}),
    ...(trueSolarNote ? { trueSolarNote } : {}),
  };
}

// ── 纳音五行表（六十甲子） ──────────────────────────────────────────────────
const NAYIN_MAP: Record<string, string> = {
  '甲子': '海中金', '乙丑': '海中金', '丙寅': '炉中火', '丁卯': '炉中火',
  '戊辰': '大林木', '己巳': '大林木', '庚午': '路旁土', '辛未': '路旁土',
  '壬申': '剑锋金', '癸酉': '剑锋金', '甲戌': '山头火', '乙亥': '山头火',
  '丙子': '涧下水', '丁丑': '涧下水', '戊寅': '城头土', '己卯': '城头土',
  '庚辰': '白蜡金', '辛巳': '白蜡金', '壬午': '杨柳木', '癸未': '杨柳木',
  '甲申': '泉中水', '乙酉': '泉中水', '丙戌': '屋上土', '丁亥': '屋上土',
  '戊子': '霹雳火', '己丑': '霹雳火', '庚寅': '松柏木', '辛卯': '松柏木',
  '壬辰': '长流水', '癸巳': '长流水', '甲午': '沙中金', '乙未': '沙中金',
  '丙申': '山下火', '丁酉': '山下火', '戊戌': '平地木', '己亥': '平地木',
  '庚子': '壁上土', '辛丑': '壁上土', '壬寅': '金箔金', '癸卯': '金箔金',
  '甲辰': '覆灯火', '乙巳': '覆灯火', '丙午': '天河水', '丁未': '天河水',
  '戊申': '大驿土', '己酉': '大驿土', '庚戌': '钗钏金', '辛亥': '钗钏金',
  '壬子': '桑柘木', '癸丑': '桑柘木', '甲寅': '大溪水', '乙卯': '大溪水',
  '丙辰': '沙中土', '丁巳': '沙中土', '戊午': '天上火', '己未': '天上火',
  '庚申': '石榴木', '辛酉': '石榴木', '壬戌': '大海水', '癸亥': '大海水',
};

// 地支六合（吉合）
const ZHI_HE_PAIRS = new Set(['子丑', '丑子', '寅亥', '亥寅', '卯戌', '戌卯', '辰酉', '酉辰', '巳申', '申巳', '午未', '未午']);
// 地支三合局
const ZHI_SAN_HE: string[][] = [['申', '子', '辰'], ['寅', '午', '戌'], ['巳', '酉', '丑'], ['亥', '卯', '未']];
// 地支六冲（凶）
const ZHI_CHONG_PAIRS = new Set(['子午', '午子', '丑未', '未丑', '寅申', '申寅', '卯酉', '酉卯', '辰戌', '戌辰', '巳亥', '亥巳']);
// 天干五合
const GAN_HE_PAIRS = new Set(['甲己', '己甲', '乙庚', '庚乙', '丙辛', '辛丙', '丁壬', '壬丁', '戊癸', '癸戊']);

function getNayin(gan: string, zhi: string): string {
  return NAYIN_MAP[gan + zhi] ?? '';
}

function getNayinWuXing(nayin: string): string {
  if (nayin.includes('金')) return '金';
  if (nayin.includes('木')) return '木';
  if (nayin.includes('水')) return '水';
  if (nayin.includes('火')) return '火';
  if (nayin.includes('土')) return '土';
  return '';
}

export async function calcDoubleBazi(person1: PersonInput, person2: PersonInput): Promise<DoubleBaziResult> {
  const [bazi1, bazi2] = await Promise.all([calcSingleBazi(person1), calcSingleBazi(person2)]);

  // ── 维度一：五行互补（权重 0.30）────────────────────────────────────────────
  const wuxingDiff =
    Math.abs(bazi1.wuXing.木 - bazi2.wuXing.木) +
    Math.abs(bazi1.wuXing.火 - bazi2.wuXing.火) +
    Math.abs(bazi1.wuXing.土 - bazi2.wuXing.土) +
    Math.abs(bazi1.wuXing.金 - bazi2.wuXing.金) +
    Math.abs(bazi1.wuXing.水 - bazi2.wuXing.水);
  const wxScore = Math.round(Math.max(0, 100 - wuxingDiff * 6));
  const wxDetail = wuxingDiff < 3 ? '五行高度互补，相辅相成' :
    wuxingDiff < 8 ? '五行有一定互补' : '五行偏差较大，需多包容';

  // ── 维度二：日主生克关系（权重 0.25）────────────────────────────────────────
  const dayGan1 = bazi1.day.gan;
  const dayGan2 = bazi2.day.gan;
  const wx1 = WU_XING_MAP[dayGan1];
  const wx2 = WU_XING_MAP[dayGan2];
  // 五行生克关系
  const SHENG: Record<string, string> = { 木: '火', 火: '土', 土: '金', 金: '水', 水: '木' };
  const KE: Record<string, string> = { 木: '土', 土: '水', 水: '火', 火: '金', 金: '木' };
  let dayRelScore = 60;
  let dayRelDetail = '日主五行中性';
  if (wx1 === wx2) { dayRelScore = 75; dayRelDetail = '日主同五行，志趣相投'; }
  else if (SHENG[wx1] === wx2 || SHENG[wx2] === wx1) { dayRelScore = 90; dayRelDetail = '日主相生，感情滋养'; }
  else if (KE[wx1] === wx2 || KE[wx2] === wx1) { dayRelScore = 35; dayRelDetail = '日主相克，需要磨合'; }
  // 天干五合加成
  if (GAN_HE_PAIRS.has(dayGan1 + dayGan2)) { dayRelScore = Math.min(100, dayRelScore + 15); dayRelDetail += '，天干化合'; }

  // ── 维度三：地支合冲（权重 0.20）────────────────────────────────────────────
  const dayZhi1 = bazi1.day.zhi;
  const dayZhi2 = bazi2.day.zhi;
  let zhiScore = 60;
  let zhiDetail = '日支无特殊关系';
  if (ZHI_HE_PAIRS.has(dayZhi1 + dayZhi2)) { zhiScore = 92; zhiDetail = '日支六合，情投意合'; }
  else if (ZHI_CHONG_PAIRS.has(dayZhi1 + dayZhi2)) { zhiScore = 30; zhiDetail = '日支相冲，容易争执'; }
  else {
    // 三合局检查（两人日支是否同属一个三合局）
    const inSameHe = ZHI_SAN_HE.some(g => g.includes(dayZhi1) && g.includes(dayZhi2));
    if (inSameHe) { zhiScore = 82; zhiDetail = '日支三合，志同道合'; }
  }

  // ── 维度四：纳音相生（权重 0.15）────────────────────────────────────────────
  const nayin1 = getNayin(bazi1.year.gan, bazi1.year.zhi);
  const nayin2 = getNayin(bazi2.year.gan, bazi2.year.zhi);
  const nayinWx1 = getNayinWuXing(nayin1);
  const nayinWx2 = getNayinWuXing(nayin2);
  let nayinScore = 60;
  let nayinDetail = nayin1 && nayin2 ? `${nayin1}×${nayin2}，纳音中性` : '纳音关系中性';
  if (nayinWx1 && nayinWx2) {
    if (nayinWx1 === nayinWx2) { nayinScore = 78; nayinDetail = `${nayin1}×${nayin2}，同类相亲`; }
    else if (SHENG[nayinWx1] === nayinWx2 || SHENG[nayinWx2] === nayinWx1) {
      nayinScore = 88; nayinDetail = `${nayin1}×${nayin2}，纳音相生`;
    } else if (KE[nayinWx1] === nayinWx2 || KE[nayinWx2] === nayinWx1) {
      nayinScore = 40; nayinDetail = `${nayin1}×${nayin2}，纳音相克`;
    }
  }

  // ── 维度五：喜忌互补（权重 0.10）────────────────────────────────────────────
  const fav1 = new Set(bazi1.favorable);
  const fav2 = new Set(bazi2.favorable);
  const unfav1 = new Set(bazi1.unfavorable);
  const unfav2 = new Set(bazi2.unfavorable);
  let clashCount = 0;
  bazi1.favorable.forEach(f => { if (unfav2.has(f)) clashCount++; });
  bazi2.favorable.forEach(f => { if (unfav1.has(f)) clashCount++; });
  let complementCount = 0;
  bazi1.favorable.forEach(f => { if (fav2.has(f)) complementCount++; });
  const xijScore = Math.max(20, Math.min(100, 70 + complementCount * 10 - clashCount * 15));
  const xijDetail = clashCount > 1 ? '喜忌冲突较多，需相互理解' :
    complementCount > 1 ? '喜用相同，目标一致' : '喜忌基本相容';

  // ── 加权综合得分 ─────────────────────────────────────────────────────────────
  const scoreDetails: ScoreDimension[] = [
    { label: '五行互补', score: wxScore,      weight: 0.30, detail: wxDetail },
    { label: '日主生克', score: dayRelScore,  weight: 0.25, detail: dayRelDetail },
    { label: '地支合冲', score: zhiScore,     weight: 0.20, detail: zhiDetail },
    { label: '纳音相生', score: nayinScore,   weight: 0.15, detail: nayinDetail },
    { label: '喜忌互补', score: xijScore,     weight: 0.10, detail: xijDetail },
  ];
  const totalScore = scoreDetails.reduce((sum, d) => sum + d.score * d.weight, 0);
  const score = Math.min(100, Math.max(0, Math.round(totalScore)));

  const rating =
    score >= 85 ? '天作之合' :
    score >= 75 ? '非常合适' :
    score >= 65 ? '比较合适' :
    score >= 55 ? '需要磨合' : '不太合适';

  return { person1: bazi1, person2: bazi2, score, rating, scoreDetails };
}

// ==================== 兼容旧接口（供现有组件使用） ====================
export async function calcBazi(
  name: string,
  gender: 'male' | 'female',
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number
): Promise<SingleBaziResult> {
  return calcSingleBazi({
    name, gender, year, month, day, hour, minute,
    calendar: 'gregorian',
  });
}

// ==================== 今日运势 ====================

export interface DailyFortuneDimension {
  label: string;   // 维度名称（事业、财运、感情、健康）
  score: number;   // 0-100
  tip: string;     // 简短提示
}

export interface DailyFortune {
  date: string;           // 如「2026年5月24日」
  todayGan: string;       // 今日天干
  todayZhi: string;       // 今日地支
  todayWx: string;        // 今日日柱五行
  overallScore: number;   // 综合运势 0-100
  overallLabel: string;   // 大吉 / 吉 / 平 / 小凶 / 凶
  overallTip: string;     // 一句话总结
  dimensions: DailyFortuneDimension[];
  luckyColor: string;     // 幸运颜色
  luckyDirection: string; // 幸运方位
  avoidTip: string;       // 今日宜忌
}

/** 根据公历日期计算当日干支（使用甲子纪日法，以2000-01-07甲子日为基准） */
export function getTodayPillar(date: Date = new Date()): { gan: string; zhi: string } {
  const BASE = new Date(2000, 0, 7); // 甲子日（2000-01-07）
  const diffMs = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
    - Date.UTC(BASE.getFullYear(), BASE.getMonth(), BASE.getDate());
  const diffDays = Math.round(diffMs / 86400000);
  const ganIdx = ((diffDays % 10) + 10) % 10;
  const zhiIdx = ((diffDays % 12) + 12) % 12;
  return { gan: TIAN_GAN[ganIdx], zhi: DI_ZHI[zhiIdx] };
}

/** 简易 hash：将任意字符串映射为 [0, 1) 的伪随机数 */
function seededRandom(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = ((h << 5) - h + seed.charCodeAt(i)) | 0;
  }
  return Math.abs(h) / 0x80000000;
}

/** 根据日期生成固定种子字符串 */
function dateSeed(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

/** 计算今日运势 */
export function calcDailyFortune(result: SingleBaziResult, date: Date = new Date()): DailyFortune {
  const seed = dateSeed(date);
  const { gan: todayGan, zhi: todayZhi } = getTodayPillar(date);
  const todayWx = WU_XING_MAP[todayGan] ?? '土';
  const todayZhiWx = BRANCH_WU_XING[todayZhi] ?? '土';

  const SHENG: Record<string, string> = { 木: '火', 火: '土', 土: '金', 金: '水', 水: '木' };
  const KE: Record<string, string>   = { 木: '土', 土: '水', 水: '火', 火: '金', 金: '木' };

  const riZhuWx = WU_XING_MAP[result.riZhu] ?? '土';
  const favSet = new Set(result.favorable);
  const unfavSet = new Set(result.unfavorable);

  /** 单个五行对命主的影响分（0-100）— 基于日期 hash 确定性计算 */
  function wxScore(wx: string, salt: number): number {
    const s = `${seed}-${wx}-${salt}`;
    if (favSet.has(wx)) return 85 + seededRandom(s) * 10;
    if (unfavSet.has(wx)) return 20 + seededRandom(s) * 15;
    if (SHENG[wx] === riZhuWx) return 75 + seededRandom(s) * 10;
    if (SHENG[riZhuWx] === wx) return 70 + seededRandom(s) * 10;
    if (KE[wx] === riZhuWx) return 25 + seededRandom(s) * 15;
    if (KE[riZhuWx] === wx) return 60 + seededRandom(s) * 10;
    return 55 + seededRandom(s) * 15;
  }

  // 天干分（权重0.6）+ 地支分（权重0.4）
  const ganS = wxScore(todayWx, 0);
  const zhiS = wxScore(todayZhiWx, 1);
  const base = Math.round(ganS * 0.6 + zhiS * 0.4);

  // 地支六合/六冲调整
  const dayZhi = result.day.zhi;
  let adj = 0;
  if (ZHI_HE_PAIRS.has(todayZhi + dayZhi)) adj += 8;
  if (ZHI_CHONG_PAIRS.has(todayZhi + dayZhi)) adj -= 12;
  // 天干五合
  if (GAN_HE_PAIRS.has(todayGan + result.day.gan)) adj += 6;

  const overallScore = Math.min(100, Math.max(10, base + adj));

  const overallLabel =
    overallScore >= 85 ? '大吉' :
    overallScore >= 70 ? '吉'   :
    overallScore >= 50 ? '平'   :
    overallScore >= 35 ? '小凶' : '凶';

  // 各维度得分（在综合分基础上加小幅确定性偏差）
  function dimScore(offset: number, salt: number): number {
    const s = seededRandom(`${seed}-dim-${salt}`);
    return Math.min(100, Math.max(10, Math.round(overallScore + offset + (s - 0.5) * 14)));
  }

  // 维度提示库
  const careerTips: Record<string, string> = {
    大吉: '思路清晰，决策果断，适合推进重要项目或谈判。',
    吉:   '工作顺畅，贵人相助，可主动争取新机会。',
    平:   '按部就班为宜，避免冒进，稳中求胜。',
    小凶: '易遇阻碍，保持耐心，不宜做重大决定。',
    凶:   '压力较大，宜低调行事，避免正面冲突。',
  };
  const wealthTips: Record<string, string> = {
    大吉: '财运旺盛，适合投资或谈合作，收益可期。',
    吉:   '有小财入，日常消费顺畅，可适度理财。',
    平:   '收支平衡，不宜大额投资，守成为主。',
    小凶: '财运偏弱，谨防冲动消费，避免借贷。',
    凶:   '财运低迷，暂缓大额支出，以稳为先。',
  };
  const loveTips: Record<string, string> = {
    大吉: '桃花运旺，感情升温，适合表白或约会。',
    吉:   '感情和谐，沟通顺畅，关系稳步推进。',
    平:   '感情平稳，保持真诚，避免无谓争执。',
    小凶: '易生误解，多倾听少抱怨，以柔克刚。',
    凶:   '感情波动，冷静处理矛盾，避免冲动言行。',
  };
  const healthTips: Record<string, string> = {
    大吉: '精力充沛，适合运动或户外活动，状态极佳。',
    吉:   '身体状态良好，保持规律作息即可。',
    平:   '注意劳逸结合，避免熬夜，补充水分。',
    小凶: '易感疲劳，注意休息，避免剧烈运动。',
    凶:   '身体较弱，多休息，注意饮食清淡。',
  };

  const careerScore = dimScore(+3, 0);
  const wealthScore = dimScore(-2, 1);
  const loveScore   = dimScore(+1, 2);
  const healthScore = dimScore(-1, 3);

  const getLabel = (s: number) =>
    s >= 85 ? '大吉' : s >= 70 ? '吉' : s >= 50 ? '平' : s >= 35 ? '小凶' : '凶';

  // 幸运颜色（喜用神五行对应颜色）
  const wxColorName: Record<string, string> = {
    木: '绿色', 火: '红色', 土: '黄色', 金: '白色', 水: '黑色/蓝色',
  };
  const luckyWx = result.favorable[0] ?? todayWx;
  const luckyColor = wxColorName[luckyWx] ?? '金色';

  // 幸运方位（五行对应方位）
  const wxDirection: Record<string, string> = {
    木: '东方', 火: '南方', 土: '中央', 金: '西方', 水: '北方',
  };
  const luckyDirection = wxDirection[luckyWx] ?? '中央';

  // 宜忌
  const yiJi = overallScore >= 70
    ? `宜：出行、社交、签约。忌：${unfavSet.size > 0 ? `接触${Array.from(unfavSet).join('、')}行事物` : '过度劳累'}。`
    : overallScore >= 50
    ? `宜：稳健行事、整理规划。忌：冲动决策、大额消费。`
    : `宜：休养生息、低调行事。忌：争执、投资、重大决定。`;

  // 日期格式化
  const dateStr = `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;

  // 一句话总结
  const overallTipMap: Record<string, string[]> = {
    大吉: ['今日天时地利俱佳，把握机遇，大展身手。', '运势旺盛，诸事顺遂，宜积极行动。'],
    吉:   ['今日运势向好，贵人相助，宜主动出击。', '整体顺畅，保持积极心态，事半功倍。'],
    平:   ['今日运势平稳，守正出奇，稳中求进。', '平稳之日，适合整理思路，积蓄能量。'],
    小凶: ['今日略有阻碍，保持耐心，静待时机。', '运势偏弱，低调行事，避免正面冲突。'],
    凶:   ['今日运势低迷，以守为攻，蓄势待发。', '逆境之日，修身养性，等待转机。'],
  };
  const tips = overallTipMap[overallLabel] ?? ['今日运势平稳，保持平常心。'];
  const overallTip = tips[Math.floor(seededRandom(`${seed}-tip`) * tips.length)];

  return {
    date: dateStr,
    todayGan,
    todayZhi,
    todayWx,
    overallScore,
    overallLabel,
    overallTip,
    dimensions: [
      { label: '事业', score: careerScore, tip: careerTips[getLabel(careerScore)] },
      { label: '财运', score: wealthScore, tip: wealthTips[getLabel(wealthScore)] },
      { label: '感情', score: loveScore,   tip: loveTips[getLabel(loveScore)]   },
      { label: '健康', score: healthScore, tip: healthTips[getLabel(healthScore)] },
    ],
    luckyColor,
    luckyDirection,
    avoidTip: yiJi,
  };
}
// ==================== 五行手串数据 ====================

export interface BraceletData {
  wuXing: string;
  elementEn: string;
  material: string;
  spec: string;
  effect: string;
  description: string;
  scene: string;
  energyGuide: string;
}

export const BRACELET_DB: BraceletData[] = [
  {
    wuXing: "木", elementEn: "Wood",
    material: "绿幽灵",
    spec: "8mm×22颗",
    effect: "生机与突破",
    description: "打破事业瓶颈，带来持续向上的成长能量。适合事业停滞、需要突破的人群。",
    scene: "事业停滞、需要突破",
    energyGuide: [
      "佩戴位置：建议佩戴在左手，有助于吸收正能量",
      "佩戴时间：全天佩戴效果最佳，重要会议或谈判时尤为推荐",
      "清洁保养：每月用清水浸泡3小时后阴干，避免暴晒",
      "能量同步：清晨面向东方，闭目持珠冥想3分钟，默念目标",
    ].join("\n"),
  },
  {
    wuXing: "火", elementEn: "Fire",
    material: "红玛瑙",
    spec: "8mm×22颗",
    effect: "激情与行动",
    description: "拒绝内耗，点燃生活热情，增强个人魅力与桃花。适合感情冷淡、缺乏热情的人群。",
    scene: "感情冷淡、缺乏热情",
    energyGuide: [
      "佩戴位置：建议佩戴在右手，有助于散发自身魅力",
      "佩戴时间：社交场合、约会时佩戴效果更佳",
      "清洁保养：用软布轻轻擦拭，避免接触化学品",
      "能量同步：睡前手持红玛瑙，闭目想象红色暖流充满全身",
    ].join("\n"),
  },
  {
    wuXing: "土", elementEn: "Earth",
    material: "黄水晶",
    spec: "8mm×22颗",
    effect: "财富与稳定",
    description: "聚拢正偏财，提供踏实落地的安全感。适合财运不稳、需要落地的人群。",
    scene: "财运不稳、需要落地",
    energyGuide: [
      "佩戴位置：建议佩戴在左手，招财纳福",
      "佩戴时间：工作日全天佩戴，尤其适合商务洽谈",
      "清洁保养：每月月光下静置一晚，可恢复能量",
      "能量同步：每月初一，手持黄水晶向月亮许愿，默念财富愿景",
    ].join("\n"),
  },
  {
    wuXing: "金", elementEn: "Metal",
    material: "白水晶",
    spec: "8mm×22颗",
    effect: "净化与决断",
    description: "斩断烂桃花与负能量，提升直觉与决策力。适合决策困难、烂桃花困扰的人群。",
    scene: "决策困难、烂桃花困扰",
    energyGuide: [
      "佩戴位置：建议佩戴在右手，净化能量场",
      "佩戴时间：冥想或重要决策时佩戴效果最佳",
      "清洁保养：每周用盐水浸泡一晚后用清水冲洗",
      "能量同步：面对白色光源，闭目手持白水晶，深呼吸7次净化思绪",
    ].join("\n"),
  },
  {
    wuXing: "水", elementEn: "Water",
    material: "黑曜石",
    spec: "8mm×22颗",
    effect: "守护与平静",
    description: "吸收负面情绪，防小人，带来深海般的宁静。适合人际困扰、需要保护的人群。",
    scene: "人际困扰、需要保护",
    energyGuide: [
      "佩戴位置：建议佩戴在右手，作为守护石",
      "佩戴时间：外出、社交场合或感觉能量低落时佩戴",
      "清洁保养：每月用流水冲洗10分钟，自然阴干",
      "能量同步：面对北方，双手握黑曜石于胸口，想象蓝色光罩保护全身",
    ].join("\n"),
  },
];

export interface BraceletRecommendation {
  bracelet: BraceletData;
  reason: string;
  deficiencyWx: string;
  deficiencyCount: number;
}

/**
 * 根据五行分布推荐最合适的手串
 */
export function recommendBracelet(wuXing: Record<string, number>): BraceletRecommendation | null {
  const entries = Object.entries(wuXing) as [string, number][];
  if (entries.length === 0) return null;
  
  // 找出数量最少的五行
  let minWx = entries[0][0];
  let minCount = entries[0][1];
  for (const [wx, count] of entries) {
    if (count < minCount) {
      minWx = wx;
      minCount = count;
    }
  }

  // 找出手串匹配
  const bracelet = BRACELET_DB.find(b => b.wuXing === minWx);
  if (!bracelet) return null;

  return {
    bracelet,
    reason: `命盘中「${minWx}」较弱（${minCount}分），建议佩戴${bracelet.material}手串来增强${bracelet.effect}的能量。`,
    deficiencyWx: minWx,
    deficiencyCount: minCount,
  };
}
