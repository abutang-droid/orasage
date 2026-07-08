/**
 * 名人案例正文（legacyHtml）服务端解析工具。
 * 模板覆盖率约 96%，所有字段按可缺省设计：解析失败时页面退化为通用排版，不报错。
 */

export type FamousAnchor = {
  id: string;
  label: string;
};

export type FamousArticleHtml = {
  html: string;
  anchors: FamousAnchor[];
  hasCover: boolean;
};

/** 去掉「一、」「1.」等章节序号前缀，锚点条上显示更短的标签 */
function anchorLabel(raw: string): string {
  const text = raw
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const stripped = text
    .replace(/^[一二三四五六七八九十]+[、.．·]\s*/, '')
    .replace(/^\d+[、.．·]\s*/, '')
    .trim();
  return stripped || text;
}

/**
 * 为正文中的 `<h2>` 注入锚点 id 并提取目录。
 * 少于 2 个 h2 时不生成目录（单章/变体模板优雅退化）。
 */
export function prepareFamousArticle(rawHtml: string): FamousArticleHtml {
  const anchors: FamousAnchor[] = [];
  let index = 0;

  const html = rawHtml.replace(
    /<h2(\s[^>]*)?>([\s\S]*?)<\/h2>/gi,
    (match, attrs: string | undefined, inner: string) => {
      const label = anchorLabel(inner);
      if (!label) return match;
      index += 1;
      const id = `famous-sec-${index}`;
      anchors.push({ id, label });
      const keptAttrs = (attrs ?? '').replace(/\sid="[^"]*"/i, '');
      return `<h2 id="${id}"${keptAttrs}>${inner}</h2>`;
    },
  );

  const hasCover = /class="[^"]*\b(cover|os-cover|os-article-intro)\b/.test(rawHtml);

  if (anchors.length < 2) {
    return { html: rawHtml, anchors: [], hasCover };
  }
  return { html, anchors, hasCover };
}

/* ── 列表卡片元数据 ── */

export type FamousCardMeta = {
  /** 人名（封面 h1；缺省 null，卡片回退为文章标题） */
  name: string | null;
  /** 生辰行，如「1963年2月17日 · 巳时 · 乾造（男命）」 */
  birth: string | null;
  /** 四柱八字，如「癸卯 甲寅 辛卯 癸巳」 */
  pillars: string | null;
  /** 格局，如「正财格」 */
  pattern: string | null;
};

function cleanInline(raw: string): string {
  const text = raw
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  // 纯 CJK 人名去掉装饰性空格（如「黃 興」）
  if (/^[\u4e00-\u9fff\s]+$/.test(text)) return text.replace(/\s+/g, '');
  return text;
}

const NAME_RE =
  /<(?:h1[^>]*|p\s+class="os-(?:cover__name|article-person)"[^>]*|div\s+class="os-cover__name"[^>]*)>([\s\S]{1,120}?)<\/(?:h1|p|div)>/i;
const BIRTH_RE =
  /class="(?:birth|os-cover__meta|os-article-meta|cover-meta|birth-info)"[^>]*>([\s\S]{1,160}?)<\//i;
const STEM_RE = /class="(?:tian|os-pillar__stem|col-tian|gan)"[^>]*>\s*(?:<[^>]+>\s*)*([\u4e00-\u9fff])/g;
const BRANCH_RE =
  /class="(?:di|os-pillar__branch|col-di|zhi)"[^>]*>\s*(?:<[^>]+>\s*)*([\u4e00-\u9fff])/g;
const PATTERN_RE =
  /class="[^"]*(?:tag-gold|os-badge--gold)[^"]*"[^>]*>\s*([^<]{1,10}[格局])\s*</;

/** 从正文模板解析列表卡片元数据（全部字段可缺省） */
export function extractFamousCardMeta(html: string): FamousCardMeta {
  const nameMatch = html.match(NAME_RE);
  const name = nameMatch ? cleanInline(nameMatch[1]) || null : null;

  const birthMatch = html.match(BIRTH_RE);
  const birth = birthMatch ? cleanInline(birthMatch[1]) || null : null;

  const stems = [...html.matchAll(STEM_RE)].slice(0, 4).map((m) => m[1]);
  const branches = [...html.matchAll(BRANCH_RE)].slice(0, 4).map((m) => m[1]);
  const pillars =
    stems.length === 4 && branches.length === 4
      ? stems.map((stem, i) => `${stem}${branches[i]}`).join(' ')
      : null;

  const patternMatch = html.match(PATTERN_RE);
  const pattern = patternMatch ? cleanInline(patternMatch[1]) || null : null;

  return { name, birth, pillars, pattern };
}

/** 文章标题去掉「八字解读 / 八字报告」等后缀，作为人名回退 */
export function nameFromTitle(title: string): string {
  const stripped = title
    .replace(/\s*八字(命理)?(全盘|全盤)?(解读|解讀|报告|報告|分析报告)\s*$/u, '')
    .replace(/\s*BaZi(\s+Chart)?\s+Reading\s*$/i, '')
    .trim();
  return stripped || title;
}
