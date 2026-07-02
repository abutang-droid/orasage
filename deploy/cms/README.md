# cms 部署说明（Payload CMS）

管理后台地址：**https://cms.orasage.com/admin**

当前 Collections：**Users**（管理员）、**Media**（图片）、**Pages**（内容页，可按 `appSource` 区分 main/bazi/ziwei/tarot/shop）。

## VPS 一键部署

### 1. 创建 PostgreSQL 数据库

CMS 使用 **PostgreSQL**（与 auth/shop 同一实例，独立库 `orasage_cms`）。

```bash
# 查看 auth 用的数据库连接（复用同一 postgres 用户/密码）
grep DATABASE_URL /opt/orasage/.env
```

用 auth 的账号创建 CMS 库（把连接串末尾库名换成 `postgres` 执行建库）：

```bash
# 示例：若 auth 为 postgresql://orasage:你的密码@127.0.0.1:5432/orasage_auth
AUTH_URL=$(grep '^DATABASE_URL=' /opt/orasage/.env | cut -d= -f2- | tr -d "'\"")
BASE_URL=$(echo "$AUTH_URL" | sed -E 's|/[a-zA-Z0-9_]+(\?.*)?$|/postgres\1|')
psql "$BASE_URL" -c "CREATE DATABASE orasage_cms;"
```

或用 postgres 超级用户：

```bash
sudo -u postgres psql -c "CREATE DATABASE orasage_cms OWNER orasage;"
```

### 2. 配置 cms/.env

```bash
cd /opt/orasage
git pull origin main

cp cms/.env.example cms/.env
nano cms/.env
```

写入（**PAYLOAD_SECRET 单独生成，不要用 JWT_SECRET**）：

```bash
AUTH_URL=$(grep '^DATABASE_URL=' /opt/orasage/.env | cut -d= -f2- | tr -d "'\"")
CMS_DB_URL=$(echo "$AUTH_URL" | sed -E 's|/[a-zA-Z0-9_]+(\?.*)?$|/orasage_cms\1|')
openssl rand -hex 32   # 用作 PAYLOAD_SECRET
```

```
NODE_ENV=production
PORT=3120
DATABASE_URL=<上一步 CMS_DB_URL>
PAYLOAD_SECRET=<openssl 生成的随机串>
NEXT_PUBLIC_SERVER_URL=https://cms.orasage.com
```

生成 PAYLOAD_SECRET：

```bash
openssl rand -hex 32
```

### 3. 部署

```bash
sudo bash /opt/orasage/deploy/cms/deploy-cms.sh
```

### 4. 验证

```bash
curl -s -o /dev/null -w "cms admin → HTTP %{http_code}\n" http://127.0.0.1:3120/admin
curl -sI https://cms.orasage.com/admin | head -3
sudo systemctl status orasage-cms
```

### 5. 首次登录

浏览器打开 **https://cms.orasage.com/admin**，按提示创建第一个管理员（邮箱 + 密码）。

之后可：
- 在 **Pages** 里新建内容（slug、appSource、富文本）
- 在 **Media** 上传图片
- 通过 API 读取：`https://cms.orasage.com/api/pages`

## 故障排查

```bash
sudo journalctl -u orasage-cms -n 50 --no-pager
```

常见问题：
- `DATABASE_URL` 连不上 → 检查 PostgreSQL 用户权限与库名 `orasage_cms`
- 构建内存不足 → VPS 至少 4GB 可用内存，或临时加 swap
- 502 → `systemctl restart orasage-cms` 并确认 Nginx 已配置 `cms.orasage.com → 3120`

## 与统一登录的关系

当前 CMS 使用 **Payload 自带 Users 认证**，与 `auth.orasage.com` 独立。主站与各命理 App 通过 REST/GraphQL 读取公开内容；管理员只需登录 cms 后台即可。
