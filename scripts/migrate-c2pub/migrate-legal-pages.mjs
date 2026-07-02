#!/usr/bin/env node
/**
 * 迁移 c2.pub 静态页到 CMS（用户中心 legal/*）
 *
 * 用法:
 *   node scripts/migrate-c2pub/migrate-legal-pages.mjs
 *   CMS_DATABASE_URL=postgresql://... node scripts/migrate-c2pub/migrate-legal-pages.mjs
 *   DRY_RUN=1 node scripts/migrate-c2pub/migrate-legal-pages.mjs
 */

import pg from 'pg';

const WP_BASE = (process.env.C2PUB_URL || 'https://www.c2.pub').replace(/\/$/, '');
const DRY_RUN = process.env.DRY_RUN === '1';

/** WP slug → CMS slug */
const PAGE_MAP = [
  { wpSlug: 'about', cmsSlug: 'legal/about', title: '关于我们' },
  { wpSlug: 'contact-us', cmsSlug: 'legal/contact', title: '联系我们' },
  { wpSlug: 'orasage-limited', cmsSlug: 'legal/privacy', title: '隐私政策' },
  { wpSlug: 'user-agreement', cmsSlug: 'legal/terms', title: '服务条款' },
];

function cmsDatabaseUrl() {
  if (process.env.CMS_DATABASE_URL) return process.env.CMS_DATABASE_URL;
  if (process.env.DATABASE_URL?.includes('orasage_cms')) return process.env.DATABASE_URL;
  return 'postgresql://orasage@127.0.0.1:5432/orasage_cms';
}

function stripHtml(s) {
  return (s || '').replace(/<[^>]+>/g, '').trim();
}

async function fetchWpPage(slug) {
  const url = `${WP_BASE}/wp-json/wp/v2/pages?slug=${encodeURIComponent(slug)}&status=publish`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`WP fetch ${slug} failed: ${res.status}`);
  const items = await res.json();
  return items[0] ?? null;
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
}

async function upsertLegalPage(client, map, item) {
  const title = stripHtml(item?.title?.rendered) || map.title;
  const legacyHtml = item?.content?.rendered || '';
  const sourceUrl = item?.link || `${WP_BASE}/${map.wpSlug}/`;
  const wpId = item?.id ?? null;
  const wpStatus = item?.status || 'publish';

  const byWp = wpId
    ? await client.query('SELECT id, slug FROM pages WHERE wp_type = $1 AND wp_id = $2', ['page', wpId])
    : { rows: [] };

  const bySlug = await client.query('SELECT id, slug FROM pages WHERE slug = $1', [map.cmsSlug]);
  const existing = byWp.rows[0] ?? bySlug.rows[0];

  if (existing) {
    if (DRY_RUN) {
      console.log(`[dry-run] update ${map.cmsSlug} ← ${map.wpSlug} (id=${existing.id})`);
      return 'updated';
    }
    await client.query(
      `UPDATE pages SET title=$1, slug=$2, app_source='main', legacy_html=$3, source_url=$4, wp_type='page', wp_id=$5, locale='zh-CN', wp_status=$6, updated_at=now()
       WHERE id=$7`,
      [title, map.cmsSlug, legacyHtml, sourceUrl, wpId, wpStatus, existing.id],
    );
    return 'updated';
  }

  if (DRY_RUN) {
    console.log(`[dry-run] insert ${map.cmsSlug} ← ${map.wpSlug}`);
    return 'inserted';
  }

  await client.query(
    `INSERT INTO pages (title, slug, app_source, legacy_html, source_url, wp_type, wp_id, locale, wp_status, created_at, updated_at)
     VALUES ($1, $2, 'main', $3, $4, 'page', $5, 'zh-CN', $6, now(), now())`,
    [title, map.cmsSlug, legacyHtml, sourceUrl, wpId, wpStatus],
  );
  return 'inserted';
}

async function main() {
  console.log(`[migrate-legal] source=${WP_BASE} dry_run=${DRY_RUN}`);

  const client = new pg.Client({ connectionString: cmsDatabaseUrl() });
  await client.connect();
  await ensureColumns(client);

  let inserted = 0;
  let updated = 0;
  let missing = 0;

  for (const map of PAGE_MAP) {
    const item = await fetchWpPage(map.wpSlug);
    if (!item) {
      console.warn(`[migrate-legal] WP page not found: ${map.wpSlug}`);
      missing += 1;
      continue;
    }
    const r = await upsertLegalPage(client, map, item);
    if (r === 'inserted') inserted += 1;
    else updated += 1;
    console.log(`[migrate-legal] ${r} ${map.cmsSlug} (${stripHtml(item.title?.rendered).slice(0, 40)})`);
  }

  await client.end();
  console.log(`[migrate-legal] done: inserted=${inserted} updated=${updated} missing=${missing}`);
}

main().catch((err) => {
  console.error('[migrate-legal] FAILED:', err);
  process.exit(1);
});
