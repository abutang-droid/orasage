# cms 部署说明（Payload CMS）

管理入口（两个后台，同域不同路径）：

| 后台 | 地址 | 用途 |
|------|------|------|
| **运营后台** | **https://admin.orasage.com** | 商品、订单、用户统计（需 `role=admin`） |
| **内容管理 CMS** | **https://admin.orasage.com/cms/admin** | Hero、页面、媒体、信息流 |

旧域名 `cms.orasage.com` 会自动重定向至上述地址。

当前 Collections：**Users**、**Media**、**Pages**、**Faiths**（宗教）、**Sanctuaries**（圣地，关联宗教自动匹配）。

塔罗祈福圣地数据在 **Sanctuaries**，通过 `faiths` 多选关联；部署后运行 `npm run seed:tarot` 导入初始 8 条圣地与 22 种宗教。

## VPS 一键部署

### 1. 创建 PostgreSQL 数据库

CMS 使用 **PostgreSQL**（与 auth/shop 同一实例，独立库 `orasage_cms`）。

```bash
# 查看 auth 用的数据库连接（复用同一 postgres 用户/密码）
grep DATABASE_URL /opt/orasage/.env
```

用 auth 的账号创建 CMS 库（把连接串里的库名换成 `postgres` 执行建库）：

```bash
# 示例：若 auth 为 postgresql://orasage:你的密码@127.0.0.1:5432/orasage_auth
psql "postgresql://orasage:你的密码@127.0.0.1:5432/postgres" -c "CREATE DATABASE orasage_cms;"
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

写入（**PAYLOAD_SECRET 单独生成，不要用 JWT_SECRET**；**JWT_SECRET 必须与 auth-service 相同**）：

```
NODE_ENV=production
PORT=3120
DATABASE_URL=postgresql://orasage:你的密码@127.0.0.1:5432/orasage_cms
PAYLOAD_SECRET=随机32位以上字符串
JWT_SECRET=与_auth-service_相同的密钥
JWT_COOKIE_NAME=orasage_token
CMS_BASE_PATH=/cms
NEXT_PUBLIC_SERVER_URL=https://admin.orasage.com/cms
NEXT_PUBLIC_AUTH_URL=https://auth.orasage.com
NEXT_PUBLIC_ADMIN_URL=https://admin.orasage.com
```

生成 PAYLOAD_SECRET：

```bash
openssl rand -hex 32
```

各消费 App 在根 `.env` 中配置：

```
CMS_INTERNAL_URL=http://127.0.0.1:3120/cms
CMS_PUBLIC_URL=https://admin.orasage.com/cms
```

### 3. 部署

```bash
sudo bash /opt/orasage/deploy/cms/deploy-cms.sh
```

### 4. 验证

```bash
curl -s -o /dev/null -w "cms admin → HTTP %{http_code}\n" http://127.0.0.1:3120/cms/admin
curl -s -o /dev/null -w "cms 公网封禁 → HTTP %{http_code}\n" https://cms.orasage.com/admin
curl -sI https://admin.orasage.com/cms/admin | head -3
sudo systemctl status orasage-cms
```

期望：`cms.orasage.com/admin` 重定向至 **admin.orasage.com/cms/admin**；`admin.orasage.com/cms/admin` 可访问。

### 5. 首次登录

浏览器打开 **https://admin.orasage.com/cms/admin**，按提示创建第一个管理员（邮箱 + 密码）。

之后可：
- 在 **Pages** 里新建内容（slug、appSource、富文本）
- 在 **Media** 上传图片
- 各 App 通过内网 `http://127.0.0.1:3120/cms/api/*` 读取内容

## 故障排查

```bash
sudo journalctl -u orasage-cms -n 50 --no-pager
```

常见问题：
- `DATABASE_URL` 连不上 → 检查 PostgreSQL 用户权限与库名 `orasage_cms`
- 构建内存不足 → VPS 至少 4GB 可用内存，或临时加 swap
- 502 → `systemctl restart orasage-cms` 并确认 Nginx 已配置 `admin.orasage.com/cms/` 反代
- 403 on admin → 确认 `CMS_BASE_PATH=/cms` 与 Nginx `proxy_pass` 路径一致

## 与统一登录的关系

当前 CMS 使用 **Payload 自带 Users 认证**，与 `auth.orasage.com` 独立。主站与各命理 App 通过内网 REST 读取公开内容；管理员经 `admin.orasage.com/cms` 登录后台。
