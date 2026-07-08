import { decodeHtmlEntities, sanitizeLegacyHtml } from './cms';
import { injectHeadingAnchors, stripLeadingTitleHeading, type ArticleHeading } from './html-toc';

export type PreparedDaozangArticle = {
  html: string;
  headings: ArticleHeading[];
};

/** 源站模板中的推广 / UI 文案（整段丢弃） */
const JUNK_TEXT =
  /(?:扫码下载|打开问真|问真八字|手机阅读|在手机上继续阅读|继续阅读本书|下载问真|bzapi|bookcode|关注公众号|目录\s*手机阅读)/i;

function stripInlineTags(html: string): string {
  return decodeHtmlEntities(html.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
}

/** 只保留 book-detail-content 内层 HTML */
function extractDaozangBody(html: string): string {
  const start = html.search(/<div class="book-detail-content"[^>]*>/i);
  if (start >= 0) {
    const innerStart = html.indexOf('>', start) + 1;
    const innerEnd = html.indexOf('</div>', innerStart);
    if (innerEnd > innerStart) return html.slice(innerStart, innerEnd);
  }

  // 非书籍章节模板：去掉外壳后再返回
  let out = html;
  out = out.replace(/<div class="catalog-box"[\s\S]*$/i, '');
  out = out.replace(/<div id="bookcode"[\s\S]*?<\/div>\s*<\/div>/gi, '');
  out = out.replace(/<div class="shadowMask"[\s\S]*?<\/div>/gi, '');
  out = out.replace(/<div class="book-detail-btn[^"]*"[\s\S]*?<\/div>/gi, '');
  out = out.replace(/<div class="book-detail-title"[^>]*>[\s\S]*?<\/div>/gi, '');
  out = out.replace(/<div class="book-detail-tip"[^>]*>[\s\S]*?<\/div>/gi, '');
  out = out.replace(/<div class="book-detail"[^>]*>/gi, '');
  out = out.replace(/<div id="container"[^>]*>/gi, '');
  out = out.replace(/<p>\s*<!DOCTYPE[\s\S]*?<\/p>/gi, '');
  out = out.replace(/<p>\s*<(?:html|head|body)[\s\S]*?<\/p>/gi, '');
  return out;
}

/** 去掉正文内残留的图片、无效链接、推广块，链接保留纯文本 */
function stripDaozangJunk(html: string): string {
  let out = html.replace(/<!--[\s\S]*?-->/g, '');

  // 模板 UI 块（content 外泄或 fallback 路径）
  out = out.replace(/<div[^>]*class="[^"]*catalog[^"]*"[^>]*>[\s\S]*?<\/div>/gi, '');
  out = out.replace(/<div[^>]*class="[^"]*book-popup[^"]*"[^>]*>[\s\S]*?<\/div>/gi, '');
  out = out.replace(/<div[^>]*class="[^"]*book-detail-btn[^"]*"[^>]*>[\s\S]*?<\/div>/gi, '');
  out = out.replace(/<div[^>]*class="[^"]*bookDetailBtn[^"]*"[^>]*>[\s\S]*?<\/div>/gi, '');

  // 正文内不需要图片（图标、封面、二维码）
  out = out.replace(/<img\b[^>]*>/gi, '');

  // 无效链接 → 纯文本（章内 .html、#、外链推广等）
  out = out.replace(/<a\b[^>]*>([\s\S]*?)<\/a>/gi, '$1');

  // 推广段落 / 块
  out = out.replace(/<p[^>]*>[\s\S]*?<\/p>/gi, (block) =>
    JUNK_TEXT.test(stripInlineTags(block)) ? '' : block,
  );
  out = out.replace(/<div[^>]*>[\s\S]*?<\/div>/gi, (block) =>
    JUNK_TEXT.test(stripInlineTags(block)) ? '' : block,
  );
  out = out.replace(/<span[^>]*>[\s\S]*?<\/span>/gi, (block) =>
    JUNK_TEXT.test(stripInlineTags(block)) ? '' : block,
  );

  // 误迁入的 HTML 标签（被包在 <p> 里）
  out = out.replace(/<p[^>]*>\s*<\/?(?:link|meta|script|title|html|head|body|div|container)[^>]*>[\s\S]*?<\/p>/gi, '');

  // 去掉 UI class 的空壳
  out = out.replace(/<[^>]+class="[^"]*(?:openbookcode|bookDetailBtn|catalogitem|childitems|citems)[^"]*"[^>]*>[\s\S]*?<\/[^>]+>/gi, '');

  return out;
}

/** 移除空白段落（源站每句一行，中间常插空 <p>） */
function removeEmptyParagraphs(html: string): string {
  return html.replace(/<p[^>]*>\s*(?:&nbsp;|\u00a0|<br\s*\/?>)?\s*<\/p>/gi, '');
}

/** 原书注释 / 歌释段落 → 语义化 aside，便于排版区分 */
function markAnnotationBlocks(html: string): string {
  return html.replace(/<p([^>]*)>([\s\S]*?)<\/p>/gi, (match, attrs: string, inner: string) => {
    const text = stripInlineTags(inner);
    if (!text) return match;

    const meipi = text.match(/^眉批[：:]\s*(.*)$/);
    if (meipi) {
      return `<aside class="daozang-note daozang-note--meipi"${attrs}><span class="daozang-note-label">眉批</span><p>${meipi[1]}</p></aside>`;
    }

    const note = text.match(/^注[：:]\s*(.*)$/);
    if (note) {
      return `<aside class="daozang-note daozang-note--zhu"${attrs}><span class="daozang-note-label">注</span><p>${note[1]}</p></aside>`;
    }

    const song = text.match(/^(?:歌释|又韵)[：:]\s*([\s\S]*)$/);
    if (song) {
      const label = text.startsWith('又韵') ? '又韵' : '歌释';
      return `<aside class="daozang-song"${attrs}><span class="daozang-note-label">${label}</span><p>${song[1]}</p></aside>`;
    }

    return match;
  });
}

/** 连续短句（如「子未相穿，」）合并为诗行块，减少碎片化 */
function groupVerseLines(html: string): string {
  const parts = html.split(/(?=<p[^>]*>)/i);
  const out: string[] = [];
  let buffer: string[] = [];

  const flush = () => {
    if (buffer.length === 0) return;
    if (buffer.length >= 2) {
      out.push(`<div class="daozang-verse">${buffer.join('')}</div>`);
    } else {
      out.push(buffer[0]!);
    }
    buffer = [];
  };

  for (const part of parts) {
    if (!part.trim()) continue;
    const pMatch = part.match(/^<p([^>]*)>([\s\S]*?)<\/p>/i);
    if (!pMatch) {
      flush();
      out.push(part);
      continue;
    }

    const text = stripInlineTags(pMatch[2]!);
    const isShortLine =
      text.length > 0 &&
      text.length <= 24 &&
      /[，。；、]$/.test(text) &&
      !/^眉批|^注[：:]|^歌释|^又韵/.test(text);

    if (isShortLine) {
      buffer.push(part);
    } else {
      flush();
      out.push(part);
    }
  }
  flush();
  return out.join('');
}

/**
 * 道藏章节正文预处理：去模板壳、标注注释、合并诗行、注入目录锚点。
 */
export function prepareDaozangArticle(rawHtml: string, pageTitle: string): PreparedDaozangArticle {
  let html = extractDaozangBody(rawHtml);
  html = sanitizeLegacyHtml(html);
  html = stripDaozangJunk(html);
  html = stripLeadingTitleHeading(html, pageTitle);
  html = removeEmptyParagraphs(html);
  html = markAnnotationBlocks(html);
  html = groupVerseLines(html);

  const { html: withAnchors, headings } = injectHeadingAnchors(html);
  return { html: withAnchors, headings };
}
