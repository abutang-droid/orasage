# c2.pub → CMS 内容迁移（知识库）

**仅迁移内容，不迁移用户/订单。**

## 内容来源（BetterDocs + WordPress）

| c2.pub 类型 | 数量 | CMS `wp_type` | 说明 |
|-------------|------|---------------|------|
| `docs` | ~132 | `doc` | **知识库**（易筋经、五禽戏、易经、中医等） |
| `posts` | ~110 | `post` | 名人八字案例 |
| `pages` | ~33 | `page` | 静态页面 |

## 一键迁移（VPS）

```bash
cd /opt/orasage/scripts/migrate-c2pub && npm ci

# 仅知识库
MIGRATE_ONLY=docs CMS_DATABASE_URL=$(grep DATABASE_URL /opt/orasage/cms/.env | cut -d= -f2-) \
  node migrate-wp-content.mjs

# 全部内容（知识库 + 文章 + 页面）
CMS_DATABASE_URL=$(grep DATABASE_URL /opt/orasage/cms/.env | cut -d= -f2-) \
  node migrate-wp-content.mjs
```

在 CMS 后台查看：https://cms.orasage.com/admin/collections/pages

筛选：`wp_type = doc` 即为知识库条目。

## 道藏自动归类 + 摘要（classify-daozang.mjs）

对已迁移的道藏内容（`app_source = 'daozang'`）批量回填：

- `daozang_category` — 山医命相卜五术分类（权威来源：c2.pub `doc_category`；
  API 不可达时按 slug 编号段 `docs/zh-cn/A_B_C` 的 `A_B` 兜底）
- `sort_weight` — 类内排序权重（slug 编号最后一节）
- `excerpt` — 清洗后的纯文本摘要（约 140 字，列表页直接展示）
- junk 页面与人工裁决的跨类重复条目（如中医类下重复的「滴天髓阐微」）转为 `draft`

```bash
# 预览（不写库）
DRY_RUN=1 CMS_DATABASE_URL=... node scripts/migrate-c2pub/classify-daozang.mjs

# 实际执行（幂等，可重复跑）
CMS_DATABASE_URL=... node scripts/migrate-c2pub/classify-daozang.mjs

# 无法访问 c2.pub 时仅用 slug 规则
SKIP_WP=1 CMS_DATABASE_URL=... node scripts/migrate-c2pub/classify-daozang.mjs
```

执行完输出每类篇数、slug 兜底数量、转 draft 与未归类清单。
`migrate-wp-content.mjs` 重跑时也会自动带上分类与摘要（新导入内容无需再跑本脚本）。

分类映射常量在 `lib/daozang-taxonomy.mjs`，与 `cms/src/collections/Pages.ts`、
`main/src/lib/daozang-taxonomy.ts` 三处一致，改动需同步。

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
- `title` / `slug` / `app_source`（发布栏目：`daozang` 道藏、`famous` 名人案例、`bazi` 等）
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
