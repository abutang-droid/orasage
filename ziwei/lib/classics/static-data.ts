/**
 * 古籍原典静态数据（CMS 不可用时的回退源）
 */

import type { Book } from './types';
import { guSuiFu } from './data/gusuifu';
import { ziWeiQuanJi } from './data/quanji';
import { ziWeiQuanShu } from './data/quanshu';

export const ALL_BOOKS: Book[] = [guSuiFu, ziWeiQuanJi, ziWeiQuanShu];

export const TOTAL_PARAGRAPHS = ALL_BOOKS.reduce(
  (sum, b) => sum + b.chapters.reduce((s, c) => s + c.paragraphs.length, 0),
  0,
);
