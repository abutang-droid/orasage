/**
 * 古籍原典查询库 — 入口
 *
 * 优先从 CMS 加载，回退到内置静态数据。
 */

import type { Book, Paragraph, SearchHit } from './types';
import {
  loadAllBooks,
  getBookBySlug as getBookBySlugAsync,
  getChapter as getChapterAsync,
  ALL_BOOKS as STATIC_BOOKS,
  TOTAL_PARAGRAPHS,
} from './cms';
import { ALL_BOOKS as FALLBACK_BOOKS } from './static-data';

export { TOTAL_PARAGRAPHS };
export { loadAllBooks, getTotalParagraphs, loadKnowledgeStars } from './cms';
export type { CmsStarDoc } from './cms';

/** 构建期 / sitemap 使用的静态书目 */
export const ALL_BOOKS = STATIC_BOOKS;

/** 按 slug 取书（异步，CMS 优先） */
export async function getBookBySlug(slug: string): Promise<Book | null> {
  return getBookBySlugAsync(slug);
}

/** 按章节序号取章节（异步，CMS 优先） */
export async function getChapter(bookSlug: string, chapterIdx: number) {
  return getChapterAsync(bookSlug, chapterIdx);
}

/** 同步取书（仅静态回退，供搜索等客户端场景） */
export function getBookBySlugSync(slug: string): Book | null {
  return FALLBACK_BOOKS.find((b) => b.slug === slug) ?? null;
}

/** 按段落 id 取段落（静态数据） */
export function getParagraphById(id: string) {
  for (const book of FALLBACK_BOOKS) {
    for (let i = 0; i < book.chapters.length; i++) {
      const ch = book.chapters[i];
      const p = ch.paragraphs.find((para) => para.id === id);
      if (p) {
        return { book, chapter: ch, chapterIdx: i, paragraph: p };
      }
    }
  }
  return null;
}

/**
 * 全文搜索（静态数据；CMS 版搜索可后续扩展）
 */
export function searchClassics(query: string, limit = 30): SearchHit[] {
  const q = query.trim();
  if (q.length < 1) return [];

  const hits: SearchHit[] = [];
  for (const book of FALLBACK_BOOKS) {
    for (const chapter of book.chapters) {
      for (const p of chapter.paragraphs) {
        const idx = p.text.indexOf(q);
        if (idx < 0) continue;

        const start = Math.max(0, idx - 40);
        const end = Math.min(p.text.length, idx + q.length + 40);
        const before = p.text.slice(start, idx);
        const matched = p.text.slice(idx, idx + q.length);
        const after = p.text.slice(idx + q.length, end);

        const snippet =
          (start > 0 ? '…' : '') +
          escapeHtml(before) +
          `<mark>${escapeHtml(matched)}</mark>` +
          escapeHtml(after) +
          (end < p.text.length ? '…' : '');

        hits.push({
          bookSlug: book.slug,
          bookTitle: book.title,
          chapterTitle: chapter.title,
          paragraphId: p.id,
          snippet,
          text: p.text,
        });

        if (hits.length >= limit) return hits;
      }
    }
  }
  return hits;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export type { Book, Chapter, Paragraph, SearchHit } from './types';
