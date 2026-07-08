#!/usr/bin/env node
/**
 * 四部全书（三命通会/渊海子平/神峰通考/星命总括）章节标题规范化
 *
 * c2.pub 章节文档 slug 为 item-<wp_id>，WP 标题多为「三命通会 – 第N章」，
 * 正文 HTML 内嵌真实章名（book-detail-title）与书名（book-detail-tip-value）。
 * 本脚本：
 *   1. 从 legacy_html 提取章名/书名，改写 title 为「书名 · 章名」
 *   2. sort_weight 设为 wp_id（与源站导入顺序一致，类内唯一排序）
 *   3. 按正文书名校正 daozang_category（如误挂渊海子平的紫微章节 → ziweidoushu）
 *   4. 重生成 excerpt
 *   5. daozang_volume 从正文 QR id 或标题「卷上/卷12」提取（供按卷二级目录）
 *
 * 用法:
 *   node scripts/migrate-c2pub/normalize-daozang-books.mjs
 *   DRY_RUN=1 node scripts/migrate-c2pub/normalize-daozang-books.mjs
 */

import pg from 'pg';
import { DAOZANG_CATEGORIES } from './lib/daozang-taxonomy.mjs';
import { decodeHtmlEntities, makeExcerpt } from './lib/legacy-html.mjs';
import { resolveVolumeKey } from './lib/daozang-volumes.mjs';

const DRY_RUN = process.env.DRY_RUN === '1';

/** 正文「书名」字段 → 道藏分类 key（含误挂修正） */
const HTML_BOOK_TO_CATEGORY = {
  三命通会: 'sanmingtonghui',
  渊海子平: 'yuanhaiziping',
  神峰通考: 'shenfengtongkao',
  星命总括: 'xingmingzongkuo',
  // 误挂在全书分类下的独立典籍 → 归位
  斗数发微论: 'ziweidoushu',
  紫微斗数全书: 'ziweidoushu',
  骨髓赋: 'ziweidoushu',
  十喻歌: 'ziweidoushu',
};

const BOOK_CATEGORY_KEYS = new Set([
  'sanmingtonghui',
  'yuanhaiziping',
  'shenfengtongkao',
  'xingmingzongkuo',
]);

function cmsDatabaseUrl() {
  if (process.env.CMS_DATABASE_URL) return process.env.CMS_DATABASE_URL;
  if (process.env.DATABASE_URL?.includes('orasage_cms')) return process.env.DATABASE_URL;
  return 'postgresql://orasage@127.0.0.1:5432/orasage_cms';
}

/** 从 legacy_html 提取章名与书名（问真八字书籍模板） */
export function parseBookChapter(html) {
  const raw = String(html || '');
  const chapterMatch = raw.match(/class=["']book-detail-title["'][^>]*>([^<]+)</i);
  const bookMatch = raw.match(/book-detail-tip-value["']>([^<]+)<\/span>作者/i);
  let chapter = chapterMatch ? decodeHtmlEntities(chapterMatch[1]).trim() : '';
  let book = bookMatch ? decodeHtmlEntities(bookMatch[1]).trim() : '';

  if (!chapter) {
    const titleMatch = raw.match(/<title>([^<]+)<\/title>/i);
    if (titleMatch) chapter = decodeHtmlEntities(titleMatch[1]).trim();
  }

  return { book, chapter };
}

/** 生成规范标题：「书名 · 章名」；书名与章名相同时只保留章名 */
export function formatBookTitle(book, chapter) {
  if (!chapter) return null;
  if (!book || book === chapter) return chapter;
  return `${book} · ${chapter}`;
}

export function categoryFromHtmlBook(book) {
  if (!book) return null;
  const direct = HTML_BOOK_TO_CATEGORY[book];
  if (direct) return direct;
  // 部分章节书名带副标题，按前缀匹配
  for (const cat of DAOZANG_CATEGORIES) {
    if (cat.titlePrefix && book.startsWith(cat.titlePrefix)) return cat.key;
  }
  return null;
}

async function main() {
  console.log(`[normalize-daozang-books] dry_run=${DRY_RUN}`);

  const client = new pg.Client({ connectionString: cmsDatabaseUrl() });
  await client.connect();
  await client.query(`
    ALTER TABLE pages ADD COLUMN IF NOT EXISTS daozang_volume varchar(20);
    CREATE INDEX IF NOT EXISTS pages_daozang_volume_idx ON pages (daozang_volume);
  `);

  const { rows } = await client.query(
    `SELECT id, title, slug, wp_id, legacy_html, daozang_category, sort_weight, daozang_volume, excerpt
     FROM pages
     WHERE app_source = 'daozang'
       AND wp_status = 'publish'
       AND wp_type = 'doc'
       AND (
         daozang_category IN ('sanmingtonghui', 'yuanhaiziping', 'shenfengtongkao', 'xingmingzongkuo')
         OR slug LIKE 'docs/zh-cn/item-%'
       )
     ORDER BY wp_id`,
  );
  console.log(`[normalize-daozang-books] 待处理 ${rows.length} 条章节文档`);

  const stats = { updated: 0, reclassified: 0, noParse: 0, samples: [] };

  for (const row of rows) {
    const { book, chapter } = parseBookChapter(row.legacy_html);
    const newTitle = formatBookTitle(book, chapter);
    if (!newTitle) {
      stats.noParse += 1;
      if (stats.noParse <= 5) console.warn(`[skip] 无法解析: ${row.slug} (${row.title})`);
      continue;
    }

    const htmlCategory = categoryFromHtmlBook(book);
    const updates = {};

    if (newTitle !== decodeHtmlEntities(row.title).trim()) updates.title = newTitle;

    const weight = row.wp_id != null ? Number(row.wp_id) : null;
    if (weight != null && Number(row.sort_weight) !== weight) updates.sort_weight = weight;

    const volumeKey = resolveVolumeKey(newTitle, row.legacy_html);
    if (volumeKey && row.daozang_volume !== volumeKey) updates.daozang_volume = volumeKey;

    if (htmlCategory && row.daozang_category !== htmlCategory) {
      updates.daozang_category = htmlCategory;
      stats.reclassified += 1;
    }

    if (row.legacy_html) {
      const excerpt = makeExcerpt(row.legacy_html, newTitle);
      if (excerpt && excerpt !== row.excerpt) updates.excerpt = excerpt;
    }

    const keys = Object.keys(updates);
    if (keys.length === 0) continue;
    stats.updated += 1;

    if (stats.samples.length < 5) {
      stats.samples.push(`${row.slug}: ${decodeHtmlEntities(row.title)} → ${newTitle}`);
    }

    if (DRY_RUN) {
      console.log(
        `[dry-run] ${row.slug}: ${keys.map((k) => `${k}=${String(updates[k]).slice(0, 50)}`).join(', ')}`,
      );
      continue;
    }

    const sets = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
    await client.query(`UPDATE pages SET ${sets}, updated_at = now() WHERE id = $${keys.length + 1}`, [
      ...keys.map((k) => updates[k]),
      row.id,
    ]);
  }

  await client.end();

  console.log('\n[normalize-daozang-books] 完成:');
  console.log(`  更新 ${stats.updated} 条，校正分类 ${stats.reclassified} 条，无法解析 ${stats.noParse} 条`);
  if (stats.samples.length) {
    console.log('  示例:');
    for (const s of stats.samples) console.log(`    ${s}`);
  }
}

main().catch((err) => {
  console.error('[normalize-daozang-books] FAILED:', err);
  process.exit(1);
});
