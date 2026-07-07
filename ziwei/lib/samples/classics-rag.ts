import { searchClassics } from '@/lib/classics';
import type { ZiweiChart } from '@/lib/ziwei/types';
import { detectPatterns } from '@/lib/ziwei/patterns';
import { truncateText } from './truncate';

const MAX_SNIPPET = 160;

function uniqueQueries(chart: ZiweiChart): string[] {
  const ming = chart.palaces.find((p) => p.name === '命宫');
  const majors = ming?.stars.filter((s) => s.type === 'major').map((s) => s.name) ?? [];
  const patterns = detectPatterns(chart).slice(0, 2).map((p) => p.name);
  const ju = chart.wuxingJuName.replace(/局$/, '');
  return [...new Set([...majors.slice(0, 2), ...patterns, ju].filter(Boolean))];
}

/**
 * 从内置古籍库检索与命盘相关的条文片段（静态 RAG，CMS 版可后续扩展）。
 */
export function buildClassicsContextForChart(
  chart: ZiweiChart,
  limit = 4,
): string {
  const queries = uniqueQueries(chart);
  if (!queries.length) return '';

  const hits: Array<{
    bookTitle: string;
    chapterTitle: string;
    text: string;
    paragraphId: string;
  }> = [];
  const seen = new Set<string>();

  for (const q of queries) {
    for (const hit of searchClassics(q, 3)) {
      if (seen.has(hit.paragraphId)) continue;
      seen.add(hit.paragraphId);
      hits.push(hit);
      if (hits.length >= limit) break;
    }
    if (hits.length >= limit) break;
  }

  if (!hits.length) return '';

  const lines = hits.map(
    (h) =>
      `- 《${h.bookTitle}·${h.chapterTitle}》[${h.paragraphId}]：${truncateText(h.text, MAX_SNIPPET)}`,
  );
  return `【古籍条文参考（作答可引用并注明出处）】\n${lines.join('\n')}`;
}
