#!/usr/bin/env node
/**
 * 批量设置 CMS pages 的发布栏目（app_source）
 *
 * 用法:
 *   ALL=1 SECTION=daozang node scripts/migrate-c2pub/set-publish-section.mjs
 *   SECTION=famous WP_TYPE=post node scripts/migrate-c2pub/set-publish-section.mjs
 *   DRY_RUN=1 ALL=1 SECTION=daozang node scripts/migrate-c2pub/set-publish-section.mjs
 */

import pg from 'pg';

const SECTION = process.env.SECTION || 'daozang';
const WP_TYPE = process.env.WP_TYPE || '';
const ALL = process.env.ALL === '1';
const DRY_RUN = process.env.DRY_RUN === '1';

function cmsDatabaseUrl() {
  if (process.env.CMS_DATABASE_URL) return process.env.CMS_DATABASE_URL;
  if (process.env.DATABASE_URL?.includes('orasage_cms')) return process.env.DATABASE_URL;
  return 'postgresql://orasage@127.0.0.1:5432/orasage_cms';
}

async function main() {
  const pool = new pg.Pool({ connectionString: cmsDatabaseUrl() });
  const client = await pool.connect();

  try {
    let countSql = 'SELECT count(*)::int AS n FROM pages';
    let updateSql = 'UPDATE pages SET app_source = $1, updated_at = now()';
    const params = [SECTION];

    if (!ALL && WP_TYPE) {
      countSql += ' WHERE wp_type = $1';
      updateSql += ' WHERE wp_type = $2';
      params.push(WP_TYPE);
      const countRes = await client.query(countSql, [WP_TYPE]);
      console.log(`将更新 ${countRes.rows[0].n} 条（wp_type=${WP_TYPE}）→ app_source = ${SECTION}`);
      if (DRY_RUN) return;
      const res = await client.query(updateSql, params);
      console.log(`已更新 ${res.rowCount} 条`);
    } else if (ALL) {
      const countRes = await client.query(countSql);
      console.log(`将更新全部 ${countRes.rows[0].n} 条 → app_source = ${SECTION}`);
      if (DRY_RUN) return;
      const res = await client.query(updateSql, [SECTION]);
      console.log(`已更新 ${res.rowCount} 条`);
    } else {
      countSql += " WHERE wp_type = 'doc'";
      updateSql += " WHERE wp_type = 'doc'";
      const countRes = await client.query(countSql);
      console.log(`将更新 ${countRes.rows[0].n} 条知识库 → app_source = ${SECTION}`);
      if (DRY_RUN) return;
      const res = await client.query(updateSql, [SECTION]);
      console.log(`已更新 ${res.rowCount} 条`);
    }

    const summary = await client.query(
      'SELECT app_source, wp_type, count(*)::int AS n FROM pages GROUP BY app_source, wp_type ORDER BY app_source, wp_type',
    );
    console.table(summary.rows);
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
