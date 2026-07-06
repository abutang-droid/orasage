/**
 * CMS 紫微知识库客户端 — 古籍原典 + 主星百科
 * 优先从 Payload CMS 读取，失败时回退到 ziwei 内置静态数据。
 */

import type { Book, Chapter, Paragraph } from './types';
import { ALL_BOOKS as STATIC_BOOKS, TOTAL_PARAGRAPHS as STATIC_TOTAL } from './static-data';

const CMS_INTERNAL_URL =
  process.env.CMS_URL || process.env.CMS_INTERNAL_URL || 'http://127.0.0.1:3120/cms';

type CmsBookDoc = {
  id: number;
  code: string;
  title: string;
  dynasty?: string | null;
  author?: string | null;
  intro?: string | null;
  wordCount?: number | null;
  sortOrder?: number | null;
  wpStatus?: 'publish' | 'draft' | null;
};

type CmsChapterDoc = {
  id: number;
  code: string;
  chapterIndex: number;
  title: string;
  subtitle?: string | null;
  paragraphs: Paragraph[];
  wpStatus?: 'publish' | 'draft' | null;
  book: CmsBookDoc | number;
};

type CmsListResponse<T> = {
  docs: T[];
  totalDocs: number;
};

type CmsStarDoc = {
  code: string;
  starName: string;
  brief: string;
  keywords?: string | null;
  nature?: string | null;
  element?: string | null;
  sortOrder?: number | null;
  wpStatus?: 'publish' | 'draft' | null;
};

function cmsApiUrl(apiPath: string): string {
  const relative = apiPath.replace(/^\/?api\//, '');
  if (typeof window !== 'undefined') {
    return `/api/cms/${relative}`;
  }
  const path = apiPath.startsWith('/') ? apiPath : `/${apiPath}`;
  return `${CMS_INTERNAL_URL}${path}`;
}

async function fetchCmsJson<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(cmsApiUrl(path), {
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

function mapChapterDoc(doc: CmsChapterDoc): { bookCode: string; chapterIdx: number; chapter: Chapter } {
  const bookCode = typeof doc.book === 'object' ? doc.book.code : '';
  return {
    bookCode,
    chapterIdx: doc.chapterIndex,
    chapter: {
      title: doc.title,
      subtitle: doc.subtitle ?? undefined,
      paragraphs: Array.isArray(doc.paragraphs) ? doc.paragraphs : [],
    },
  };
}

function assembleBooks(books: CmsBookDoc[], chapters: CmsChapterDoc[]): Book[] {
  const chaptersByBook = new Map<string, Chapter[]>();

  for (const doc of chapters) {
    const bookCode = typeof doc.book === 'object' ? doc.book.code : null;
    if (!bookCode) continue;
    const mapped = mapChapterDoc(doc);
    if (!chaptersByBook.has(bookCode)) chaptersByBook.set(bookCode, []);
    const list = chaptersByBook.get(bookCode)!;
    list[mapped.chapterIdx] = mapped.chapter;
  }

  return books
    .filter((b) => b.wpStatus !== 'draft')
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
    .map((b) => ({
      title: b.title,
      slug: b.code,
      dynasty: b.dynasty ?? '',
      author: b.author ?? '',
      intro: b.intro ?? '',
      wordCount: b.wordCount ?? 0,
      chapters: (chaptersByBook.get(b.code) ?? []).filter(Boolean),
    }))
    .filter((b) => b.chapters.length > 0);
}

let cachedBooks: Book[] | null = null;
let cacheStars: CmsStarDoc[] | null = null;

/** 从 CMS 加载古籍（含章节），失败返回 null */
export async function fetchClassicsFromCms(): Promise<Book[] | null> {
  const [booksRes, chaptersRes] = await Promise.all([
    fetchCmsJson<CmsListResponse<CmsBookDoc>>(
      '/api/ziwei-classics-books?limit=20&sort=sortOrder&where[wpStatus][equals]=publish',
    ),
    fetchCmsJson<CmsListResponse<CmsChapterDoc>>(
      '/api/ziwei-classics-chapters?limit=100&depth=1&where[wpStatus][equals]=publish',
    ),
  ]);

  if (!booksRes?.docs?.length || !chaptersRes?.docs?.length) return null;
  const assembled = assembleBooks(booksRes.docs, chaptersRes.docs);
  return assembled.length > 0 ? assembled : null;
}

/** 获取全部古籍（CMS 优先，静态回退） */
export async function loadAllBooks(): Promise<Book[]> {
  if (cachedBooks) return cachedBooks;

  if (process.env.ZIWEI_CMS_CLASSICS !== 'false') {
    const cms = await fetchClassicsFromCms();
    if (cms?.length) {
      cachedBooks = cms;
      return cms;
    }
  }

  cachedBooks = STATIC_BOOKS;
  return STATIC_BOOKS;
}

/** 同步导出静态书目（sitemap 等构建期使用） */
export { STATIC_BOOKS as ALL_BOOKS, STATIC_TOTAL as TOTAL_PARAGRAPHS };

export async function getTotalParagraphs(): Promise<number> {
  const books = await loadAllBooks();
  return books.reduce(
    (sum, b) => sum + b.chapters.reduce((s, c) => s + c.paragraphs.length, 0),
    0,
  );
}

export async function getBookBySlug(slug: string): Promise<Book | null> {
  const books = await loadAllBooks();
  return books.find((b) => b.slug === slug) ?? null;
}

export async function getChapter(bookSlug: string, chapterIdx: number) {
  const book = await getBookBySlug(bookSlug);
  if (!book) return null;
  const chapter = book.chapters[chapterIdx];
  if (!chapter) return null;
  return { book, chapter, chapterIdx };
}

export async function fetchKnowledgeStarsFromCms(): Promise<CmsStarDoc[] | null> {
  const res = await fetchCmsJson<CmsListResponse<CmsStarDoc>>(
    '/api/ziwei-knowledge-stars?limit=20&sort=sortOrder&where[wpStatus][equals]=publish',
  );
  if (!res?.docs?.length) return null;
  return res.docs;
}

export async function loadKnowledgeStars(): Promise<CmsStarDoc[] | null> {
  if (cacheStars) return cacheStars;
  if (process.env.ZIWEI_CMS_KNOWLEDGE !== 'false') {
    const stars = await fetchKnowledgeStarsFromCms();
    if (stars?.length) {
      cacheStars = stars;
      return stars;
    }
  }
  return null;
}

export type { CmsStarDoc };
