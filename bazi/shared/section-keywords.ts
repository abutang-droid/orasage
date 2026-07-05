/**
 * 从报告章节正文中提炼展示用关键词（过滤「算法依据」等无意义词）
 */

const STOPWORDS = new Set([
  '算法依据', '算法推荐', '标签', '我们', 'OraSage', '铁口直断',
  '四层过滤', '裁决引擎', '综合分析', '根据分析', '综上所述',
  '需要注意', '值得一提', '换句话说', '与此同时', '由此可见',
  '命理报告', '八字命理', '命盘分析', '以下内容', '本章将',
]);

const BAZI_PATTERNS: RegExp[] = [
  /日主[甲乙丙丁戊己庚辛壬癸][木火土金水]?/g,
  /生于[子丑寅卯辰巳午未申酉戌亥]月/g,
  /(身强|身弱|从强|从弱|中和|偏强|偏弱)/g,
  /([木火土金水])行(偏旺|偏弱|过旺|过弱|平衡|缺失)/g,
  /(正印|偏印|正官|七杀|正财|偏财|食神|伤官|比肩|劫财)(格|为用)?/g,
  /用神[为是：:\s]*[木火土金水甲乙丙丁戊己庚辛壬癸]/g,
  /喜用[木火土金水]/g,
  /忌神[为是：:\s]*[木火土金水甲乙丙丁戊己庚辛壬癸]/g,
  /(大运|流年|流月)[^\s，。！？；;]{0,8}/g,
  /[甲乙丙丁戊己庚辛壬癸][木火土金水]/g,
];

function cleanToken(raw: string): string {
  return raw
    .replace(/[*#「」『』【】]/g, '')
    .replace(/^[：:，,。！？\s]+|[：:，,。！？\s]+$/g, '')
    .trim();
}

function addKeyword(bucket: string[], seen: Set<string>, raw: string) {
  const token = cleanToken(raw);
  if (token.length < 2 || token.length > 14) return;
  if (STOPWORDS.has(token)) return;
  if (/^(的|了|是|在|与|及|和|或|等|其|这|那|为|有)$/.test(token)) return;
  if (seen.has(token)) return;
  seen.add(token);
  bucket.push(token);
}

/** 从章节正文提炼 2–4 个关键词 */
export function extractSectionKeywords(content: string, sectionTitle?: string): string[] {
  const keywords: string[] = [];
  const seen = new Set<string>();

  for (const m of content.matchAll(/[「『【]([^「」『』【】]{2,10})[」』】]/g)) {
    addKeyword(keywords, seen, m[1]);
  }

  for (const pat of BAZI_PATTERNS) {
    const re = new RegExp(pat.source, pat.flags);
    for (const m of content.matchAll(re)) {
      addKeyword(keywords, seen, m[0]);
    }
  }

  for (const m of content.matchAll(/\*\*([^*\n]{2,10})\*\*/g)) {
    addKeyword(keywords, seen, m[1]);
  }

  if (keywords.length < 2 && sectionTitle) {
    const titlePart = sectionTitle
      .replace(/[（(].*?[）)]/g, '')
      .split(/[与及和、·]/)
      .map((s) => s.trim())
      .filter((s) => s.length >= 2 && s.length <= 8);
    for (const part of titlePart) {
      addKeyword(keywords, seen, part);
      if (keywords.length >= 3) break;
    }
  }

  if (keywords.length < 2) {
    const sentences = content.split(/[。！？\n]/).map((s) => s.trim()).filter(Boolean);
    for (const sentence of sentences) {
      const dm = sentence.match(/日主[甲乙丙丁戊己庚辛壬癸][木火土金水]?/);
      if (dm) addKeyword(keywords, seen, dm[0]);
      const bm = sentence.match(/生于[子丑寅卯辰巳午未申酉戌亥]月/);
      if (bm) addKeyword(keywords, seen, bm[0]);
      if (keywords.length >= 3) break;
    }
  }

  return keywords.slice(0, 4);
}
