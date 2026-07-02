# c2.pub 数据迁移

从 `https://www.c2.pub`（WordPress + WooCommerce）迁移资料到 OraSage 平台。

## 数据范围

| 数据 | 来源 | 目标 | 脚本 | 前置条件 |
|------|------|------|------|----------|
| 文章/页面 (110+33) | WP REST API 公开接口 | CMS `pages` 表 | `migrate-wp-content.mjs` | 无 |
| WooCommerce 订单 | WC REST API | auth `user_orders` | `migrate-users-orders.mjs` | `WP_WOO_KEY/SECRET` |
| WP 用户 | 订单 billing email | auth `users` | 同上 | 同上 |
| 八字报告元数据 | WP `user_meta.orasage_reports` | auth `user_readings` | 待 DB 导出 | MySQL 只读权限 |

## 一、迁移文章/页面到 CMS（可立即执行）

在 VPS 上：

```bash
cd /opt/orasage
git pull origin cursor/migrate-c2pub-9ded   # 合并后改为 main

# CMS 新字段迁移
cd cms && set -a && source .env && set +a && npm run migrate

# 导入 c2.pub 内容
CMS_DATABASE_URL=$(grep DATABASE_URL cms/.env | cut -d= -f2-) \
  node scripts/migrate-c2pub/migrate-wp-content.mjs

# 预览（不写库）
DRY_RUN=1 node scripts/migrate-c2pub/migrate-wp-content.mjs
```

验证：

```bash
source /opt/orasage/cms/.env
psql "$DATABASE_URL" -c "SELECT count(*) FROM pages WHERE wp_id IS NOT NULL;"
curl -s "https://cms.orasage.com/api/pages?limit=3"
```

迁移字段：
- `title` / `slug` / `app_source`（名人案例 → `bazi` 或 `main`）
- `legacy_html` — 原 WordPress HTML 正文
- `source_url` — 原 c2.pub 链接
- `wp_type` + `wp_id` — 幂等去重

## 二、迁移用户与订单（需 API 密钥）

1. 登录 c2.pub WordPress 后台
2. **WooCommerce → 设置 → 高级 → REST API → 添加密钥**（读权限即可）
3. 在 VPS 执行：

```bash
WP_WOO_KEY=ck_xxxx WP_WOO_SECRET=cs_xxxx \
AUTH_DATABASE_URL=$(grep DATABASE_URL /opt/orasage/.env | cut -d= -f2-) \
  node /opt/orasage/scripts/migrate-c2pub/migrate-users-orders.mjs
```

注意：
- WordPress 密码哈希无法直接迁移，用户需通过 auth 注册页「忘记密码」重置
- 已存在相同邮箱的用户会复用，不会重复创建
- 订单号格式：`WC-{woocommerce_order_id}`

## 三、八字报告（MySQL 只读）

报告存在 WordPress `wp_usermeta.meta_key = 'orasage_reports'`。

### 3.1 放行 VPS IP（必做）

c2.pub MySQL 默认禁止外网连接。在主机面板添加 **Remote MySQL** 白名单：

| 主机商 | 路径 |
|--------|------|
| **SiteGround** | Site Tools → MySQL → **Remote MySQL** → 添加 `34.75.40.67` |
| **cPanel** | Remote MySQL → Access Hosts → `34.75.40.67` |

OraSage VPS IP：`34.75.40.67`

### 3.2 执行迁移

```bash
cd /opt/orasage/scripts/migrate-c2pub && npm ci

C2PUB_MYSQL_HOST=35.213.189.218 \
C2PUB_MYSQL_USER=你的用户 \
C2PUB_MYSQL_PASSWORD='你的密码' \
C2PUB_MYSQL_DATABASE=你的库名 \
AUTH_DATABASE_URL=$(grep DATABASE_URL /opt/orasage/.env | cut -d= -f2-) \
  node migrate-wp-reports.mjs
```

凭证来源：`wp-config.php` 中的 `DB_NAME` / `DB_USER` / `DB_PASSWORD`（建议另建只读账号）。

**勿将密码提交到 Git 或发到公开渠道。** 迁移完成后请轮换数据库密码。

## 四、迁移后

- main 门户「名人案例 / 道藏精选」可改为从 CMS API 读取 `legacy_html` 页面
- c2.pub 可设 301 到 `orasage.com` 或保留为只读归档
- 验证：`admin.orasage.com` 订单列表应出现 `WC-*` 订单
