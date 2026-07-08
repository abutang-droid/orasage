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
