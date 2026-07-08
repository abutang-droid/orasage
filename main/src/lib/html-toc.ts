import { decodeHtmlEntities } from './cms';

export type ArticleHeading = {
  id: string;
  text: string;
  level: 2 | 3;
};

/** 去掉正文开头与页面标题重复的 h1/h2（WordPress 迁移正文常见） */
export function stripLeadingTitleHeading(html: string, title: string): string {
  const cleanTitle = decodeHtmlEntities(title).replace(/\s+/g, ' ').trim();
  if (!cleanTitle) return html;
  return html.replace(/^\s*<h([12])[^>]*>([\s\S]*?)<\/h\1>/i, (match, _level, inner: string) => {
    const text = decodeHtmlEntities(inner.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
    return text === cleanTitle ? '' : match;
  });
}

/**
 * 从正文 HTML 中提取 h2/h3 生成文内目录，并为标题注入锚点 id。
 * 输入应为已清洗（sanitizeLegacyHtml）后的 HTML。
 */
export function injectHeadingAnchors(html: string): { html: string; headings: ArticleHeading[] } {
  const headings: ArticleHeading[] = [];
  let counter = 0;

  const withAnchors = html.replace(
    /<h([23])([^>]*)>([\s\S]*?)<\/h\1>/gi,
    (match, levelStr: string, attrs: string, inner: string) => {
      const text = decodeHtmlEntities(inner.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
      if (!text) return match;

      counter += 1;
      const existingId = attrs.match(/\bid=["']([^"']+)["']/);
      const id = existingId ? existingId[1] : `sec-${counter}`;
      headings.push({ id, text, level: Number(levelStr) as 2 | 3 });

      if (existingId) return match;
      return `<h${levelStr}${attrs} id="${id}">${inner}</h${levelStr}>`;
    },
  );

  return { html: withAnchors, headings };
}
