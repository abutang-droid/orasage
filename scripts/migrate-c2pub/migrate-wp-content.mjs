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

const WP_BASE = (process.env.C2PUB_URL || 'https://www.c2.pub').replace(/\/$/, '');
const DRY_RUN = process.env.DRY_RUN === '1';

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

function makeSlug(item, type) {
  const locale = detectLocale(item.link);
  const base = item.slug || `item-${item.id}`;
  const slug = `${locale.toLowerCase()}/${base}`.replace(/[^a-z0-9/_-]+/gi, '-').replace(/-+/g, '-');
  return slug.slice(0, 180) || `c2-${type}-${item.id}`;
}

function detectAppSource(item) {
  const classes = item.class_list || [];
  const cats = (item.categories || []).join(',');
  if (/mingren|famous|personalidades|bazi|八字/i.test(classes.join(' ') + cats)) return 'bazi';
  return 'main';
}

async function fetchAll(endpoint) {
  const items = [];
  let page = 1;
  while (true) {
    const url = `${WP_BASE}/wp-json/wp/v2/${endpoint}?per_page=100&page=${page}&status=publish`;
    const res = await fetch(url);
    if (!res.ok) {
      if (page === 1) throw new Error(`WP API ${endpoint} failed: ${res.status}`);
      break;
    }
    const batch = await res.json();
    if (!Array.isArray(batch) || batch.length === 0) break;
    items.push(...batch);
    const totalPages = Number(res.headers.get('x-wp-totalpages') || 1);
    console.log(`[fetch] ${endpoint} page ${page}/${totalPages} (+${batch.length})`);
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
  `);
  await client.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS pages_wp_type_id_idx ON pages (wp_type, wp_id);
  `).catch(() => {});
}

async function upsertPage(client, item, type) {
  const title = stripHtml(item.title?.rendered) || `WP ${type} ${item.id}`;
  const slug = makeSlug(item, type);
  const legacyHtml = item.content?.rendered || '';
  const sourceUrl = item.link || '';
  const locale = detectLocale(sourceUrl);
  const appSource = detectAppSource(item);
  const wpId = item.id;

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
      `UPDATE pages SET title=$1, slug=$2, app_source=$3, legacy_html=$4, source_url=$5, locale=$6, updated_at=now()
       WHERE wp_type=$7 AND wp_id=$8`,
      [title, slug, appSource, legacyHtml, sourceUrl, locale, type, wpId],
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
    `INSERT INTO pages (title, slug, app_source, legacy_html, source_url, wp_type, wp_id, locale, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, now(), now())`,
    [title, finalSlug, appSource, legacyHtml, sourceUrl, type, wpId, locale],
  );
  return 'inserted';
}

async function main() {
  console.log(`[migrate-c2pub] source=${WP_BASE} dry_run=${DRY_RUN}`);
  const posts = await fetchAll('posts');
  const pages = await fetchAll('pages');
  console.log(`[migrate-c2pub] fetched ${posts.length} posts, ${pages.length} pages`);

  const client = new pg.Client({ connectionString: cmsDatabaseUrl() });
  await client.connect();
  await ensureColumns(client);

  let inserted = 0;
  let updated = 0;

  for (const item of posts) {
    const r = await upsertPage(client, item, 'post');
    if (r === 'inserted') inserted += 1;
    else updated += 1;
  }
  for (const item of pages) {
    const r = await upsertPage(client, item, 'page');
    if (r === 'inserted') inserted += 1;
    else updated += 1;
  }

  const { rows: [{ count }] } = await client.query(
    "SELECT count(*)::int AS count FROM pages WHERE wp_id IS NOT NULL",
  );
  await client.end();

  console.log(`[migrate-c2pub] done: inserted=${inserted} updated=${updated} total_migrated=${count}`);
}

main().catch((err) => {
  console.error('[migrate-c2pub] FAILED:', err);
  process.exit(1);
});
