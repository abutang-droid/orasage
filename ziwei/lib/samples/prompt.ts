import type { ZiweiChart } from '@/lib/ziwei/types';
import { detectPatterns } from '@/lib/ziwei/patterns';
import { STAR_IN_FUQI_GU } from '@/lib/ziwei/heming-knowledge';
import { lookupSampleTopics } from './lookup';
import type { SampleTopicKey, SampleTopics } from './types';
import { mergeTopicKeys, pickTopicsFromChart } from './chart-topics';
import { formatDaXianLiuNianContext } from './daxian-context';
import { buildClassicsContextForChart } from './classics-rag';
import {
  DEFAULT_MAX_CONTEXT_CHARS,
  DEFAULT_MAX_TOPIC_CHARS,
  limitTotalLength,
  truncateText,
} from './truncate';

const TOPIC_LABELS: Record<SampleTopicKey, string> = {
  overview: '命格总览',
  personality: '性格特质',
  love: '感情婚姻',
  career: '事业职业',
  wealth: '财富运势',
  health: '健康状况',
  family: '兄弟合伙',
  children: '子女缘分',
  move: '迁移外出',
  friends: '人际贵人',
  home: '田宅不动产',
  spirit: '精神福德',
  parents: '父母长辈',
};

const REPORT_TOPIC_KEYS: SampleTopicKey[] = [
  'overview',
  'personality',
  'career',
  'wealth',
  'love',
  'health',
  'spirit',
];

const MINOR_TOPIC_KEYS: SampleTopicKey[] = [
  'overview',
  'personality',
  'health',
  'spirit',
];

const CHAT_TOPIC_HINTS: Array<{ pattern: RegExp; keys: SampleTopicKey[] }> = [
  { pattern: /财|钱|收入|投资|理财/, keys: ['wealth', 'career'] },
  { pattern: /感情|婚姻|桃花|配偶|恋爱|夫妻/, keys: ['love'] },
  { pattern: /事业|工作|职业|官|升职/, keys: ['career'] },
  { pattern: /健康|疾|身体|养生/, keys: ['health'] },
  { pattern: /子女|孩子|怀孕/, keys: ['children'] },
  { pattern: /迁移|搬家|外出|出国/, keys: ['move'] },
  { pattern: /朋友|人际|贵人|社交/, keys: ['friends', 'family'] },
  { pattern: /田宅|房|不动产/, keys: ['home'] },
  { pattern: /父母|长辈/, keys: ['parents'] },
  { pattern: /性格|命宫|为人/, keys: ['personality', 'overview'] },
];

const LOVE_CHAT = /感情|婚姻|桃花|配偶|恋爱|夫妻|合盘|缘分/;

function maxTopicChars(): number {
  const n = Number(process.env.ZIWEI_SAMPLES_MAX_TOPIC_CHARS);
  return Number.isFinite(n) && n > 0 ? n : DEFAULT_MAX_TOPIC_CHARS;
}

function maxContextChars(): number {
  const n = Number(process.env.ZIWEI_SAMPLES_MAX_CONTEXT_CHARS);
  return Number.isFinite(n) && n > 0 ? n : DEFAULT_MAX_CONTEXT_CHARS;
}

function formatTopicsBlock(
  topics: SampleTopics,
  keys: SampleTopicKey[],
  heading: string,
): string {
  const parts: string[] = [`【${heading}】`];
  const cap = maxTopicChars();
  for (const key of keys) {
    const text = truncateText(topics[key] ?? '', cap);
    if (!text) continue;
    parts.push(`## ${TOPIC_LABELS[key]}\n${text}`);
  }
  if (parts.length <= 1) return '';
  return parts.join('\n\n');
}

function formatPatterns(chart: ZiweiChart): string {
  const patterns = detectPatterns(chart);
  if (!patterns.length) return '';
  const lines = patterns.slice(0, 8).map(
    (p) => `- ${p.name}（${p.level}）：${truncateText(p.description, 120)}`,
  );
  return `【命盘格局识别】\n${lines.join('\n')}`;
}

function formatHemingFuqi(chart: ZiweiChart): string {
  const fuqi = chart.palaces.find((p) => p.name === '夫妻');
  const major = fuqi?.stars.find((s) => s.type === 'major')?.name;
  if (!major || !STAR_IN_FUQI_GU[major]) return '';
  const gu = STAR_IN_FUQI_GU[major];
  return `【夫妻宫参考（${major}）】\n${gu.summary}\n吉：${gu.good}\n注意：${gu.bad}`;
}

function shouldIncludeHeming(
  chart: ZiweiChart,
  userMessage: string,
  mode?: string,
): boolean {
  if (mode === 'heming') return true;
  if (LOVE_CHAT.test(userMessage)) return true;
  const fuqi = chart.palaces.find((p) => p.name === '夫妻');
  return Boolean(fuqi?.stars.some((s) => s.type === 'major'));
}

export function pickTopicsForChat(
  userMessage: string,
  minorMode: boolean,
  chart?: ZiweiChart,
): SampleTopicKey[] {
  if (minorMode) return MINOR_TOPIC_KEYS;

  const fromMsg = new Set<SampleTopicKey>(['overview', 'personality']);
  for (const { pattern, keys: k } of CHAT_TOPIC_HINTS) {
    if (pattern.test(userMessage)) k.forEach((x) => fromMsg.add(x));
  }

  if (chart) {
    return mergeTopicKeys([...fromMsg], pickTopicsFromChart(chart));
  }
  return [...fromMsg];
}

/** 为单人命盘构建样本库 + 格局参考块（注入 system prompt） */
export async function buildSampleContextForChart(
  chart: ZiweiChart,
  options?: {
    topicKeys?: SampleTopicKey[];
    minorMode?: boolean;
    includePatterns?: boolean;
    includeHeming?: boolean;
    includeDaXian?: boolean;
    includeClassics?: boolean;
    heading?: string;
  },
): Promise<string> {
  const topics = await lookupSampleTopics(chart.birthInfo);
  const blocks: string[] = [];

  if (topics) {
    const keys =
      options?.topicKeys ??
      (options?.minorMode ? MINOR_TOPIC_KEYS : REPORT_TOPIC_KEYS);

    const sampleBlock = formatTopicsBlock(
      topics,
      keys,
      options?.heading ?? '同盘型样本库参考（倪海厦体系，请个性化改写勿照抄）',
    );
    if (sampleBlock) blocks.push(sampleBlock);
  }

  if (options?.includePatterns !== false) {
    const p = formatPatterns(chart);
    if (p) blocks.push(p);
  }

  if (options?.includeHeming) {
    const h = formatHemingFuqi(chart);
    if (h) blocks.push(h);
  }

  if (options?.includeDaXian !== false && !options?.minorMode) {
    blocks.push(formatDaXianLiuNianContext(chart));
  }

  if (options?.includeClassics) {
    const classics = buildClassicsContextForChart(chart);
    if (classics) blocks.push(classics);
  }

  return limitTotalLength(blocks.filter(Boolean).join('\n\n'), maxContextChars());
}

/** 合盘：分别取两人样本参考 */
export async function buildSampleContextForCouple(
  chartA: ZiweiChart,
  chartB: ZiweiChart,
  options?: { minorMode?: boolean; includeClassics?: boolean },
): Promise<string> {
  const [ctxA, ctxB] = await Promise.all([
    buildSampleContextForChart(chartA, {
      topicKeys: options?.minorMode
        ? MINOR_TOPIC_KEYS
        : ['overview', 'personality', 'love', 'career'],
      minorMode: options?.minorMode,
      includeHeming: true,
      includeClassics: options?.includeClassics,
      heading: '甲方同盘型样本参考',
    }),
    buildSampleContextForChart(chartB, {
      topicKeys: options?.minorMode
        ? MINOR_TOPIC_KEYS
        : ['overview', 'personality', 'love', 'career'],
      minorMode: options?.minorMode,
      includeHeming: true,
      includeClassics: options?.includeClassics,
      heading: '乙方同盘型样本参考',
    }),
  ]);
  return [ctxA, ctxB].filter(Boolean).join('\n\n');
}

export function extractChartsFromBody(chartData: unknown): ZiweiChart[] {
  if (!chartData || typeof chartData !== 'object') return [];
  const d = chartData as Record<string, unknown>;
  if (d.chartA && d.chartB && typeof d.chartA === 'object' && typeof d.chartB === 'object') {
    return [d.chartA as ZiweiChart, d.chartB as ZiweiChart];
  }
  if (Array.isArray((d as { palaces?: unknown }).palaces)) {
    return [chartData as ZiweiChart];
  }
  return [];
}

/** 根据对话最后一条用户消息挑选主题并构建上下文 */
export async function buildSampleContextForInterpret(
  chartData: unknown,
  options: {
    mode?: string;
    minorMode?: boolean;
    messages?: Array<{ role: string; content: string }>;
    includeClassics?: boolean;
  },
): Promise<string> {
  const charts = extractChartsFromBody(chartData);
  if (!charts.length) return '';

  const lastUser = [...(options.messages ?? [])]
    .reverse()
    .find((m) => m.role === 'user')?.content ?? '';

  const includeClassics =
    options.includeClassics ?? process.env.ZIWEI_CLASSICS_RAG !== 'false';

  if (options.mode === 'heming' && charts.length >= 2) {
    return buildSampleContextForCouple(charts[0], charts[1], {
      minorMode: options.minorMode,
      includeClassics,
    });
  }

  const chart = charts[0];
  const topicKeys = pickTopicsForChat(
    lastUser,
    Boolean(options.minorMode),
    chart,
  );

  return buildSampleContextForChart(chart, {
    topicKeys,
    minorMode: options.minorMode,
    includeHeming: shouldIncludeHeming(chart, lastUser, options.mode),
    includeClassics,
  });
}

/** 预览页：直接取样本 overview（可选 personality 一句） */
export async function buildPreviewFromSamples(
  chart: ZiweiChart,
  minorMode: boolean,
): Promise<string | null> {
  const topics = await lookupSampleTopics(chart.birthInfo);
  if (!topics?.overview?.trim()) return null;

  const name = chart.birthInfo.name?.trim() || '命主';
  const ming = chart.palaces.find((p) => p.name === '命宫');
  const major =
    ming?.stars
      .filter((s) => s.type === 'major')
      .map((s) => s.name)
      .join('、') || '空宫借星';

  const overview = truncateText(topics.overview, 500);
  const personality = minorMode
    ? truncateText(topics.personality ?? '', 200)
    : '';

  const lines = [
    `【${name}】${chart.wuxingJuName}命盘`,
    '',
    `命宫主星：${major}`,
    '',
    overview,
  ];
  if (personality) {
    lines.push('', personality);
  }

  if (minorMode) {
    lines.push(
      '',
      '登录后可向 Orasage 提问（每份排盘赠送 5 次免费对话），内容将限定在健康、学业与未来方向。',
    );
  } else {
    const dx = chart.daXians[chart.currentDaXianIndex];
    if (dx) {
      lines.push(
        '',
        `当前大限在${chart.palaces.find((p) => p.branch === dx.palaceBranch)?.name ?? dx.palaceName}宫（${dx.startAge}–${dx.endAge}岁）。`,
      );
    }
    lines.push(
      '',
      '登录后可向 Orasage 提问，获取针对你命盘的具体解读（每份排盘赠送 5 次免费对话）。',
    );
  }

  return lines.join('\n');
}
