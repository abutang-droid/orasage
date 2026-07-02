#!/usr/bin/env node
/**
 * 从 c2.pub WordPress/WooCommerce 迁移用户、报告、订单到 orasage auth-service
 *
 * 需要环境变量:
 *   C2PUB_URL          — https://www.c2.pub
 *   WP_WOO_KEY         — WooCommerce REST API Consumer Key
 *   WP_WOO_SECRET      — WooCommerce REST API Consumer Secret
 *   AUTH_DATABASE_URL  — postgresql://.../orasage_auth
 *
 * 用法:
 *   WP_WOO_KEY=ck_... WP_WOO_SECRET=cs_... node scripts/migrate-c2pub/migrate-users-orders.mjs
 *   DRY_RUN=1 ...   # 仅预览
 */

import pg from 'pg';
import bcrypt from 'bcryptjs';

const WP_BASE = (process.env.C2PUB_URL || 'https://www.c2.pub').replace(/\/$/, '');
const DRY_RUN = process.env.DRY_RUN === '1';
const WOO_KEY = process.env.WP_WOO_KEY || '';
const WOO_SECRET = process.env.WP_WOO_SECRET || '';

function authDatabaseUrl() {
  return process.env.AUTH_DATABASE_URL || process.env.DATABASE_URL || 'postgresql://orasage@127.0.0.1:5432/orasage_auth';
}

function wooAuthHeader() {
  if (!WOO_KEY || !WOO_SECRET) return null;
  return `Basic ${Buffer.from(`${WOO_KEY}:${WOO_SECRET}`).toString('base64')}`;
}

async function fetchWooOrders(page = 1) {
  const auth = wooAuthHeader();
  if (!auth) throw new Error('缺少 WP_WOO_KEY / WP_WOO_SECRET');
  const url = `${WP_BASE}/wp-json/wc/v3/orders?per_page=100&page=${page}&status=any`;
  const res = await fetch(url, { headers: { Authorization: auth } });
  if (!res.ok) throw new Error(`WC orders API ${res.status}: ${await res.text()}`);
  const orders = await res.json();
  const totalPages = Number(res.headers.get('x-wp-totalpages') || 1);
  return { orders, totalPages };
}

async function fetchAllOrders() {
  const all = [];
  let page = 1;
  while (true) {
    const { orders, totalPages } = await fetchWooOrders(page);
    all.push(...orders);
    console.log(`[woo] orders page ${page}/${totalPages} (+${orders.length})`);
    if (page >= totalPages) break;
    page += 1;
  }
  return all;
}

function mapWooStatus(status) {
  const map = {
    pending: 'pending',
    processing: 'paid',
    'on-hold': 'pending',
    completed: 'completed',
    cancelled: 'cancelled',
    refunded: 'cancelled',
    failed: 'cancelled',
  };
  return map[status] || 'pending';
}

function wooOrderNo(order) {
  return `WC-${order.id}`;
}

async function ensureUser(client, email, nickname) {
  const norm = email.toLowerCase().trim();
  const existing = await client.query('SELECT id FROM users WHERE email = $1', [norm]);
  if (existing.rows.length > 0) return { id: existing.rows[0].id, created: false };

  if (DRY_RUN) return { id: -1, created: true };

  const passwordHash = await bcrypt.hash(`migrate-${norm}-${Date.now()}`, 10);
  const [row] = (await client.query(
    `INSERT INTO users (email, password_hash, nickname, role) VALUES ($1, $2, $3, 'user') RETURNING id`,
    [norm, passwordHash, nickname || norm.split('@')[0]],
  )).rows;
  return { id: row.id, created: true };
}

function detectAppSource(order) {
  const text = (order.line_items || []).map((i) => `${i.name || ''} ${i.sku || ''}`).join(' ').toLowerCase();
  if (text.includes('bazi') || text.includes('八字')) return 'bazi';
  if (text.includes('ziwei') || text.includes('紫微')) return 'ziwei';
  if (text.includes('tarot') || text.includes('塔罗')) return 'tarot';
  return 'shop';
}

async function upsertOrder(client, order, userId) {
  const orderNo = wooOrderNo(order);
  const title = (order.line_items || []).map((i) => i.name).join(', ') || `WooCommerce #${order.id}`;
  const amountCents = Math.round(parseFloat(order.total || '0') * 100);
  const sku = order.line_items?.[0]?.sku || null;
  const status = mapWooStatus(order.status);

  const dup = await client.query('SELECT id FROM user_orders WHERE order_no = $1', [orderNo]);
  if (dup.rows.length > 0) {
    if (!DRY_RUN) {
      await client.query(
        'UPDATE user_orders SET status = $1, title = $2, amount_cents = $3, sku = $4 WHERE order_no = $5',
        [status, title, amountCents, sku, orderNo],
      );
    }
    return 'updated';
  }

  const appSource = detectAppSource(order);

  if (DRY_RUN) return 'inserted';

  await client.query(
    `INSERT INTO user_orders (user_id, order_no, title, sku, amount_cents, currency, status, app_source)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [userId, orderNo, title, sku, amountCents, (order.currency || 'CNY').toUpperCase(), status, appSource],
  );
  return 'inserted';
}

async function main() {
  console.log(`[migrate-users-orders] source=${WP_BASE} dry_run=${DRY_RUN}`);

  if (!wooAuthHeader()) {
    console.error(`
缺少 WooCommerce API 凭证，无法迁移用户订单与报告元数据。

请在 c2.pub WordPress 后台生成:
  WooCommerce → 设置 → 高级 → REST API → 添加密钥（读权限）

然后执行:
  WP_WOO_KEY=ck_xxx WP_WOO_SECRET=cs_xxx node scripts/migrate-c2pub/migrate-users-orders.mjs

用户密码无法从 WordPress 导出，迁移后用户需通过「忘记密码」重置。
`);
    process.exit(1);
  }

  const orders = await fetchAllOrders();
  console.log(`[migrate-users-orders] ${orders.length} WooCommerce orders`);

  const client = new pg.Client({ connectionString: authDatabaseUrl() });
  await client.connect();

  let usersCreated = 0;
  let ordersInserted = 0;
  let ordersUpdated = 0;

  for (const order of orders) {
    const email = order.billing?.email;
    if (!email) continue;
    const { id: userId, created } = await ensureUser(client, email, order.billing?.first_name || '');
    if (created) usersCreated += 1;
    if (userId < 0) continue;
    const r = await upsertOrder(client, order, userId);
    if (r === 'inserted') ordersInserted += 1;
    else ordersUpdated += 1;
  }

  await client.end();
  console.log(`[migrate-users-orders] done: users_created=${usersCreated} orders_inserted=${ordersInserted} orders_updated=${ordersUpdated}`);
  console.log('[migrate-users-orders] 报告正文仍在 c2.pub user_meta(oragage_reports)，需 WordPress 数据库导出后另行迁移');
}

main().catch((err) => {
  console.error('[migrate-users-orders] FAILED:', err);
  process.exit(1);
});
