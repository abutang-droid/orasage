import { decodeHtmlEntities, sanitizeLegacyHtml } from './cms';
import { injectHeadingAnchors, stripLeadingTitleHeading, type ArticleHeading } from './html-toc';

export type PreparedDaozangArticle = {
  html: string;
  headings: ArticleHeading[];
};

function stripInlineTags(html: string): string {
  return decodeHtmlEntities(html.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
}

/** 去掉 c2.pub 书籍模板外壳，只保留正文区 */
function extractDaozangBody(html: string): string {
  let out = html;

  // 整页目录弹层、二维码弹窗、阴影遮罩
  out = out.replace(/<div class="catalog-box"[\s\S]*$/i, '');
  out = out.replace(/<div id="bookcode"[\s\S]*?<\/div>\s*<\/div>/gi, '');
  out = out.replace(/<div class="shadowMask"[\s\S]*?<\/div>/gi, '');
  out = out.replace(/<div class="book-detail-btn[^"]*"[\s\S]*?<\/div>/gi, '');
  out = out.replace(/<div class="book-detail-title"[^>]*>[\s\S]*?<\/div>/gi, '');
  out = out.replace(/<div class="book-detail-tip"[^>]*>[\s\S]*?<\/div>/gi, '');

  const contentMatch = out.match(/<div class="book-detail-content"[^>]*>([\s\S]*?)<\/div>/i);
  if (contentMatch) return contentMatch[1];

  // 非书籍模板：去掉误迁入的 HTML 文档头（被包在 <p> 里）
  out = out.replace(/<p>\s*<!DOCTYPE[\s\S]*?<\/p>/gi, '');
  out = out.replace(/<p>\s*<html[\s\S]*?<\/p>/gi, '');
  out = out.replace(/<p>\s*<head[\s\S]*?<\/p>/gi, '');
  out = out.replace(/<p>\s*<body[\s\S]*?<\/p>/gi, '');
  out = out.replace(/<div id="container"[^>]*>/gi, '');
  out = out.replace(/<div class="book-detail"[^>]*>/gi, '');

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
  let html = sanitizeLegacyHtml(rawHtml);
  html = extractDaozangBody(html);
  html = stripLeadingTitleHeading(html, pageTitle);
  html = removeEmptyParagraphs(html);
  html = markAnnotationBlocks(html);
  html = groupVerseLines(html);

  const { html: withAnchors, headings } = injectHeadingAnchors(html);
  return { html: withAnchors, headings };
}
