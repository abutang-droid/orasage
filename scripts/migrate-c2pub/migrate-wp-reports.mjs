#!/usr/bin/env node
/**
 * 从 c2.pub WordPress MySQL 迁移用户 + orasage_reports → auth-service
 *
 * 环境变量:
 *   C2PUB_MYSQL_HOST     — 默认 35.213.189.218（需在主机面板放行 VPS IP）
 *   C2PUB_MYSQL_PORT     — 默认 3306
 *   C2PUB_MYSQL_USER
 *   C2PUB_MYSQL_PASSWORD
 *   C2PUB_MYSQL_DATABASE
 *   AUTH_DATABASE_URL    — postgresql://.../orasage_auth
 *   DRY_RUN=1            — 仅预览
 */

import mysql from 'mysql2/promise';
import pg from 'pg';
import bcrypt from 'bcryptjs';
import { unserialize } from 'php-serialize';

const DRY_RUN = process.env.DRY_RUN === '1';

function mysqlConfig() {
  const user = process.env.C2PUB_MYSQL_USER;
  const password = process.env.C2PUB_MYSQL_PASSWORD;
  const database = process.env.C2PUB_MYSQL_DATABASE;
  if (!user || !password || !database) {
    throw new Error('缺少 C2PUB_MYSQL_USER / C2PUB_MYSQL_PASSWORD / C2PUB_MYSQL_DATABASE');
  }
  return {
    host: process.env.C2PUB_MYSQL_HOST || '35.213.189.218',
    port: Number(process.env.C2PUB_MYSQL_PORT || 3306),
    user,
    password,
    database,
    connectTimeout: 20000,
  };
}

function authDatabaseUrl() {
  return process.env.AUTH_DATABASE_URL || process.env.DATABASE_URL || 'postgresql://orasage@127.0.0.1:5432/orasage_auth';
}

async function detectPrefix(conn) {
  const [rows] = await conn.query(
    `SELECT table_name FROM information_schema.tables
     WHERE table_schema = DATABASE() AND table_name LIKE '%usermeta' LIMIT 1`,
  );
  const name = rows[0]?.table_name || rows[0]?.TABLE_NAME;
  if (!name) throw new Error('未找到 usermeta 表');
  return name.replace(/usermeta$/, '');
}

function parseReports(metaValue) {
  if (!metaValue) return [];
  if (Array.isArray(metaValue)) return metaValue;
  if (typeof metaValue === 'string') {
    try {
      const parsed = unserialize(metaValue);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      try {
        return JSON.parse(metaValue);
      } catch {
        return [];
      }
    }
  }
  return [];
}

async function ensureAuthUser(pgClient, email, nickname) {
  const norm = email.toLowerCase().trim();
  if (!norm) return null;
  const existing = await pgClient.query('SELECT id FROM users WHERE email = $1', [norm]);
  if (existing.rows.length > 0) return { id: existing.rows[0].id, created: false };

  if (DRY_RUN) return { id: -1, created: true };

  const passwordHash = await bcrypt.hash(`migrate-${norm}-${Date.now()}`, 10);
  const inserted = await pgClient.query(
    `INSERT INTO users (email, password_hash, nickname, role) VALUES ($1, $2, $3, 'user') RETURNING id`,
    [norm, passwordHash, nickname || norm.split('@')[0]],
  );
  return { id: inserted.rows[0].id, created: true };
}

async function upsertReading(pgClient, userId, report) {
  const readingId = String(report.id || report.token || `wp-${Date.now()}`);
  const title = (report.report_title || report.title || '八字命理报告').slice(0, 200);
  const summary = (report.excerpt || '').slice(0, 2000) || null;
  const reason = report.plan_type ? `方案: ${report.plan_type}` : null;
  const reportUrl = report.report_url || '';

  const dup = await pgClient.query(
    'SELECT id FROM user_readings WHERE reading_id = $1 LIMIT 1',
    [readingId],
  );
  if (dup.rows.length > 0) return 'skipped';

  if (DRY_RUN) return 'inserted';

  await pgClient.query(
    `INSERT INTO user_readings (user_id, app_source, reading_id, title, summary, recommendation_reason, crystal_sku)
     VALUES ($1, 'bazi', $2, $3, $4, $5, NULL)`,
    [userId, readingId, title, summary, reason],
  );

  return 'inserted';
}

async function main() {
  console.log(`[migrate-reports] dry_run=${DRY_RUN}`);
  const mysqlConn = await mysql.createConnection(mysqlConfig());
  const prefix = await detectPrefix(mysqlConn);
  console.log(`[migrate-reports] table prefix: ${prefix}`);

  const usersTable = `${prefix}users`;
  const metaTable = `${prefix}usermeta`;

  const [rows] = await mysqlConn.query(
    `SELECT u.ID, u.user_email, u.display_name, m.meta_value
     FROM \`${usersTable}\` u
     INNER JOIN \`${metaTable}\` m ON m.user_id = u.ID AND m.meta_key = 'orasage_reports'
     WHERE u.user_email != ''`,
  );

  console.log(`[migrate-reports] ${rows.length} WP users with orasage_reports`);

  const pgClient = new pg.Client({ connectionString: authDatabaseUrl() });
  await pgClient.connect();

  let usersCreated = 0;
  let readingsInserted = 0;
  let readingsSkipped = 0;

  for (const row of rows) {
    const email = row.user_email;
    const reports = parseReports(row.meta_value);
    const { id: userId, created } = await ensureAuthUser(pgClient, email, row.display_name);
    if (created) usersCreated += 1;
    if (!userId || userId < 0) {
      readingsInserted += reports.length;
      continue;
    }

    for (const report of reports) {
      const r = await upsertReading(pgClient, userId, report);
      if (r === 'inserted') readingsInserted += 1;
      else readingsSkipped += 1;
    }
  }

  await mysqlConn.end();
  await pgClient.end();

  console.log(`[migrate-reports] done: users_created=${usersCreated} readings_inserted=${readingsInserted} readings_skipped=${readingsSkipped}`);
}

main().catch((err) => {
  if (err?.code === 'ER_HOST_NOT_PRIVILEGED' || String(err?.message).includes('not allowed to connect')) {
    console.error(`
[migrate-reports] MySQL 拒绝远程连接：需在 c2.pub 主机面板放行 OraSage VPS IP。

SiteGround: Site Tools → MySQL → Remote MySQL → 添加 34.75.40.67
cPanel: Remote MySQL → 添加访问主机 34.75.40.67

放行后重新运行本脚本。
`);
  }
  console.error('[migrate-reports] FAILED:', err.message || err);
  process.exit(1);
});
