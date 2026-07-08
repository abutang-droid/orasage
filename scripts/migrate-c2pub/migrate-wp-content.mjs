#!/usr/bin/env node
/**
 * 从 c2.pub WordPress 公开 REST API 迁移文章/页面到 CMS pages 表
 *
 * 用法:
 *   node scripts/migrate-c2pub/migrate-wp-content.mjs
 *   C2PUB_URL=https://www.c2.pub CMS_DATABASE_URL=postgresql://... node scripts/migrate-c2pub/migrate-wp-content.mjs
 *   DRY_RUN=1 node scripts/migrate-c2pub/migrate-wp-content.mjs
 */

import pg from 'pg';
import {
  categoryFromWpTerms,
  categoryFromSlug,
  categoryFromTitle,
  sortWeightFromSlug,
  sortWeightFromTitle,
} from './lib/daozang-taxonomy.mjs';
import { makeExcerpt } from './lib/legacy-html.mjs';

const WP_BASE = (process.env.C2PUB_URL || 'https://www.c2.pub').replace(/\/$/, '');
const DRY_RUN = process.env.DRY_RUN === '1';

function wpAuthHeaders() {
  const user = process.env.WP_APP_USER;
  const pass = (process.env.WP_APP_PASSWORD || '').replace(/\s+/g, '');
  if (!user || !pass) return {};
  return { Authorization: `Basic ${Buffer.from(`${user}:${pass}`).toString('base64')}` };
}

function wpStatusParam(endpoint) {
  if (process.env.WP_STATUS) return process.env.WP_STATUS;
  if (wpAuthHeaders().Authorization && endpoint === 'docs') return 'publish,draft';
  return 'publish';
}

function cmsDatabaseUrl() {
  if (process.env.CMS_DATABASE_URL) return process.env.CMS_DATABASE_URL;
  if (process.env.DATABASE_URL?.includes('orasage_cms')) return process.env.DATABASE_URL;
  return 'postgresql://orasage@127.0.0.1:5432/orasage_cms';
}

function stripHtml(s) {
  return (s || '').replace(/<[^>]+>/g, '').trim();
}

function detectLocale(link) {
  try {
    const parts = new URL(link).pathname.split('/').filter(Boolean);
    const locale = parts[0]?.toLowerCase();
    const map = { pt: 'pt', en: 'en', 'zh-cn': 'zh-CN', zh_hk: 'zh-HK', 'zh-tw': 'zh-TW' };
    if (locale && map[locale]) return map[locale];
  } catch {
    /* ignore */
  }
  return 'zh-CN';
}

function detectAppSource(item, type) {
  if (type === 'doc') return 'daozang';
  if (type === 'post') return 'famous';
  const classes = item.class_list || [];
  const cats = (item.categories || []).join(',');
  if (/mingren|famous|personalidades|bazi|八字/i.test(classes.join(' ') + cats)) return 'famous';
  return 'daozang';
}

function makeSlug(item, type) {
  const locale = detectLocale(item.link);
  const base = item.slug || `item-${item.id}`;
  const prefix = type === 'doc' ? 'docs' : type === 'page' ? 'pages' : 'posts';
  const slug = `${prefix}/${locale.toLowerCase()}/${base}`.replace(/[^a-z0-9/_-]+/gi, '-').replace(/-+/g, '-');
  return slug.slice(0, 180) || `c2-${type}-${item.id}`;
}

async function fetchAll(endpoint) {
  const items = [];
  const status = wpStatusParam(endpoint);
  let page = 1;
  const headers = wpAuthHeaders();
  while (true) {
    const url = `${WP_BASE}/wp-json/wp/v2/${endpoint}?per_page=100&page=${page}&status=${encodeURIComponent(status)}`;
    const res = await fetch(url, { headers });
    if (!res.ok) {
      if (page === 1) throw new Error(`WP API ${endpoint} failed: ${res.status} ${await res.text()}`);
      break;
    }
    const batch = await res.json();
    if (!Array.isArray(batch) || batch.length === 0) break;
    items.push(...batch);
    const totalPages = Number(res.headers.get('x-wp-totalpages') || 1);
    console.log(`[fetch] ${endpoint} (${status}) page ${page}/${totalPages} (+${batch.length})`);
    if (page >= totalPages) break;
    page += 1;
  }
  return items;
}

async function ensureColumns(client) {
  await client.query(`
    ALTER TABLE pages ADD COLUMN IF NOT EXISTS legacy_html text;
    ALTER TABLE pages ADD COLUMN IF NOT EXISTS source_url varchar(500);
    ALTER TABLE pages ADD COLUMN IF NOT EXISTS wp_type varchar(20);
    ALTER TABLE pages ADD COLUMN IF NOT EXISTS wp_id numeric;
    ALTER TABLE pages ADD COLUMN IF NOT EXISTS locale varchar(20);
    ALTER TABLE pages ADD COLUMN IF NOT EXISTS wp_status varchar(20);
  `);
  await client.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS pages_wp_type_id_idx ON pages (wp_type, wp_id);
  `).catch(() => {});
  // 道藏分类字段（与 cms/src/migrations/2026070*_daozang_* 迁移一致）
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
  for (const key of ['sanmingtonghui', 'yuanhaiziping', 'shenfengtongkao', 'xingmingzongkuo']) {
    await client.query(`
      DO $$ BEGIN
        ALTER TYPE "public"."enum_pages_daozang_category" ADD VALUE IF NOT EXISTS '${key}';
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);
  }
  await client.query(`
    ALTER TABLE pages ADD COLUMN IF NOT EXISTS daozang_category "enum_pages_daozang_category";
    ALTER TABLE pages ADD COLUMN IF NOT EXISTS sort_weight numeric;
    ALTER TABLE pages ADD COLUMN IF NOT EXISTS excerpt text;
    CREATE INDEX IF NOT EXISTS pages_daozang_category_idx ON pages (daozang_category);
  `);
}

async function upsertPage(client, item, type) {
  const title = stripHtml(item.title?.rendered) || `WP ${type} ${item.id}`;
  const slug = makeSlug(item, type);
  const legacyHtml = item.content?.rendered || '';
  const sourceUrl = item.link || '';
  const locale = detectLocale(sourceUrl);
  const appSource = detectAppSource(item, type);
  const wpId = item.id;

  const wpStatus = item.status || 'publish';

  // 道藏归类 + 摘要（doc_category 权威，slug 编号段、标题前缀依次兜底；WP 静态页不归类）
  const isKnowledge = appSource === 'daozang' && type !== 'page';
  const daozangCategory = isKnowledge
    ? (categoryFromWpTerms(item.doc_category) || categoryFromSlug(slug) || categoryFromTitle(title))
        ?.key ?? null
    : null;
  const sortWeight = isKnowledge ? sortWeightFromSlug(slug) ?? sortWeightFromTitle(title) : null;
  const excerpt = legacyHtml ? makeExcerpt(legacyHtml, title) : null;

  const existing = await client.query(
    'SELECT id, slug FROM pages WHERE wp_type = $1 AND wp_id = $2',
    [type, wpId],
  );

  if (existing.rows.length > 0) {
    if (DRY_RUN) {
      console.log(`[dry-run] update ${type}#${wpId} → ${title.slice(0, 40)}`);
      return 'updated';
    }
    await client.query(
      `UPDATE pages SET title=$1, slug=$2, app_source=$3, legacy_html=$4, source_url=$5, locale=$6, wp_status=$7,
         daozang_category=$8, sort_weight=$9, excerpt=$10, updated_at=now()
       WHERE wp_type=$11 AND wp_id=$12`,
      [title, slug, appSource, legacyHtml, sourceUrl, locale, wpStatus, daozangCategory, sortWeight, excerpt, type, wpId],
    );
    return 'updated';
  }

  // slug 冲突时加后缀
  let finalSlug = slug;
  const slugDup = await client.query('SELECT 1 FROM pages WHERE slug = $1', [finalSlug]);
  if (slugDup.rows.length > 0) finalSlug = `${slug}-wp${wpId}`;

  if (DRY_RUN) {
    console.log(`[dry-run] insert ${type}#${wpId} → ${title.slice(0, 40)} (${finalSlug})`);
    return 'inserted';
  }

  await client.query(
    `INSERT INTO pages (title, slug, app_source, legacy_html, source_url, wp_type, wp_id, locale, wp_status,
       daozang_category, sort_weight, excerpt, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, now(), now())`,
    [title, finalSlug, appSource, legacyHtml, sourceUrl, type, wpId, locale, wpStatus, daozangCategory, sortWeight, excerpt],
  );
  return 'inserted';
}

async function main() {
  const endpoints = (process.env.MIGRATE_ONLY || 'posts,pages,docs').split(',').map((s) => s.trim()).filter(Boolean);
  console.log(`[migrate-c2pub] source=${WP_BASE} dry_run=${DRY_RUN} endpoints=${endpoints.join(',')} auth=${Boolean(wpAuthHeaders().Authorization)}`);

  const buckets = {};
  for (const ep of endpoints) {
    buckets[ep] = await fetchAll(ep);
    console.log(`[migrate-c2pub] fetched ${buckets[ep].length} ${ep}`);
  }

  const client = new pg.Client({ connectionString: cmsDatabaseUrl() });
  await client.connect();
  await ensureColumns(client);

  let inserted = 0;
  let updated = 0;

  const typeMap = { posts: 'post', pages: 'page', docs: 'doc' };
  for (const ep of endpoints) {
    const wpType = typeMap[ep] || ep.replace(/s$/, '');
    for (const item of buckets[ep]) {
      const r = await upsertPage(client, item, wpType);
      if (r === 'inserted') inserted += 1;
      else updated += 1;
    }
  }

  const { rows: [{ count }] } = await client.query(
    "SELECT count(*)::int AS count FROM pages WHERE wp_id IS NOT NULL",
  );
  const byType = await client.query(
    'SELECT wp_type, count(*)::int AS n FROM pages WHERE wp_id IS NOT NULL GROUP BY wp_type ORDER BY wp_type',
  );
  await client.end();

  console.log(`[migrate-c2pub] done: inserted=${inserted} updated=${updated} total_migrated=${count}`);
  for (const row of byType.rows) console.log(`  ${row.wp_type}: ${row.n}`);
}

main().catch((err) => {
  console.error('[migrate-c2pub] FAILED:', err);
  process.exit(1);
});
