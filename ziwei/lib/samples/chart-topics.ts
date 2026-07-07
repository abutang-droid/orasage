import type { ZiweiChart } from '@/lib/ziwei/types';
import { TOPIC_PALACE_NAME, type TopicKey } from '@/lib/ziwei/db-analysis';
import type { SampleTopicKey } from './types';

const PALACE_TOPIC_ENTRIES = Object.entries(TOPIC_PALACE_NAME) as Array<
  [TopicKey, string]
>;

function palaceTopicKey(palaceName: string): SampleTopicKey | null {
  for (const [key, name] of PALACE_TOPIC_ENTRIES) {
    if (name === palaceName) return key;
  }
  return null;
}

function palaceHasMajor(palace: ZiweiChart['palaces'][number]): boolean {
  return palace.stars.some((s) => s.type === 'major');
}

/** 根据命盘宫位主星分布推断应注入的样本主题 */
export function pickTopicsFromChart(chart: ZiweiChart): SampleTopicKey[] {
  const keys = new Set<SampleTopicKey>(['overview', 'personality']);

  for (const palace of chart.palaces) {
    if (!palaceHasMajor(palace)) continue;
    const topic = palaceTopicKey(palace.name);
    if (topic) keys.add(topic);
  }

  const ming = chart.palaces.find((p) => p.name === '命宫');
  const mingMajors = ming?.stars.filter((s) => s.type === 'major').map((s) => s.name) ?? [];
  if (mingMajors.includes('武曲') || mingMajors.includes('天府')) {
    keys.add('wealth');
  }
  if (mingMajors.includes('太阳') || mingMajors.includes('太阴')) {
    keys.add('parents');
  }

  const fuqi = chart.palaces.find((p) => p.name === '夫妻');
  if (fuqi && palaceHasMajor(fuqi)) keys.add('love');

  const guanlu = chart.palaces.find((p) => p.name === '官禄');
  if (guanlu && palaceHasMajor(guanlu)) keys.add('career');

  return [...keys];
}

export function mergeTopicKeys(...groups: SampleTopicKey[][]): SampleTopicKey[] {
  return [...new Set(groups.flat())];
}
