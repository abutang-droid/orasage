#!/usr/bin/env node
/**
 * 道藏内容自动归类 + 摘要生成（幂等，可重复执行）
 *
 * 对 CMS pages 表中 app_source='daozang' 的内容：
 *   1. 归类：优先用 c2.pub WordPress `doc_category`（按 wp_id 关联），
 *      API 不可达或无归属时按 slug 编号段（docs/zh-cn/A_B_C 的 A_B）兜底。
 *   2. 排序：slug 编号段最后一节 → sort_weight（类内排序）。
 *   3. 摘要：legacy_html 清洗后生成 excerpt（约 140 字）。
 *   4. 治理：junk 页面与人工裁决的跨类重复条目标记为 draft，
 *      输出跨类同名条目报告。
 *
 * 用法:
 *   node scripts/migrate-c2pub/classify-daozang.mjs
 *   DRY_RUN=1 node scripts/migrate-c2pub/classify-daozang.mjs
 *   SKIP_WP=1 node scripts/migrate-c2pub/classify-daozang.mjs   # 仅用 slug 规则，不访问 WP API
 */

import pg from 'pg';
import { DAOZANG_CATEGORIES, categoryFromWpTerms, categoryFromSlug, sortWeightFromSlug } from './lib/daozang-taxonomy.mjs';
import { decodeHtmlEntities, makeExcerpt } from './lib/legacy-html.mjs';

const WP_BASE = (process.env.C2PUB_URL || 'https://www.c2.pub').replace(/\/$/, '');
const DRY_RUN = process.env.DRY_RUN === '1';
const SKIP_WP = process.env.SKIP_WP === '1';

/**
 * 人工裁决的跨类重复条目：内容与另一分类下的同名条目重复，标记为 draft 下线。
 * - docs/zh-cn/2_1_27-3「滴天髓阐微」：命理典籍误挂在「中医」分类，与 3_1_7 重复，保留八字类的 3_1_7。
 */
const DUPLICATE_DRAFT_SLUGS = new Set(['docs/zh-cn/2_1_27-3']);

/** 与 main/src/lib/cms.ts 的 isJunkCmsPage 一致 */
const JUNK_SLUG_RE =
  /^(cart|checkout|confirmation|order-history|wiki|shop|store|my-account|sample-page|hello-world)(\/|$)/i;
const JUNK_TITLE_RE =
  /^(cart|checkout|confirmation|order history|wiki|shop|store|my account|sample page|hello world)$/i;

function isJunkPage(title, slug) {
  const cleanTitle = decodeHtmlEntities(title).trim();
  const cleanSlug = String(slug || '').replace(/^\/+/, '').toLowerCase();
  if (JUNK_SLUG_RE.test(cleanSlug)) return true;
  if (JUNK_TITLE_RE.test(cleanTitle)) return true;
  if (/^zh-cn\/(cart|checkout|order-history|wiki)/i.test(cleanSlug)) return true;
  return false;
}

function cmsDatabaseUrl() {
  if (process.env.CMS_DATABASE_URL) return process.env.CMS_DATABASE_URL;
  if (process.env.DATABASE_URL?.includes('orasage_cms')) return process.env.DATABASE_URL;
  return 'postgresql://orasage@127.0.0.1:5432/orasage_cms';
}

async function ensureColumns(client) {
  await client.query(`
    DO $$ BEGIN
      CREATE TYPE "public"."enum_pages_daozang_category" AS ENUM(
        'quanfa', 'zhongyi', 'bazi', 'ziweidoushu', 'qizhengsheyu',
        'yijing', 'liuyao', 'meihuayishu', 'qimendunjia', 'daliuren',
        'dixiang', 'renxiang', 'xingxiang'
      );
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);
  await client.query(`
    ALTER TABLE pages ADD COLUMN IF NOT EXISTS daozang_category "enum_pages_daozang_category";
    ALTER TABLE pages ADD COLUMN IF NOT EXISTS sort_weight numeric;
    ALTER TABLE pages ADD COLUMN IF NOT EXISTS excerpt text;
    CREATE INDEX IF NOT EXISTS pages_daozang_category_idx ON pages (daozang_category);
  `);
}

/** 拉取 WP 全部 docs 的 wp_id → doc_category 映射（权威归类来源） */
async function fetchWpCategoryMap() {
  const map = new Map();
  if (SKIP_WP) {
    console.log('[wp] SKIP_WP=1，跳过 WP API，仅用 slug 编号规则归类');
    return map;
  }
  try {
    let page = 1;
    while (true) {
      const url = `${WP_BASE}/wp-json/wp/v2/docs?per_page=100&page=${page}&status=publish&_fields=id,slug,doc_category`;
      const res = await fetch(url);
      if (!res.ok) {
        if (page === 1) throw new Error(`WP docs API failed: ${res.status}`);
        break;
      }
      const batch = await res.json();
      if (!Array.isArray(batch) || batch.length === 0) break;
      for (const item of batch) map.set(Number(item.id), item.doc_category || []);
      const totalPages = Number(res.headers.get('x-wp-totalpages') || 1);
      if (page >= totalPages) break;
      page += 1;
    }
    console.log(`[wp] 已拉取 ${map.size} 篇 docs 的分类归属`);
  } catch (err) {
    console.warn(`[wp] WP API 不可达（${err.message}），回退到 slug 编号规则归类`);
  }
  return map;
}

async function main() {
  console.log(`[classify-daozang] source=${WP_BASE} dry_run=${DRY_RUN}`);

  const wpCategoryMap = await fetchWpCategoryMap();

  const client = new pg.Client({ connectionString: cmsDatabaseUrl() });
  await client.connect();
  await ensureColumns(client);

  const { rows } = await client.query(
    `SELECT id, title, slug, wp_id, wp_status, legacy_html, daozang_category, sort_weight, excerpt
     FROM pages WHERE app_source = 'daozang' ORDER BY slug`,
  );
  console.log(`[classify-daozang] 道藏内容共 ${rows.length} 条`);

  const stats = { classified: 0, bySlugRule: 0, unclassified: [], drafted: [], updated: 0 };
  const perCategory = Object.fromEntries(DAOZANG_CATEGORIES.map((c) => [c.key, 0]));
  const titleIndex = new Map();

  for (const row of rows) {
    const updates = {};

    // 1) junk / 人工裁决重复条目 → draft
    const shouldDraft = isJunkPage(row.title, row.slug) || DUPLICATE_DRAFT_SLUGS.has(row.slug);
    if (shouldDraft && row.wp_status !== 'draft') {
      updates.wp_status = 'draft';
      stats.drafted.push(`${row.slug} ${decodeHtmlEntities(row.title)}`);
    }

    // 2) 归类：WP doc_category 优先，slug 编号规则兜底
    if (!shouldDraft) {
      const wpTerms = row.wp_id != null ? wpCategoryMap.get(Number(row.wp_id)) : undefined;
      let category = categoryFromWpTerms(wpTerms);
      if (!category) {
        category = categoryFromSlug(row.slug);
        if (category) stats.bySlugRule += 1;
      }
      if (category) {
        stats.classified += 1;
        perCategory[category.key] += 1;
        if (row.daozang_category !== category.key) updates.daozang_category = category.key;
      } else {
        stats.unclassified.push(`${row.slug} ${decodeHtmlEntities(row.title)}`);
      }

      // 跨类同名条目报告
      const titleKey = decodeHtmlEntities(row.title).trim();
      const seen = titleIndex.get(titleKey);
      if (seen && seen.category !== category?.key) {
        console.warn(`[dup] 「${titleKey}」跨类重复: ${seen.slug} (${seen.category}) vs ${row.slug} (${category?.key})`);
      }
      if (!seen) titleIndex.set(titleKey, { slug: row.slug, category: category?.key });
    }

    // 3) 类内排序权重
    const weight = sortWeightFromSlug(row.slug);
    if (weight != null && Number(row.sort_weight) !== weight) updates.sort_weight = weight;

    // 4) 摘要
    if (row.legacy_html) {
      const excerpt = makeExcerpt(row.legacy_html, row.title);
      if (excerpt && excerpt !== row.excerpt) updates.excerpt = excerpt;
    }

    const keys = Object.keys(updates);
    if (keys.length === 0) continue;
    stats.updated += 1;

    if (DRY_RUN) {
      console.log(`[dry-run] ${row.slug}: ${keys.map((k) => `${k}=${String(updates[k]).slice(0, 40)}`).join(', ')}`);
      continue;
    }
    const sets = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
    await client.query(`UPDATE pages SET ${sets}, updated_at = now() WHERE id = $${keys.length + 1}`, [
      ...keys.map((k) => updates[k]),
      row.id,
    ]);
  }

  await client.end();

  console.log('\n[classify-daozang] 归类结果:');
  for (const cat of DAOZANG_CATEGORIES) {
    console.log(`  ${cat.top.padEnd(5)} ${cat.key.padEnd(14)} ${perCategory[cat.key]} 篇`);
  }
  console.log(`  已归类 ${stats.classified}（其中 slug 规则兜底 ${stats.bySlugRule}）/ 本次更新 ${stats.updated} 行`);
  if (stats.drafted.length) {
    console.log(`  转为 draft ${stats.drafted.length} 条:`);
    for (const s of stats.drafted) console.log(`    - ${s}`);
  }
  if (stats.unclassified.length) {
    console.log(`  未归类 ${stats.unclassified.length} 条（请人工在 CMS 后台补充分类）:`);
    for (const s of stats.unclassified) console.log(`    - ${s}`);
  }
}

main().catch((err) => {
  console.error('[classify-daozang] FAILED:', err);
  process.exit(1);
});
